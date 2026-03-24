import re

with open('C:/Users/HP/Documents/auto_zim/Harmony_Guardian_Dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

styles = re.findall(r'<style>(.*?)</style>', content, re.DOTALL)
if styles:
    with open('C:/Users/HP/Documents/auto_zim/frontend/src/index.css', 'w', encoding='utf-8') as f:
        for style in styles:
            f.write(style)
print("CSS Extracted.")
