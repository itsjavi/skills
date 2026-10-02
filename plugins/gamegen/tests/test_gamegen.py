import ast
import concurrent.futures
from copy import deepcopy
import json
from pathlib import Path
import shutil
import struct
import subprocess
import sys
import tempfile
import unittest
import zlib

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import asset_audit
import prefs


def resolved(mode='3d'):
    data = prefs.load(ROOT / 'templates/gamegen-prefs.json')
    data['setup']['confirmed_sections'] = list(prefs.SECTIONS)
    data['game'].update(title='Test game', description='A short exploration puzzle.',
                        goal='Restore a signal.', genre='puzzle', audience='general')
    data['game']['scope'].update(deliverable='playable slice', features=['explore', 'solve'],
                                content='one room and one puzzle', playtime_minutes=5)
    data['presentation'].update(dimension=mode, rendering='meshes', simulation='3d',
                                camera='three-quarter', units='meters', forward_axis='+Z')
    data['art'].update(style='painted miniature', lighting='soft key with cool fill')
    data['art']['asset_budgets'].update(hero_triangles=12000, materials_per_actor=3, texture_max_px=1024)
    data['platforms'].update(minimum_device='test device', engine_version='4.7.2', renderer='mobile', memory_budget_mb=512)
    data['platforms']['minimum_os'].update(macos='26', ios='26')
    if mode == '2d':
        data['presentation'].update(rendering='tiles', simulation='2d', camera='topdown', pixel_art=True,
                                    tile_grid='square', tile_size=32, sprite_directions=4)
        data['art']['asset_budgets']['sprite_frame_px'] = 32
    if mode == '2.5d':
        data['presentation'].update(rendering='sprites-in-3d', sprite_directions=8)
        data['art']['asset_budgets']['sprite_frame_px'] = 128
    return data


def png(path, width, height):
    def chunk(kind, value):
        return struct.pack('>I', len(value)) + kind + value + struct.pack('>I', zlib.crc32(kind + value))
    header = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    pixels = b''.join(b'\0' + bytes([0, 128, 255, 255]) * width for _ in range(height))
    path.write_bytes(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', header) + chunk(b'IDAT', zlib.compress(pixels)) + chunk(b'IEND', b''))


class PreferencesTest(unittest.TestCase):
    def test_draft_is_not_ready(self):
        data = prefs.load(ROOT / 'templates/gamegen-prefs.json')
        self.assertEqual(prefs.validate(data), [])
        self.assertTrue(prefs.validate(data, ready=True))
        self.assertEqual(data['setup']['confirmed_sections'], [])

    def test_three_presentation_modes(self):
        for mode in ('2d', '2.5d', '3d'):
            with self.subTest(mode=mode):
                self.assertEqual(prefs.validate(resolved(mode), ready=True), [])

    def test_square_viewport(self):
        data = resolved('2d')
        data['presentation']['viewport'] = [720, 720]
        self.assertEqual(prefs.validate(data, ready=True), [])

    def test_required_game_identity(self):
        for field in ('title', 'description', 'goal'):
            data = resolved()
            data['game'][field] = None
            self.assertTrue(any('game.' + field in error for error in prefs.validate(data, ready=True)))

    def test_conditional_tile_and_sprite_fields(self):
        data = resolved('2d')
        data['presentation']['tile_size'] = None
        self.assertTrue(any('tile_size' in error for error in prefs.validate(data, ready=True)))
        data = resolved('2.5d')
        data['presentation']['sprite_directions'] = None
        self.assertTrue(any('sprite_directions' in error for error in prefs.validate(data, ready=True)))

    def test_hybrid_simulation_contract(self):
        data = resolved('2d')
        data['presentation']['simulation'] = '3d'
        self.assertTrue(prefs.validate(data))

    def test_3d_simulation_contract(self):
        data = resolved('3d')
        data['presentation']['simulation'] = '2d'
        self.assertTrue(any('presentation.simulation' in error for error in prefs.validate(data)))

    def test_tiles_without_sprites(self):
        data = resolved('2d')
        data['presentation']['sprite_directions'] = None
        data['art']['asset_budgets']['sprite_frame_px'] = None
        self.assertEqual(prefs.validate(data, ready=True), [])

    def test_tiles_with_sprites_need_frame_size(self):
        data = resolved('2d')
        data['art']['asset_budgets']['sprite_frame_px'] = None
        self.assertTrue(any('sprite_frame_px' in error for error in prefs.validate(data, ready=True)))

    def test_negative_or_boolean_budget(self):
        for invalid in (-1, True):
            data = resolved()
            data['budget']['cash_limit'] = invalid
            self.assertTrue(prefs.validate(data))

    def test_disabled_paid_route(self):
        data = resolved()
        data['generation']['routes']['concepts']['fallbacks'] = [
            {'provider': 'higgsfield', 'model': 'provider-default', 'quality': 'high'}]
        self.assertTrue(prefs.validate(data))

    def test_unknown_fields_and_schema(self):
        data = resolved()
        data['generation']['api_key'] = 'not-a-real-key'
        self.assertTrue(prefs.validate(data))
        data = resolved()
        data['schema_version'] = 2
        self.assertTrue(prefs.validate(data))

    def test_path_traversal(self):
        for bad in ('../outside', '/tmp/game', 'C:\\game', 'game/../../elsewhere'):
            data = resolved()
            data['paths']['game'] = bad
            self.assertTrue(prefs.validate(data))

    def test_deliberate_deferral(self):
        data = resolved()
        data['platforms']['memory_budget_mb'] = None
        self.assertTrue(prefs.validate(data, ready=True))
        data['setup']['deferred'] = ['platforms.memory_budget_mb']
        self.assertEqual(prefs.validate(data, ready=True), [])

    def test_unattended_review_policy(self):
        data = resolved()
        data['workflow']['autonomy'] = 'unattended'
        self.assertTrue(prefs.validate(data, ready=True))
        data['workflow'].update(concept_review='agent', asset_review='agent')
        self.assertEqual(prefs.validate(data, ready=True), [])

    def test_signing_stage(self):
        data = resolved()
        data['workflow']['delivery'] = 'device'
        self.assertTrue(prefs.validate(data))


class PersistenceTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix='gamegen-test-')
        self.project = Path(self.directory.name).resolve()
        self.path = self.project / prefs.RELATIVE_PREFS
        self.path.parent.mkdir()
        prefs.atomic_write(self.path, prefs.load(ROOT / 'templates/gamegen-prefs.json'))

    def tearDown(self):
        self.directory.cleanup()

    def test_apply_finalize_and_readback(self):
        data = resolved()
        patch = {section: data[section] for section in prefs.SECTIONS}
        output = prefs.update(self.project, patch, 0, prefs.SECTIONS)
        self.assertEqual(output['setup']['status'], 'draft')
        ready = prefs.update(self.project, {}, 1, finalize=True)
        self.assertEqual(ready['setup']['status'], 'ready')
        self.assertEqual(prefs.load(self.path), ready)
        changed = prefs.update(self.project, {'game': {'title': 'A new title'}}, 2)
        self.assertEqual(changed['setup']['status'], 'draft')
        self.assertNotIn('game', changed['setup']['confirmed_sections'])
        self.assertEqual(changed['game']['goal'], data['game']['goal'])

    def test_rejected_patch_preserves_file(self):
        before = self.path.read_bytes()
        with self.assertRaises(ValueError):
            prefs.update(self.project, {'budget': {'cash_limit': -1}}, 0)
        self.assertEqual(self.path.read_bytes(), before)
        self.assertFalse(self.path.with_suffix('.lock').exists())

    def test_stale_writer_preserves_first_update(self):
        prefs.update(self.project, {'game': {'title': 'First'}}, 0)
        with self.assertRaisesRegex(ValueError, 'Stale'):
            prefs.update(self.project, {'game': {'title': 'Second'}}, 0)
        self.assertEqual(prefs.load(self.path)['game']['title'], 'First')

    def test_concurrent_writers_do_not_lose_updates(self):
        def write(title):
            try:
                prefs.update(self.project, {'game': {'title': title}}, 0)
                return True
            except ValueError:
                return False
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(write, ('A', 'B')))
        self.assertEqual(sum(results), 1)
        self.assertEqual(prefs.load(self.path)['setup']['revision'], 1)

    def test_nested_root_discovery(self):
        child = self.project / 'game' / 'levels'
        child.mkdir(parents=True)
        self.assertEqual(prefs.project_root(child), self.project)

    def test_repository_boundary(self):
        child = self.project / 'other'
        child.mkdir()
        (child / '.git').mkdir()
        with self.assertRaisesRegex(ValueError, 'No project'):
            prefs.project_root(child)

    def test_plugin_is_not_a_game(self):
        with self.assertRaisesRegex(ValueError, 'plugin'):
            prefs.project_root(ROOT, initialize=True)

    def test_external_preferences_symlink(self):
        self.path.unlink()
        with tempfile.TemporaryDirectory() as other:
            outside = Path(other) / 'prefs.json'
            outside.write_text('{}')
            self.path.symlink_to(outside)
            with self.assertRaisesRegex(ValueError, 'inside'):
                prefs.prefs_path(self.project)

    def test_invalid_json_values(self):
        for source in ('{"a":1,"a":2}', '{"a":NaN}'):
            self.path.write_text(source)
            with self.assertRaises(ValueError):
                prefs.load(self.path)

    def test_cli_questions_and_incomplete_finalization(self):
        command = [sys.executable, str(ROOT / 'scripts/prefs.py')]
        result = subprocess.run(command + ['questions', '--project', str(self.project)], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0)
        self.assertEqual(len(json.loads(result.stdout)['questions']), len(prefs.SECTIONS))
        before = self.path.read_bytes()
        result = subprocess.run(command + ['finalize', '--project', str(self.project), '--expected-revision', '0'], capture_output=True, text=True)
        self.assertEqual(result.returncode, 2)
        self.assertEqual(self.path.read_bytes(), before)


class AssetAuditTest(unittest.TestCase):
    def test_multirow_sheet_and_bounds(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'sheet.png'
            png(path, 128, 64)
            report = asset_audit.audit(path, (32, 32), 7, 4)
            self.assertEqual(report['frames']['rows'], 2)
            self.assertEqual(report['frames']['unused_cells'], 1)
            self.assertTrue(report['alpha_channel'])
            self.assertFalse(report['transparency_pixels_verified'])
            for size, count in (((30, 32), 7), ((32, 32), 9)):
                with self.assertRaises(ValueError):
                    asset_audit.audit(path, size, count)

    def test_glb_geometry_and_clip_duration(self):
        model = {'asset': {'version': '2.0'}, 'accessors': [{'count': 6}, {'count': 3, 'min': [0.0], 'max': [0.5]}],
                 'meshes': [{'primitives': [{'indices': 0}]}], 'materials': [{}],
                 'skins': [{'joints': [0, 1, 2]}],
                 'animations': [{'name': 'Walk', 'samplers': [{'input': 1}]}]}
        data = json.dumps(model).encode()
        data += b' ' * (-len(data) % 4)
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'model.glb'
            path.write_bytes(struct.pack('<4sIII4s', b'glTF', 2, 20+len(data), len(data), b'JSON') + data)
            report = asset_audit.audit(path)
            self.assertEqual(report['unique_mesh_triangles'], 2)
            self.assertEqual(report['skins'][0]['joints'], 3)
            self.assertEqual(report['clips'][0]['duration_seconds'], 0.5)
            path.write_bytes(path.read_bytes()[:-1])
            with self.assertRaises(ValueError):
                asset_audit.audit(path)


AUDIO = ROOT / 'skills/game-audio-procedural'


def sfx_ids(source):
    """Asset ids registered with @sfx(...) in a recipe module, expanding round-robin variants."""
    ids = []
    for node in ast.walk(ast.parse(source)):
        for deco in getattr(node, 'decorator_list', []):
            if isinstance(deco, ast.Call) and getattr(deco.func, 'id', None) == 'sfx':
                name = deco.args[0].value
                variants = next((k.value.value for k in deco.keywords if k.arg == 'variants'), 1)
                ids += [f'sfx/{name}'] if variants <= 1 else [f'sfx/{name}_{i + 1}' for i in range(variants)]
    return ids


def assigned(source, name):
    """Value node of a top-level `name = ...` or `name: T = ...` assignment."""
    for node in ast.parse(source).body:
        targets = node.targets if isinstance(node, ast.Assign) else [getattr(node, 'target', None)]
        if any(getattr(target, 'id', None) == name for target in targets):
            return node.value
    raise AssertionError(f'{name} is not assigned')


class ProceduralAudioTest(unittest.TestCase):
    def test_toolkit_sources_compile(self):
        for path in sorted(AUDIO.rglob('*.py')):
            with self.subTest(path=path.relative_to(AUDIO)):
                compile(path.read_text(), str(path), 'exec')

    def test_project_registries_start_empty(self):
        self.assertEqual(sfx_ids((AUDIO / 'scripts/sfx.py').read_text()), [])
        tracks = assigned((AUDIO / 'scripts/music/__init__.py').read_text(), 'TRACKS')
        self.assertEqual(ast.literal_eval(tracks), {})

    def test_copy_guard_covers_every_example(self):
        expected = set(sfx_ids((AUDIO / 'examples/sfx_examples.py').read_text()))
        tracks = assigned((AUDIO / 'examples/render_examples.py').read_text(), 'TRACKS')
        expected |= {f'music/{key.value}' for key in tracks.keys}
        hashes = json.loads((AUDIO / 'scripts/example_hashes.json').read_text())
        self.assertEqual(set(hashes), expected)

    @unittest.skipUnless(shutil.which('uv'), 'uv is required to run the numpy toolkit')
    def test_build_records_and_rejects_example_copies(self):
        with tempfile.TemporaryDirectory(prefix='gamegen-audio-') as folder:
            project = Path(folder)
            tools = project / 'tools/audio'
            shutil.copytree(AUDIO / 'scripts', tools)
            sfx = tools / 'sfx.py'
            sfx.write_text(sfx.read_text() + (
                '\n\n@sfx("blip", -16, notes="Test cue.")\n'
                'def blip():\n'
                '    n = samples(0.1)\n'
                '    return STYLE.finish(synth.sine(STYLE.tone(5), n) * _env(n, 0.001, 0.1))\n'))
            command = ['uv', 'run', '--quiet', str(tools / 'build.py'), '--project-manifest', 'art_source/manifest.json']
            result = subprocess.run(command, cwd=project, capture_output=True, text=True, timeout=600)
            self.assertEqual(result.returncode, 0, result.stderr)
            record = json.loads((project / 'art_source/manifest.json').read_text())['assets'][0]
            self.assertEqual((record['id'], record['provider'], record['review']), ('audio/sfx/blip', 'local', 'draft'))
            self.assertTrue((project / record['files'][0]['path']).exists())
            self.assertEqual(record['source'], 'sfx.py#blip')

            examples = (AUDIO / 'examples/sfx_examples.py').read_text()
            whoosh = examples[examples.index('def _whoosh('):examples.index('def _thump(')]
            jump = examples[examples.index('@sfx("jump"'):examples.index('@sfx("land"')]
            sfx.write_text(sfx.read_text() + '\n\n' + whoosh + jump)
            result = subprocess.run(command + ['--only', 'jump'], cwd=project, capture_output=True, text=True,
                                    timeout=600)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('unmodified copies', result.stderr)


if __name__ == '__main__':
    unittest.main()
