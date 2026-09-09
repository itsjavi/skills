#!/usr/bin/env python3
"""Read and update GameGen preferences using Python's standard library."""

import argparse
from contextlib import contextmanager
from copy import deepcopy
import json
import math
import os
from pathlib import Path, PurePosixPath
import tempfile

PLUGIN = Path(__file__).resolve().parents[1]
RELATIVE_PREFS = Path('.agents/gamegen-prefs.json')
SECTIONS = ('game', 'presentation', 'art', 'platforms', 'input', 'generation',
            'budget', 'features', 'workflow', 'paths')


def load(path):
    def pairs(values):
        result = {}
        for key, value in values:
            if key in result:
                raise ValueError('Duplicate JSON key: ' + key)
            result[key] = value
        return result

    def constant(value):
        raise ValueError('Non-finite JSON value: ' + value)

    return json.loads(Path(path).read_text(encoding='utf-8'),
                      object_pairs_hook=pairs, parse_constant=constant)


def schema_errors(value, schema, path='$'):
    """Validate the structural keywords used by the bundled v1 schema.

    This is deliberately not a general JSON Schema implementation. Unsupported
    keywords fail so a future schema cannot silently weaken validation.
    """
    supported = {'$schema', 'title', 'description', 'type', 'properties', 'required',
                 'additionalProperties', 'items', 'minItems', 'uniqueItems',
                 'minLength', 'enum', 'const', 'minimum', 'maximum'}
    unknown = set(schema) - supported
    if unknown:
        raise ValueError('Unsupported schema keywords: ' + ', '.join(sorted(unknown)))
    errors = []
    if 'const' in schema and (type(value) is not type(schema['const']) or value != schema['const']):
        errors.append(path + ': unsupported value or schema version')
    if 'enum' in schema and not any(type(value) is type(v) and value == v for v in schema['enum']):
        errors.append(path + ': choose an allowed value')
    matches = {'object': isinstance(value, dict), 'array': isinstance(value, list),
               'string': isinstance(value, str), 'boolean': type(value) is bool,
               'integer': type(value) is int, 'number': type(value) in (int, float),
               'null': value is None}
    kinds = schema.get('type', [])
    kinds = [kinds] if isinstance(kinds, str) else kinds
    if kinds and not any(matches[kind] for kind in kinds):
        return errors + [path + ': expected ' + ' or '.join(kinds)]
    if isinstance(value, dict):
        properties = schema.get('properties', {})
        errors.extend(path + '.' + key + ': required' for key in schema.get('required', []) if key not in value)
        if schema.get('additionalProperties') is False:
            errors.extend(path + '.' + key + ': unknown field' for key in value if key not in properties)
        for key in value.keys() & properties.keys():
            errors.extend(schema_errors(value[key], properties[key], path + '.' + key))
    if isinstance(value, list):
        if len(value) < schema.get('minItems', 0):
            errors.append(path + ': too few items')
        if schema.get('uniqueItems') and len({json.dumps(v, sort_keys=True) for v in value}) != len(value):
            errors.append(path + ': duplicate items')
        for i, item in enumerate(value):
            errors.extend(schema_errors(item, schema.get('items', {}), path + '[' + str(i) + ']'))
    if isinstance(value, str) and len(value.strip()) < schema.get('minLength', 0):
        errors.append(path + ': must not be blank')
    if type(value) in (int, float):
        if not math.isfinite(value):
            errors.append(path + ': must be finite')
        if value < schema.get('minimum', -math.inf) or value > schema.get('maximum', math.inf):
            errors.append(path + ': outside permitted range')
    return errors


def at(data, path):
    for part in path.split('.'):
        if not isinstance(data, dict) or part not in data:
            return None
        data = data[part]
    return data


def relative_path(value):
    return (isinstance(value, str) and bool(value.strip()) and '\\' not in value
            and ':' not in value and not PurePosixPath(value).is_absolute()
            and all(part not in ('..', '.') for part in value.split('/')))


def validate(data, ready=False):
    errors = schema_errors(data, load(PLUGIN / 'schemas/gamegen-prefs.schema.json'))
    if errors:
        return errors
    for key, value in data['paths'].items():
        if not relative_path(value):
            errors.append('paths.' + key + ': must be a project-relative path without traversal')
    if not relative_path(data['art']['direction_doc']):
        errors.append('art.direction_doc: must be a project-relative path')
    p = data['presentation']
    if len(p['viewport']) != 2:
        errors.append('presentation.viewport: exactly two dimensions required')
    if p['dimension'] == '2d' and p['simulation'] not in (None, '2d'):
        errors.append('presentation.simulation: 2D presentation requires 2D simulation; use 2.5d for a hybrid')
    if p['dimension'] == '3d' and p['rendering'] not in (None, 'meshes'):
        errors.append('presentation.rendering: use 2.5d for hybrid rendering')
    if p['dimension'] == '3d' and p['simulation'] not in (None, '3d'):
        errors.append('presentation.simulation: 3D presentation requires 3D simulation; use 2.5d for a hybrid')
    if p['dimension'] == '2d' and p['rendering'] not in (None, 'sprites', 'tiles'):
        errors.append('presentation.rendering: select sprites or tiles for pure 2D')
    if p['rendering'] == 'sprites-in-3d' and p['simulation'] not in (None, '3d'):
        errors.append('presentation.simulation: sprites-in-3d requires a 3D world; constrain movement in gameplay')
    if p['rendering'] == '3d-rendered-sprites' and p['simulation'] not in (None, '2d'):
        errors.append('presentation.simulation: rendered sprite sheets use the 2D runtime path')
    for purpose, route in data['generation']['routes'].items():
        for candidate in [route] + route['fallbacks']:
            if candidate['provider'] == 'higgsfield' and not data['generation']['higgsfield']['enabled']:
                errors.append('generation.routes.' + purpose + ': Higgsfield route conflicts with disabled policy')
    if data['workflow']['delivery'] in ('device', 'store') and data['workflow']['signing'] == 'deferred':
        if 'ios' in data['platforms']['targets'] or 'macos' in data['platforms']['targets']:
            errors.append('workflow.signing: Apple device/store delivery requires configured signing')
    if not ready and data['setup']['status'] != 'ready':
        return errors
    pending = set(SECTIONS) - set(data['setup']['confirmed_sections'])
    errors.extend('setup.confirmed_sections: unresolved ' + group for group in sorted(pending))
    required = ['game.title', 'game.description', 'game.goal', 'game.genre', 'game.audience',
                'game.scope.deliverable', 'game.scope.content', 'presentation.dimension',
                'presentation.rendering', 'presentation.simulation', 'presentation.camera',
                'art.style', 'art.lighting', 'platforms.minimum_device',
                'platforms.engine_version', 'platforms.renderer']
    for target in data['platforms']['targets']:
        required.append('platforms.minimum_os.' + target)
    if p['rendering'] == 'tiles' or p['tile_grid'] is not None:
        required += ['presentation.tile_grid', 'presentation.tile_size']
    if p['rendering'] in ('sprites', 'sprites-in-3d', '3d-rendered-sprites') or (
        p['rendering'] == 'tiles' and p['sprite_directions'] is not None
    ):
        required += ['presentation.sprite_directions', 'art.asset_budgets.sprite_frame_px']
    if p['rendering'] in ('meshes', 'sprites-in-3d', '3d-rendered-sprites'):
        required += ['presentation.units', 'presentation.forward_axis', 'art.asset_budgets.hero_triangles',
                     'art.asset_budgets.materials_per_actor', 'art.asset_budgets.texture_max_px']
    errors.extend(path + ': resolve before production' for path in required if at(data, path) is None)
    if not data['game']['scope']['features']:
        errors.append('game.scope.features: specify the included gameplay')
    if not data['art']['required_views']:
        errors.append('art.required_views: specify the applicable review views')
    # These can be deliberately outside the delivery's scope, but never silently missing.
    for path in ('game.scope.playtime_minutes', 'platforms.memory_budget_mb'):
        if at(data, path) is None and path not in data['setup']['deferred']:
            errors.append(path + ': resolve or explicitly defer during intake')
    for path in data['setup']['deferred']:
        if path not in ('game.scope.playtime_minutes', 'platforms.memory_budget_mb', 'workflow.signing'):
            errors.append('setup.deferred: unsupported deferral ' + path)
    if data['workflow']['autonomy'] == 'unattended' and (
        data['workflow']['concept_review'] == 'user' or data['workflow']['asset_review'] == 'user'
    ):
        errors.append('workflow: uninterrupted unattended mode requires agent review; select assisted for user checkpoints')
    return errors


def project_root(value, initialize=False):
    candidate = Path(value).expanduser().resolve()
    if not candidate.is_dir():
        raise ValueError('Project directory must already exist')
    if candidate == PLUGIN or PLUGIN in candidate.parents:
        raise ValueError('Point --project at a game repository, not the plugin package')
    if initialize:
        return candidate
    for directory in (candidate, *candidate.parents):
        if (directory / RELATIVE_PREFS).exists():
            return directory
        if (directory / '.git').exists():
            break
    raise ValueError('No project preferences found; use game-bootstrap to resolve intake')


def prefs_path(project):
    result = project / RELATIVE_PREFS
    if not result.resolve().is_relative_to(project):
        raise ValueError('Preferences must stay inside the selected project')
    return result


@contextmanager
def locked(project):
    path = prefs_path(project)
    path.parent.mkdir(parents=True, exist_ok=True)
    lock = path.with_suffix('.lock')
    try:
        descriptor = os.open(lock, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    except FileExistsError:
        raise ValueError('Another preferences writer holds the lock; reconcile before retrying') from None
    try:
        with os.fdopen(descriptor, 'w') as stream:
            stream.write(str(os.getpid()))
        yield path
    finally:
        lock.unlink()


def atomic_write(path, data):
    name = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=path.parent,
                                         prefix='.gamegen-', suffix='.json', delete=False) as stream:
            name = Path(stream.name)
            json.dump(data, stream, indent=2, ensure_ascii=False, allow_nan=False)
            stream.write('\n')
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(name, path)
    finally:
        if name and name.exists():
            name.unlink()


def merge(original, patch):
    result = deepcopy(original)
    for key, value in patch.items():
        if isinstance(value, dict) and isinstance(result.get(key), dict):
            result[key] = merge(result[key], value)
        else:
            result[key] = deepcopy(value)
    return result


def update(project, patch, expected_revision, confirmed=(), deferred=(), finalize=False):
    with locked(project) as path:
        data = load(path)
        problems = validate(data)
        if problems:
            raise ValueError('; '.join(problems))
        if data['setup']['revision'] != expected_revision:
            raise ValueError('Stale preferences revision; read current preferences and reconcile changes')
        if not isinstance(patch, dict) or set(patch) - set(SECTIONS):
            raise ValueError('Answers must contain known preference sections only')
        data = merge(data, patch)
        confirmed_now = set(data['setup']['confirmed_sections']) - set(patch)
        data['setup']['confirmed_sections'] = sorted(confirmed_now | set(confirmed))
        data['setup']['deferred'] = sorted(set(data['setup']['deferred']) | set(deferred))
        data['setup']['status'] = 'ready' if finalize else 'draft'
        data['setup']['revision'] += 1
        problems = validate(data, ready=finalize)
        if problems:
            raise ValueError('; '.join(problems))
        atomic_write(path, data)
        return data


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['init', 'read', 'questions', 'apply', 'finalize', 'validate'])
    parser.add_argument('--project', required=True, help='Explicit game project directory')
    parser.add_argument('--answers', type=Path, help='JSON object containing submitted answers or existing user decisions')
    parser.add_argument('--confirm', action='append', choices=SECTIONS, default=[])
    parser.add_argument('--defer', action='append', default=[])
    parser.add_argument('--expected-revision', type=int)
    parser.add_argument('--ready', action='store_true', help='Check production readiness as well as structure')
    args = parser.parse_args()
    try:
        project = project_root(args.project, initialize=args.command == 'init')
        path = prefs_path(project)
        if args.command == 'init':
            with locked(project) as destination:
                if destination.exists():
                    raise ValueError('Preferences already exist; read and update them instead')
                data = load(PLUGIN / 'templates/gamegen-prefs.json')
                atomic_write(destination, data)
        elif args.command in ('apply', 'finalize'):
            if args.expected_revision is None:
                raise ValueError('--expected-revision is required for changes')
            if args.command == 'apply' and not args.answers:
                raise ValueError('--answers is required for apply')
            data = update(project, load(args.answers) if args.answers else {},
                          args.expected_revision, args.confirm, args.defer, args.command == 'finalize')
        else:
            data = load(path)
        errors = validate(data, ready=args.ready)
        if errors:
            raise ValueError('; '.join(errors))
        if args.command == 'questions':
            output = {'questions': [q for q in load(PLUGIN / 'references/intake.json')
                                    if q['section'] not in data['setup']['confirmed_sections']],
                      'readiness_errors': validate(data, ready=True)}
        else:
            output = {'path': str(path), 'ready': data['setup']['status'] == 'ready', 'prefs': data}
        print(json.dumps(output, ensure_ascii=False, allow_nan=False))
    except (OSError, ValueError, TypeError) as error:
        print(json.dumps({'error': str(error)}))
        raise SystemExit(2) from None


if __name__ == '__main__':
    main()
