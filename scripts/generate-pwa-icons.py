"""Rasterize the existing orthogonal pixel mark using only Python's standard library."""
from pathlib import Path
import re
import struct
import xml.etree.ElementTree as ET
import zlib

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "frontend/src/app/icon.svg"
OUTPUT = ROOT / "frontend/public/icons"


def polygons(data):
    # Fail if the orthogonal mark gains other commands.
    if re.search(r"[A-Za-z]", re.sub(r"[MmHhVvz]", "", data)):
        raise ValueError("Unsupported mark command; review the icon generator")
    tokens = iter(re.findall(r"[MmHhVvz]|-?\d+", data))
    x = y = 0
    parts = []
    points = []
    for token in tokens:
        if token in ("M", "m"):
            a, b = int(next(tokens)), int(next(tokens))
            x, y = (a, b) if token == "M" else (x + a, y + b)
            points = [(x, y)]
        elif token in ("h", "H"):
            value = int(next(tokens))
            x = x + value if token == "h" else value
            points.append((x, y))
        elif token in ("v", "V"):
            value = int(next(tokens))
            y = y + value if token == "v" else value
            points.append((x, y))
        elif token == "z":
            parts.append(points)
            x, y = points[0]
        else:
            raise ValueError(f"Unsupported token {token}")
    return parts


def inside(parts, x, y):
    winding = 0
    for points in parts:
        for a, b in zip(points, points[1:] + points[:1]):
            cross = (b[0] - a[0]) * (y - a[1]) - (x - a[0]) * (b[1] - a[1])
            if a[1] <= y < b[1] and cross > 0:
                winding += 1
            elif b[1] <= y < a[1] and cross < 0:
                winding -= 1
    return winding != 0


def chunk(kind, data):
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data))


def generate():
    layers = []
    for element in ET.parse(SOURCE).getroot():
        if element.tag.endswith("path"):
            color = bytes.fromhex(element.attrib["fill"].removeprefix("#"))
            layers.append((polygons(element.attrib["d"]), color))
    background = bytes.fromhex("070a12")
    mark = [[background for _ in range(64)] for _ in range(64)]
    for y in range(64):
        for x in range(64):
            for parts, color in layers:
                if inside(parts, x + .5, y + .5):
                    mark[y][x] = color
    OUTPUT.mkdir(exist_ok=True)
    for name, size, area in [("icon-192", 192, 80), ("icon-512", 512, 80),
                              ("maskable-512", 512, 112), ("apple-touch-icon", 180, 80)]:
        # Maskable mark fits entirely within the central circular safe zone.
        raw = bytearray()
        offset = (area - 64) // 2
        for y in range(size):
            raw.append(0)
            for x in range(size):
                mx, my = x * area // size - offset, y * area // size - offset
                raw.extend(mark[my][mx] if 0 <= mx < 64 and 0 <= my < 64 else background)
        header = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
        png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
        (OUTPUT / f"{name}.png").write_bytes(png)


if __name__ == "__main__":
    generate()
