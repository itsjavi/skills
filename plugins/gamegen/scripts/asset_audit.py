#!/usr/bin/env python3
"""Read GLB or PNG structure and optional sprite layout without importing an engine."""

import argparse
import hashlib
import json
from pathlib import Path
import struct


def audit(path, frame_size=None, frame_count=None, columns=None):
    path = Path(path)
    raw = path.read_bytes()
    report = {'file': path.name, 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest(),
              'boundary': 'Structural metadata only; inspect visual quality and playback in the engine.'}
    if path.suffix.lower() == '.png':
        if len(raw) < 33 or raw[:8] != b'\x89PNG\r\n\x1a\n' or raw[12:16] != b'IHDR':
            raise ValueError('Not a PNG with an IHDR header')
        width, height, depth, color, _, _, _ = struct.unpack('>IIBBBBB', raw[16:29])
        if width < 1 or height < 1:
            raise ValueError('PNG dimensions must be positive')
        report.update(format='png', width=width, height=height, bit_depth=depth,
                      alpha_channel=color in (4, 6), transparency_pixels_verified=False)
        if frame_size is not None:
            fw, fh = frame_size
            if fw < 1 or fh < 1 or width % fw or height % fh:
                raise ValueError('Frame dimensions must divide the full sheet; use explicit metadata for trimmed or padded atlases')
            actual_columns, rows = width // fw, height // fh
            if columns is not None and columns != actual_columns:
                raise ValueError('Declared columns do not match sheet dimensions')
            if frame_count is None or frame_count < 1 or frame_count > actual_columns * rows:
                raise ValueError('Frame count must fit inside the declared grid')
            report['frames'] = {'width': fw, 'height': fh, 'count': frame_count,
                                'columns': actual_columns, 'rows': rows,
                                'unused_cells': actual_columns * rows - frame_count}
        elif frame_count is not None or columns is not None:
            raise ValueError('Provide --frame-size with frame count or columns')
    elif path.suffix.lower() == '.glb':
        if len(raw) < 20:
            raise ValueError('Truncated GLB')
        magic, version, length = struct.unpack('<4sII', raw[:12])
        if magic != b'glTF' or version != 2 or length != len(raw):
            raise ValueError('Invalid GLB v2 header or byte length')
        size, kind = struct.unpack('<I4s', raw[12:20])
        if kind != b'JSON' or size % 4 or size + 20 > length:
            raise ValueError('Invalid GLB JSON chunk')
        model = json.loads(raw[20:20+size])
        if model.get('asset', {}).get('version') != '2.0':
            raise ValueError('Expected glTF 2.0 asset metadata')
        accessors = model.get('accessors', [])
        triangles = surfaces = 0
        for mesh in model.get('meshes', []):
            for primitive in mesh.get('primitives', []):
                surfaces += 1
                accessor = primitive.get('indices', primitive.get('attributes', {}).get('POSITION'))
                count = accessors[accessor]['count'] if accessor is not None else 0
                mode = primitive.get('mode', 4)
                if mode == 4:
                    triangles += count // 3
                elif mode in (5, 6):
                    triangles += max(0, count - 2)
        clips = []
        for animation in model.get('animations', []):
            starts, ends = [], []
            for sampler in animation.get('samplers', []):
                accessor = accessors[sampler['input']]
                if 'min' in accessor and 'max' in accessor:
                    starts.append(accessor['min'][0])
                    ends.append(accessor['max'][0])
            clips.append({'name': animation.get('name'),
                          'duration_seconds': max(ends) - min(starts) if starts else None})
        report.update(format='glb', unique_mesh_triangles=triangles, surfaces=surfaces,
                      materials=len(model.get('materials', [])),
                      skins=[{'name': skin.get('name'), 'joints': len(skin.get('joints', []))}
                             for skin in model.get('skins', [])], clips=clips)
    else:
        raise ValueError('Supported audit formats are .png and .glb')
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('asset', type=Path)
    parser.add_argument('--frame-size', type=int, nargs=2, metavar=('WIDTH', 'HEIGHT'))
    parser.add_argument('--frame-count', type=int)
    parser.add_argument('--columns', type=int)
    args = parser.parse_args()
    try:
        print(json.dumps(audit(args.asset, args.frame_size, args.frame_count, args.columns), indent=2))
    except (OSError, ValueError, KeyError, IndexError, TypeError, struct.error) as error:
        print(json.dumps({'error': str(error)}))
        raise SystemExit(2) from None


if __name__ == '__main__':
    main()
