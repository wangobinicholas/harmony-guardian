import subprocess
import os

cwd = 'C:/Users/HP/Documents/auto_zim/frontend'
result = subprocess.run(['npm.cmd', 'run', 'build'], cwd=cwd, capture_output=True, text=True)

with open(os.path.join(cwd, 'build_output.txt'), 'w', encoding='utf-8') as f:
    f.write("STDOUT:\n" + result.stdout)
    f.write("\nSTDERR:\n" + result.stderr)

print("Build logged.")
