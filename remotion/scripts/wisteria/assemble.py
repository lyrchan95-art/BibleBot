"""frames_<fmt>/manifest.json -> one CFR 30fps mp4 per take in remotion/public/ww/<fmt>/"""
import json, os, subprocess, sys
fmt = sys.argv[1]
base = os.path.dirname(os.path.abspath(__file__))
fdir = os.path.join(base, f'frames_{fmt}')
out = f'/home/user/BibleBot/remotion/public/ww/{fmt}'
os.makedirs(out, exist_ok=True)
man = json.load(open(os.path.join(fdir, 'manifest.json')))
takes = {}
for m in man:
    takes.setdefault(m['take'], []).append(m)
info = {}
for name, fr in takes.items():
    fr.sort(key=lambda m: m['i'])
    lst = os.path.join(fdir, f'{name}.txt')
    with open(lst, 'w') as f:
        for a, b in zip(fr, fr[1:] + [None]):
            dur = (b['t'] - a['t']) / 1000 if b else 1 / 30
            f.write(f"file '{os.path.join(fdir, a['f'])}'\nduration {max(dur, 0.001):.4f}\n")
        f.write(f"file '{os.path.join(fdir, fr[-1]['f'])}'\n")
    dst = os.path.join(out, f'{name}.mp4')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst,
                    '-vf', ('scale=1920:1080:flags=lanczos,' if fmt == 'desktop' else '') + 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', dst], check=True)
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', dst],
                               capture_output=True, text=True).stdout)
    info[name] = round(dur, 3)
    print(f'{name}: {len(fr)} frames -> {dur:.2f}s ({len(fr)/dur:.1f} src fps)')
json.dump(info, open(os.path.join(out, 'durations.json'), 'w'), indent=1)
