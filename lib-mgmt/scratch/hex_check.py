with open("docs/legacy-database/glDB.sanitized.sql", "rb") as f:
    for line in f:
        if b"Cari" in line and b"\xc3" in line:
            print(line)
            print(line.hex())
            # break
