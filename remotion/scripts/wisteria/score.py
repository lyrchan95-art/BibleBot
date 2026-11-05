"""Cozy 84 BPM bed + game-style SFX. usage: python3 score.py mobile|desktop out.wav"""
import numpy as np, wave, sys
SR = 48000
rng = np.random.default_rng(3)
FMT = sys.argv[1]
if FMT == 'mobile':
    DUR, END, BREATH = 15.0, 12.7, (12.45, 12.7)
    FINDS = [2.65, 3.87, 5.79, 7.5, 9.9]
    CUTS = [2.4, 6.4, 8.6, 10.8]
    SPARKLE = []
else:
    DUR, END, BREATH = 45.0, 36.6, (36.1, 36.6)
    FINDS = [7.2, 8.82, 10.44, 12.06, 15.82]
    CUTS = [6.6, 13.4, 17.3, 19.6, 21.9, 24.2, 26.5, 28.8, 31.1]
    SPARKLE = [14.0]
N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
tt = lambda d: np.arange(int(d * SR)) / SR

def add(sig, t0, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i < 0: return
    sig = sig[:N - i]
    L[i:i + len(sig)] += sig * g * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(sig)] += sig * g * np.sqrt(0.5 * (1 + pan))

def kalimba(f, d=1.4):
    t = tt(d)
    return (np.sin(2*np.pi*f*t) + 0.25*np.sin(2*np.pi*f*2.76*t)*np.exp(-t*9) + 0.1*np.sin(2*np.pi*f*5.4*t)*np.exp(-t*14)) * np.exp(-t*3.2) * np.minimum(1, t*300)

def pad(freqs, d):
    t = tt(d); s = np.zeros_like(t)
    for f in freqs:
        for det in (-0.003, 0.003):
            s += 2*np.abs(2*((t*f*(1+det)) % 1) - 1) - 1
    s /= 2*len(freqs)
    k = 60; s = np.convolve(s, np.ones(k)/k, 'same')
    env = np.minimum(1, t/0.6) * np.minimum(1, (d - t)/0.6)
    return s * env

def softkick():
    t = tt(0.3); f = 40 + 60*np.exp(-t*30)
    return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t*12)

def brush():
    t = tt(0.12); n = rng.standard_normal(len(t)); n -= np.convolve(n, np.ones(8)/8, 'same')
    return n * np.exp(-t*30)

def mew(size=22):
    t = tt(0.4); base = 900 - size*10
    f = np.where(t < 0.09, base*0.7 + (base*1.15 - base*0.7)*t/0.09, base*1.15*(0.8/1.15)**((t-0.09)/0.25))
    s = 2*np.abs(2*((np.cumsum(f)/SR) % 1) - 1) - 1  # triangle
    s = np.convolve(s, np.ones(8)/8, 'same')
    env = np.minimum(1, t/0.04) * np.exp(-np.maximum(0, t-0.04)*12)
    return s * env

def sparkle():
    out = np.zeros(int(0.9*SR))
    for i, f in enumerate([1568, 2093, 2637, 3136]):
        s = np.sin(2*np.pi*f*tt(0.5)) * np.exp(-tt(0.5)*10)
        j = int(i*0.05*SR); out[j:j+len(s)] += s[:len(out)-j]
    return out

def whoosh(d=0.5):
    t = tt(d); n = rng.standard_normal(len(t)); y = 0; o = np.zeros_like(n)
    for i, x in enumerate(n):
        a = 0.01 + 0.12*(i/len(n)); y += a*(x - y); o[i] = y
    return o * np.sin(np.pi*t/d)**2 * 3

BPM = 84; BEAT = 60/BPM; BAR = 4*BEAT
# I–vi–IV–V in F: F, Dm, Bb, C
CH = [[174.61, 220.0, 261.63], [146.83, 174.61, 220.0], [116.54, 146.83, 174.61], [130.81, 164.81, 196.0]]
MEL = [  # (beat offset in bar, scale degree freq) — gentle pentatonic phrase
    [(0, 698.46), (1, 880.0), (2, 1046.5), (3, 880.0)],
    [(0, 784.0), (1.5, 698.46), (2, 587.33), (3, 698.46)],
    [(0, 932.33), (1, 880.0), (2, 698.46), (3.5, 587.33)],
    [(0, 784.0), (1, 659.25), (2, 784.0), (3, 523.25)],
]
in_breath = lambda t: BREATH[0] <= t < BREATH[1]
t = 0.0; bar = 0
while t < END - 0.05:
    ch = CH[bar % 4]
    if not in_breath(t):
        add(pad(ch, BAR + 0.6), t, 0.22, 0)
        add(kalimba(ch[0]/2, 1.8), t, 0.35, -0.1)
    for (bo, f) in MEL[bar % 4]:
        tn = t + bo*BEAT
        if tn < END - 0.05 and not in_breath(tn) and (FMT == 'mobile' or t > 1.0):
            add(kalimba(f), tn, 0.18, 0.25 if bo % 2 else -0.25)
    for b in range(4):
        tb = t + b*BEAT
        if tb >= END or in_breath(tb): continue
        if b in (0, 2) and t >= (0 if FMT == 'mobile' else 4.0): add(softkick(), tb, 0.45)
        add(brush(), tb + BEAT/2, 0.05, 0.4)
    t += BAR; bar += 1

# end card: the game's chime (C E G C), then a held F chord
for i, f in enumerate([523.25, 659.25, 783.99, 1046.5]):
    add(kalimba(f, 1.6), END + 0.15 + i*0.12, 0.28, (i - 1.5)*0.2)
add(pad([174.61, 220.0, 261.63, 349.23], DUR - END), END, 0.25)
add(kalimba(349.23/2, 3.0), END + 0.1, 0.4)

for x in FINDS:
    add(mew(22), x, 0.55, 0.15)
    add(sparkle(), x + 0.05, 0.08, -0.2)
for x in SPARKLE: add(sparkle(), x, 0.14)
for c in CUTS: add(whoosh(), c - 0.25, 0.05, -0.3)

# soft vinyl texture
crack = rng.standard_normal(N) * (rng.random(N) < 0.0006) * 0.08
L += crack; R += crack

mix = np.stack([L, R], 1)
fi = int(0.25*SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]
fo = int(1.2*SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix = np.tanh(mix*1.3)/np.tanh(1.3)
mix *= 0.89/np.max(np.abs(mix))
with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix*32767).astype(np.int16).tobytes())
print('wrote', sys.argv[2], DUR)
