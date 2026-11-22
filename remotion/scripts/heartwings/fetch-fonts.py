"""Download Google Fonts subsets for the Heartwings promo into public/fonts/heartwings.
The CJK face is subset (text=) to exactly the characters in src/heartwings/copy.ts."""
import os, re, subprocess, urllib.parse
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'public', 'fonts', 'heartwings')
os.makedirs(OUT, exist_ok=True)
copy = open(os.path.join(ROOT, 'src', 'heartwings', 'copy.ts'), encoding='utf-8').read()
chars = ''.join(sorted(set(c for c in copy if ord(c) > 127)))
chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 :.,!?'
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'
def fetch(family, weights, name, text=None):
    q = f'family={urllib.parse.quote(family)}:wght@{weights}&display=swap'
    if text: q += '&text=' + urllib.parse.quote(text)
    css = subprocess.run(['curl', '-sS', '-A', UA, 'https://fonts.googleapis.com/css2?' + q],
                         capture_output=True, text=True, check=True).stdout
    blocks = re.findall(r'@font-face\s*\{[^}]*\}', css)
    got = []
    for b in blocks:
        if not text and '/* latin */' not in css.split(b)[0][-40:]:
            continue
        wt = re.search(r'font-weight: (\d+)', b).group(1)
        url = re.search(r'url\((https://[^)]+)\)', b).group(1)
        dst = os.path.join(OUT, f'{name}-{wt}.woff2')
        subprocess.run(['curl', '-sS', '-o', dst, url], check=True)
        got.append(dst)
    print(family, '->', [os.path.basename(g) for g in got])
fetch('Huninn', '400', 'Huninn', text=chars)
fetch('Noto Sans TC', '900', 'NotoSansTC', text=chars)
fetch('Unbounded', '700;900', 'Unbounded')
