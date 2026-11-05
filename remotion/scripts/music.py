"""Original 120 BPM upbeat bed + SFX for the Claude editing Reel. Writes bed.wav (48k stereo)."""
import numpy as np, wave, sys

SR = 48000
DUR = 40.0
N = int(SR * DUR)
BPM = 120
BEAT = 60 / BPM
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)

def add(sig, t0, gain=1.0, pan=0.0):
    i0 = int(t0 * SR)
    if i0 >= N: return
    sig = sig[: N - i0]
    l = np.sqrt(0.5 * (1 - pan)); r = np.sqrt(0.5 * (1 + pan))
    L[i0:i0 + len(sig)] += sig * gain * l
    R[i0:i0 + len(sig)] += sig * gain * r

def tt(d): return np.arange(int(d * SR)) / SR

def kick():
    t = tt(0.35); f = 45 + 110 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)

def hat():
    t = tt(0.06); n = rng.standard_normal(len(t))
    n = n - np.convolve(n, np.ones(6) / 6, 'same')
    return n * np.exp(-t * 70)

def clap():
    t = tt(0.22); n = rng.standard_normal(len(t))
    env = np.exp(-t * 22) * (1 + 0.6 * (np.sin(2 * np.pi * 90 * t) > 0))
    return np.convolve(n, np.ones(3) / 3, 'same') * env

def saw(f, d, cutoff=0.12):
    t = tt(d); s = 2 * ((t * f) % 1) - 1
    k = max(1, int(1 / cutoff)); return np.convolve(s, np.ones(k) / k, 'same')

def bass(f, d):
    t = tt(d); s = np.sin(2 * np.pi * f * t) + 0.35 * saw(f, d, 0.25)
    return s * np.minimum(1, t * 80) * np.exp(-t * 2.2)

def pluck(freqs, d=0.32):
    t = tt(d); s = sum(saw(f, d, 0.2) for f in freqs) / len(freqs)
    return s * np.exp(-t * 9)

def whoosh(d=0.35):
    t = tt(d); n = rng.standard_normal(len(t)); out = np.zeros_like(n); y = 0
    for i, x in enumerate(n):
        a = 0.02 + 0.5 * (i / len(n)); y += a * (x - y); out[i] = y
    return out * np.sin(np.pi * t / d) ** 2 * 2.2

def tick():
    t = tt(0.03); return rng.standard_normal(len(t)) * np.exp(-t * 180)

def popsfx():
    t = tt(0.12); f = 900 - 500 * t / 0.12
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30)

def riser(d):
    t = tt(d); n = rng.standard_normal(len(t)); f = 200 + 2600 * (t / d) ** 2
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return (0.5 * n * 0.3 + 0.5 * tone) * (t / d) ** 2

def impact():
    t = tt(1.4); f = 30 + 70 * np.exp(-t * 6)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.5)
    nz = rng.standard_normal(len(t)) * np.exp(-t * 12)
    return sub + 0.4 * nz

NOTE = {'A1': 55.0, 'F1': 43.65, 'C2': 65.41, 'G1': 49.0}
CHORD = {'A1': [220, 261.63, 329.63], 'F1': [174.61, 220, 261.63], 'C2': [261.63, 329.63, 392], 'G1': [196, 246.94, 293.66]}
PROG = ['A1', 'F1', 'C2', 'G1']

BREATH = (31.0, 31.5)   # silence before CTA
DROP = 19.35            # "boom"

def in_breath(t): return BREATH[0] <= t < BREATH[1]

nbeats = int(DUR / BEAT)
for b in range(nbeats):
    t = b * BEAT
    if in_breath(t) or t >= 39.0: continue
    bar = b // 4; root = PROG[bar % 4]
    full = (t >= DROP) and (t < BREATH[0])
    cta = t >= BREATH[1]
    pre = 17.5 <= t < DROP
    if not pre:
        add(kick(), t, 0.95 if not cta else 0.7)
    for h in (t + BEAT / 2,):
        if not in_breath(h): add(hat(), h, 0.18, pan=0.3)
    if full: add(hat(), t + BEAT / 4, 0.09, pan=-0.3); add(hat(), t + 3 * BEAT / 4, 0.09, pan=-0.3)
    if b % 4 in (1, 3) and not pre: add(clap(), t, 0.35 if full else 0.25)
    if not pre:
        add(bass(NOTE[root], BEAT * 0.9), t, 0.55)
    if b % 2 == 0 and not pre:
        add(pluck(CHORD[root]), t + BEAT / 2, 0.16 if not full else 0.22, pan=-0.2 if b % 4 else 0.2)

# final chord ring-out
add(pluck(CHORD['A1'], 2.5) * 1.0, 39.0, 0.3)
add(bass(NOTE['A1'], 2.0), 39.0, 0.5)

# --- SFX --------------------------------------------------------------------
cuts = [3.0, 5.5, 9.5, 12.0, 15.0, 17.5, 20.0, 22.5, 25.0, 27.5, 31.5]
for c in cuts:
    add(whoosh(), c - 0.18, 0.22, pan=-0.4)
add(riser(1.85), 17.5, 0.35)
add(impact(), DROP, 0.9)
add(popsfx(), 0.0, 0.35)                     # hook slam
add(popsfx(), 1.3, 0.3)                       # LET CLAUDE DO IT
for i in range(28):                            # typing in ask scene
    add(tick(), 5.5 + 4 / 30 + i * 0.05, 0.18, pan=0.5)
for d in (52, 70, 88):                         # chips
    add(popsfx(), 5.5 + d / 30, 0.28)
for i in range(4):                             # shot rows
    add(popsfx(), 9.5 + (6 + i * 9) / 30, 0.18)
for i in range(3):                             # caption cards
    add(popsfx(), 12.0 + (6 + i * 14) / 30, 0.22)
for i in range(4):                             # b-roll tiles
    add(popsfx(), 15.0 + (4 + i * 8) / 30, 0.16)
add(popsfx(), 33.2, 0.4)                       # follow tap
for i in range(16):                            # comment typing
    add(tick(), 34.9 + 10 / 30 + i * 0.08, 0.16, pan=0.5)
add(popsfx(), 37.2, 0.3)                       # final slot

mix = np.stack([L, R], 1)
fade = int(0.6 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix = np.tanh(mix * 1.4) / np.tanh(1.4)
mix *= 0.89 / np.max(np.abs(mix))
out = sys.argv[1] if len(sys.argv) > 1 else 'bed.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print('wrote', out, mix.shape[0] / SR, 's')
