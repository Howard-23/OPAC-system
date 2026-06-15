import re

def sanitize_sql(input_path, output_path):
    print(f"Sanitizing {input_path} (binary mode)...")
    
    # Byte sequences for double-encoded UTF-8 artifacts
    replacements = {
        b'\xc3\x83\xc2\xb1': 'ñ'.encode('utf-8'),      # ñ
        b'\xc3\x83\xe2\x80\xb9': 'Ñ'.encode('utf-8'),   # Ñ (often different variants)
        b'\xc3\x83\xc2\x91': 'Ñ'.encode('utf-8'),      # Ñ
        b'\xc3\x83\xc2\xa9': 'é'.encode('utf-8'),      # é
        b'\xc3\x83\xc2\xa1': 'á'.encode('utf-8'),      # á
        b'\xc3\x83\xc2\xb3': 'ó'.encode('utf-8'),      # ó
        b'\xc3\x83\xc2\xba': 'ú'.encode('utf-8'),      # ú
        b'\xc3\x83\xc2\xad': 'í'.encode('utf-8'),      # í
    }

    with open(input_path, 'rb') as f:
        content = f.read()

    for old, new in replacements.items():
        content = content.replace(old, new)
    
    with open(output_path, 'wb') as f:
        f.write(content)
    
    print(f"Saved to {output_path}")

if __name__ == "__main__":
    import os
    src = "docs/legacy-database/glDB.postgres.sql"
    dst = "docs/legacy-database/glDB.sanitized.sql"
    if os.path.exists(src):
        sanitize_sql(src, dst)
    else:
        print(f"Source not found: {src}")
