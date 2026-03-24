import re
import os

with open('C:/Users/HP/Documents/auto_zim/extracted_body.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace class with className, etc
content = content.replace('class=', 'className=')
content = content.replace('for=', 'htmlFor=')
content = content.replace('tabindex=', 'tabIndex=')
content = content.replace('onclick=', 'onClick=')
content = content.replace('onsubmit=', 'onSubmit=')
content = content.replace('onchange=', 'onChange=')
content = content.replace('oninput=', 'onInput=')
# Fix self closing tags like input and img
content = re.sub(r'(<(input|img|br|hr|meta|link)[^>]*?)(?<!/)>', r'\1 />', content)
# Fix style attributes which use strings in HTML to objects in JSX
# (Just a basic approach: convert style="a: b; c: d" to style={{ a: 'b', c: 'd' }})
def style_replacer(match):
    style_str = match.group(1)
    if not style_str.strip(): return 'style={{}}'
    props = []
    for prop in style_str.split(';'):
        if ':' in prop:
            key, val = prop.split(':', 1)
            # camalCase key
            key_parts = key.strip().split('-')
            camal_key = key_parts[0] + ''.join(word.title() for word in key_parts[1:])
            props.append(f"{camal_key}: '{val.strip().replace(chr(39), chr(92)+chr(39))}'")
    return 'style={{ ' + ', '.join(props) + ' }}'

content = re.sub(r'style="([^"]*)"', style_replacer, content)

# Try to split into components
welcome = re.search(r'(<!-- ========== WELCOME PAGE .*?-->.*?)(?=<!-- ========== LOGIN)', content, re.DOTALL)
login = re.search(r'(<!-- ========== LOGIN.*?-->.*?)(?=<!-- ========== CAREGIVER DASHBOARD)', content, re.DOTALL)
caregiver = re.search(r'(<!-- ========== CAREGIVER DASHBOARD.*?-->.*?)(?=<!-- ========== ADMIN DASHBOARD|$)', content, re.DOTALL)

components_dir = 'C:/Users/HP/Documents/auto_zim/frontend/src/components'
os.makedirs(components_dir, exist_ok=True)

if welcome:
    with open(os.path.join(components_dir, 'WelcomeView.jsx'), 'w', encoding='utf-8') as f:
        f.write('import React from "react";\n\nexport default function WelcomeView({ onSignIn }) {\n  return (\n    <>\n' + welcome.group(1) + '\n    </>\n  );\n}')

if login:
    with open(os.path.join(components_dir, 'LoginView.jsx'), 'w', encoding='utf-8') as f:
        f.write('import React from "react";\n\nexport default function LoginView({ onBack, onLogin }) {\n  return (\n    <>\n' + login.group(1) + '\n    </>\n  );\n}')

if caregiver:
    with open(os.path.join(components_dir, 'CaregiverDashboard.jsx'), 'w', encoding='utf-8') as f:
        f.write('import React from "react";\n\nexport default function CaregiverDashboard({ onLogout, role }) {\n  return (\n    <>\n' + caregiver.group(1) + '\n    </>\n  );\n}')

print("JSX generated.")
