#!/usr/bin/env python3
"""
PNG to WebP Converter
Converts PNG images to WebP format for reduced file size.
Simple version for converting all PNG files in a directory.
"""

import os
import sys
from pathlib import Path
from PIL import Image


def png_to_webp(input_path, output_path=None, quality=85):
    """
    Convert a PNG image to WebP format.

    Args:
        input_path: Path to the input PNG file
        output_path: Path for the output WebP file (optional)
        quality: WebP quality (0-100, default 85)

    Returns:
        Path to the output WebP file
    """
    input_path = Path(input_path)

    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")

    if input_path.suffix.lower() != '.png':
        raise ValueError(f"Input must be a PNG file: {input_path}")

    if output_path is None:
        output_path = input_path.with_suffix('.webp')
    else:
        output_path = Path(output_path)

    # Open and convert
    with Image.open(input_path) as img:
        img.save(output_path, 'webp', quality=quality)

    # Show size reduction
    original_size = input_path.stat().st_size
    new_size = output_path.stat().st_size
    reduction = (1 - new_size / original_size) * 100

    print(f"Converted: {input_path.name} -> {output_path.name}")
    print(f"  Original: {original_size:,} bytes")
    print(f"  WebP:     {new_size:,} bytes")
    print(f"  Reduced:  {reduction:.1f}%")

    return output_path


def convert_directory(input_dir, quality=85, keep_originals=True):
    """
    Convert all PNG files in a directory to WebP format.

    Args:
        input_dir: Directory containing PNG files
        quality: WebP quality (0-100, default 85)
        keep_originals: If True, keep original PNG files; if False, delete them
    """
    input_dir = Path(input_dir)

    if not input_dir.is_dir():
        raise NotADirectoryError(f"Directory not found: {input_dir}")

    # Find all PNG files
    png_files = list(input_dir.glob('*.png'))

    if not png_files:
        print(f"No PNG files found in {input_dir}")
        return

    print(f"Converting {len(png_files)} PNG files in {input_dir}...")
    print(f"Quality: {quality}")
    print(f"Keep originals: {keep_originals}")
    print("-" * 50)

    total_original = 0
    total_new = 0
    total_files = 0

    for png_file in png_files:
        webp_file = png_file.with_suffix('.webp')

        try:
            with Image.open(png_file) as img:
                img.save(webp_file, 'webp', quality=quality)

            original_size = png_file.stat().st_size
            new_size = webp_file.stat().st_size
            total_original += original_size
            total_new += new_size
            total_files += 1

            reduction = (1 - new_size / original_size) * 100
            print(f"  {png_file.name}: {reduction:.1f}% reduction")

            # Optionally delete original
            if not keep_originals:
                png_file.unlink()

        except Exception as e:
            print(f"  Error converting {png_file.name}: {e}")

    if total_files > 0:
        total_reduction = (1 - total_new / total_original) * 100
        print("-" * 50)
        print(f"Total: {total_files} files converted")
        print(f"  Original: {total_original:,} bytes ({total_original / 1024 / 1024:.2f} MB)")
        print(f"  WebP:     {total_new:,} bytes ({total_new / 1024 / 1024:.2f} MB)")
        print(f"  Reduced:  {total_reduction:.1f}%")
        print("-" * 50)


def main():
    if len(sys.argv) < 2:
        print("Usage: png_to_webp.py <input_dir> [options]")
        print("\nExample:")
        print("  png_to_webp.py docs/wireframe-1")
        print("\nOptions:")
        print("  --quality N    WebP quality (0-100, default 85)")
        print("  --delete       Delete original PNG files after conversion")
        sys.exit(1)

    input_dir = sys.argv[1]
    quality = 85
    keep_originals = True

    # Parse options
    for i, arg in enumerate(sys.argv[2:], start=2):
        if arg == '--quality' and i + 1 < len(sys.argv):
            quality = int(sys.argv[i + 1])
        elif arg == '--delete':
            keep_originals = False

    convert_directory(input_dir, quality, keep_originals)


if __name__ == '__main__':
    main()
