"""Fetch the Heritage Brews fonts (latin subsets + a Bengali subset for the 'চা' mark) into public/fonts/heritage."""
import os, re, subprocess, urllib.parse
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'public', 'fonts', 'heritage'); os.makedirs(OUT, exist_ok=True)
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'
def fetch(family, axis, name, text=None, latin_only=True):
    q = f'family={urllib.parse.quote(family)}:{axis}&display=swap'
    if text: q += '&text=' + urllib.parse.quote(text)
    css = subprocess.run(['curl', '-sS', '-A', UA, 'https://fonts.googleapis.com/css2?' + q], capture_output=True, text=True, check=True).stdout
    parts = re.split(r'(/\* [\w-]+ \*/)', css)
    blocks = []
    if text: blocks = [(None, b) for b in re.findall(r'@font-face\s*\{[^}]*\}', css)]
    else:
        for i in range(1, len(parts), 2):
            if parts[i] == '/* latin */': blocks.append((parts[i], parts[i + 1]))
    for _, b in blocks:
        wt = re.search(r'font-weight: (\d+)', b).group(1)
        st = 'i' if 'italic' in b else ''
        url = re.search(r'url\((https://[^)]+)\)', b).group(1)
        dst = os.path.join(OUT, f'{name}-{wt}{st}.woff2')
        subprocess.run(['curl', '-sS', '-o', dst, url], check=True)
        print(family, '->', os.path.basename(dst))
fetch('Fraunces', 'ital,wght@0,600;1,500', 'Fraunces')
fetch('DM Sans', 'wght@500;700', 'DMSans')
fetch('Noto Serif Bengali', 'wght@700', 'NotoSerifBengali', text='চা')
