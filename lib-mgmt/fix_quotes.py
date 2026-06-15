import re

with open('src-tauri/src/lib.rs', 'r', encoding='utf-8') as f:
    text = f.read()

tables = ['tblCat', 'tblAuthor', 'tblHoldings', 'tblUser', 'tblGroup', 'tblRent', 'tblFineCode', 'tblSubject']
for tbl in tables:
    text = re.sub(r'[\\\"]*' + tbl + r'[\\\"]*', '"' + tbl + '"', text)

with open('src-tauri/src/lib.rs', 'w', encoding='utf-8') as f:
    f.write(text)
