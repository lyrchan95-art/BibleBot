"""HeartWing scores — one sonic family, a preset per video.
usage: python3 score.py <preset> out.wav
presets: card-1/2/3 (postcards), launch-mobile, launch-desktop, reel-a (treasure hunt), reel-b (2AM lo-fi), reel-c (尋安 whisper)"""
import numpy as np, wave, sys
SR = 48000
rng = np.random.default_rng(11)
PRESETS = {
    'launch-mobile':  dict(dur=15, bpm=120, drums='pop',  drop=2.5, end=12, breath=(11.5, 12), cuts=[2.5, 5, 7, 9.5], hook='jingle'),
    'launch-desktop': dict(dur=30, bpm=120, drums='pop',  drop=6,   end=24, breath=(23.5, 24), cuts=[6, 12, 18], hook='jingle'),
    'reel-a':         dict(dur=15, bpm=120, drums='pop',  drop=2.5, end=12, breath=(11.5, 12), cuts=[2.5, 4.5, 6.5, 8.5, 10], hook='jingle', counts=[2.5, 4.5, 6.5, 8.5]),
    'reel-b':         dict(dur=15, bpm=96,  drums='lofi', drop=2.5, end=12, breath=(11.5, 12), cuts=[2.5, 5, 7.5, 10], hook='click'),
    'card-1':         dict(dur=15, bpm=120, drums='pop',  drop=2.5, end=12, breath=(11.5, 12), cuts=[2.5, 4.1, 5.7, 7.3, 8.9, 10.5], hook='jingle', counts=[2.5, 4.1, 5.7, 7.3, 8.9]),
    'card-2':         dict(dur=15, bpm=96,  drums='lofi', drop=2.5, end=12, breath=(11.5, 12), cuts=[2.5, 5, 7.5, 10], hook='click'),
    'card-3':         dict(dur=15, bpm=72,  drums=None,   drop=99,  end=12, breath=(11, 12),   cuts=[2.5, 5, 7.5, 10], hook='box'),
    'reel-c':         dict(dur=15, bpm=72,  drums=None,   drop=99,  end=12, breath=(11, 12),   cuts=[2.5, 5, 8.5], hook='box'),
}
P = PRESETS[sys.argv[1]]
DUR, DROP, END, BREATH, CUTS = P['dur'], P['drop'], P['end'], P['breath'], P['cuts']
N = int(SR * DUR); L = np.zeros(N); R = np.zeros(N)
tt = lambda d: np.arange(int(d * SR)) / SR

def add(sig, t0, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i < 0: return
    sig = sig[:N - i]
    L[i:i + len(sig)] += sig * g * np.sqrt(0.5 * (1 - pan)); R[i:i + len(sig)] += sig * g * np.sqrt(0.5 * (1 + pan))
def lp(x, k): return np.convolve(x, np.ones(k) / k, 'same')
def saw(f, d): t = tt(d); return 2 * ((t * f) % 1) - 1
def kick(soft=False):
    t = tt(0.32); f = 48 + (80 if soft else 120) * np.exp(-t * 32)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (12 if soft else 9))
def hat(d=0.07): t = tt(d); n = rng.standard_normal(len(t)); return (n - lp(n, 5)) * np.exp(-t * 55)
def clap(): t = tt(0.2); n = rng.standard_normal(len(t)); return lp(n, 3) * np.exp(-t * 24)
def rim(): t = tt(0.06); return (np.sin(2*np.pi*1800*t) + rng.standard_normal(len(t))*0.4) * np.exp(-t*80)
def pluck(freqs, d=0.28):
    t = tt(d); s = sum(saw(f, d) + saw(f * 1.006, d) for f in freqs) / (2 * len(freqs)); return lp(s, 6) * np.exp(-t * 11)
def bell(f, d=0.9):
    t = tt(d)
    return (np.sin(2*np.pi*f*t) + 0.4*np.sin(2*np.pi*f*2*t)*np.exp(-t*6) + 0.2*np.sin(2*np.pi*f*3.01*t)*np.exp(-t*10)) * np.exp(-t*4.5) * np.minimum(1, t*400)
def musicbox(f, d=1.6):
    t = tt(d); return (np.sin(2*np.pi*f*t) + 0.5*np.sin(2*np.pi*f*4.02*t)*np.exp(-t*8)) * np.exp(-t*2.6) * np.minimum(1, t*600)
def epiano(freqs, d):
    t = tt(d); s = sum(np.sin(2*np.pi*f*t) + 0.3*np.sin(2*np.pi*2*f*t)*np.exp(-t*3) for f in freqs) / len(freqs)
    return s * np.exp(-t*1.4) * np.minimum(1, t*200) * (1 + 0.15*np.sin(2*np.pi*4.5*t))
def pad(freqs, d):
    t = tt(d); s = sum(np.sin(2*np.pi*f*t + np.sin(2*np.pi*0.3*t)*0.3) + 0.3*np.sin(2*np.pi*2*f*t) for f in freqs) / len(freqs)
    return s * np.minimum(1, t/0.8) * np.minimum(1, (d - t)/0.8)
def bass(f, d): t = tt(d); return (np.sin(2*np.pi*f*t) + 0.3*lp(saw(f, d), 10)) * np.minimum(1, t*90) * np.exp(-t*2.5)
def ping(f): t = tt(0.25); return np.sin(2*np.pi*f*t) * np.exp(-t*22)
def jingle(d=0.7):
    out = np.zeros(int(d*SR))
    for _ in range(26):
        j = int(rng.random()*0.85*len(out)); s = ping(2200 + rng.random()*4200) * (0.3 + rng.random()*0.7)
        out[j:j+len(s)] += s[:len(out)-j]
    return out * 0.5
def click(): t = tt(0.03); return rng.standard_normal(len(t)) * np.exp(-t*220)
def shutter(): t = tt(0.12); n = rng.standard_normal(len(t)); return (n - lp(n, 3)) * np.exp(-t*40)
def riser(d):
    t = tt(d); f = 400 + 3600*(t/d)**2; return np.sin(2*np.pi*np.cumsum(f)/SR)*(t/d)**2*0.6 + rng.standard_normal(len(t))*(t/d)**3*0.15
def impact(): t = tt(1.0); f = 40 + 60*np.exp(-t*8); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*3) + rng.standard_normal(len(t))*np.exp(-t*14)*0.3

BEAT = 60 / P['bpm']; BAR = 4 * BEAT
CH = [[329.63, 415.30, 493.88], [246.94, 311.13, 369.99], [277.18, 329.63, 415.30], [220.00, 277.18, 329.63]]  # E B C#m A
BS = [82.41, 61.74, 69.30, 55.00]
MEL = [[(0, 987.77), (1, 830.61), (2, 987.77), (3, 1108.73)], [(0, 1244.51), (1.5, 1108.73), (2.5, 987.77), (3, 830.61)],
       [(0, 1108.73), (1, 987.77), (2, 830.61), (3, 739.99)], [(0, 880.0), (1, 987.77), (2, 1108.73), (3.5, 1318.51)]]
inb = lambda t: BREATH[0] <= t < BREATH[1]
drums = P['drums']

t = 0.0; bar = 0
while t < END - 0.01:
    ch = CH[bar % 4]; full = t >= DROP
    if not inb(t):
        add(pad(ch, BAR + 0.8), t, 0.14 if full else 0.22)
        if drums == 'lofi' or drums is None: add(epiano(ch, BAR), t, 0.18 if drums else 0.12, -0.1)
    for (bo, f) in MEL[bar % 4]:
        tn = t + bo*BEAT
        if tn >= END or inb(tn): continue
        if drums is None: add(musicbox(f), tn, 0.16, 0.3 if bo % 2 else -0.3)
        elif drums == 'lofi': add(bell(f/2, 1.2), tn, 0.11, 0.3 if bo % 2 else -0.3)
        else: add(bell(f), tn, 0.13 if full else 0.17, 0.3 if bo % 2 else -0.3)
    if full and drums:
        for b in range(4):
            tb = t + b*BEAT
            if tb >= END or inb(tb): continue
            if drums == 'pop':
                add(kick(), tb, 0.8); add(hat(0.12), tb + BEAT/2, 0.16, 0.35)
                add(hat(), tb + BEAT/4, 0.06, -0.35); add(hat(), tb + 3*BEAT/4, 0.06, -0.35)
                if b in (1, 3): add(clap(), tb, 0.3)
                add(bass(BS[bar % 4], BEAT*0.9), tb, 0.45)
                add(pluck([f*2 for f in ch]), tb + BEAT/2, 0.12, 0.15 if b % 2 else -0.15)
            else:  # lofi
                if b in (0, 2): add(kick(soft=True), tb, 0.6)
                if b in (1, 3): add(rim(), tb, 0.18)
                add(hat(0.05), tb + BEAT/2, 0.07, 0.3)
                if b == 0: add(bass(BS[bar % 4], BAR*0.9), tb, 0.35)
    t += BAR; bar += 1

# hooks + SFX
if P['hook'] == 'jingle': add(click(), 0.02, 0.6); add(jingle(), 0.35, 0.6, 0.2)
if P['hook'] == 'click': add(click(), 0.02, 0.7); add(jingle(0.5), 0.4, 0.35, 0.3)
if P['hook'] == 'box': add(musicbox(1318.51, 2.0), 0.1, 0.2)
if DROP < END:
    add(riser(DROP - 0.6), 0.6, 0.22 if drums == 'pop' else 0.12)
    add(impact(), DROP, 0.7 if drums == 'pop' else 0.35)
for c in CUTS:
    add(shutter(), c - 0.02, 0.18 if drums else 0.08, -0.2)
    add(ping(3520), c + 0.03, 0.1, 0.3)
for c in P.get('counts', []): add(jingle(0.35), c + 0.08, 0.35, 0.25)   # a charm "clink" per counted treasure
add(jingle(0.9), END + 0.05, 0.35 if drums else 0.2, -0.2)
for i, f in enumerate([1318.51, 1661.22, 1975.53, 2637.02]):
    add(bell(f, 1.6), END + 0.2 + i*0.11, 0.16, (i - 1.5)*0.25)
add(pad([329.63, 415.30, 493.88, 659.25], DUR - END), END, 0.22)
add(bass(82.41, 2.5), END + 0.2, 0.35)

mix = np.stack([L, R], 1)
fo = int(1.0*SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix = np.tanh(mix*1.3)/np.tanh(1.3); mix *= 0.89/np.max(np.abs(mix))
with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix*32767).astype(np.int16).tobytes())
print('wrote', sys.argv[2], sys.argv[1], DUR)
