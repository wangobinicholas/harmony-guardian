import os
import glob
import re

components = glob.glob('C:/Users/HP/Documents/auto_zim/frontend/src/components/*.jsx')

for comp in components:
    with open(comp, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace <!-- anything --> with {/* anything */}
    content = re.sub(r'<!--(.*?)-->', r'{/*\1*/}', content)
    
    with open(comp, 'w', encoding='utf-8') as f:
        f.write(content)

print("JSX comments fixed.")
