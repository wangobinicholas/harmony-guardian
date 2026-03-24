import re

with open('C:/Users/HP/Documents/auto_zim/Harmony_Guardian_Dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract body
body_match = re.search(r'<body.*?>(.*?)</body>', content, re.DOTALL | re.IGNORECASE)
if body_match:
    with open('C:/Users/HP/Documents/auto_zim/extracted_body.html', 'w', encoding='utf-8') as f:
        f.write(body_match.group(1))

# Extract scripts
scripts = re.findall(r'<script.*?>(.*?)</script>', content, re.DOTALL | re.IGNORECASE)
if scripts:
    with open('C:/Users/HP/Documents/auto_zim/extracted_scripts.js', 'w', encoding='utf-8') as f:
        for script in scripts:
            f.write(script + '\n\n')

print("Extraction complete.")
