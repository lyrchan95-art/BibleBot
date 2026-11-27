"""Heritage Brews intro score: tanpura drone, plucked strings, tabla-style hand drums (D, 84 BPM).
usage: python3 score.py out.wav"""
import numpy as np, wave, sys
SR = 48000; DUR = 20; END = 17.3; BREATH = (16.9, 17.3)
CUTS = [3, 6, 9, 12.5, 15.5]
rng = np.random.default_rng(5)
N = SR * DUR; L = np.zeros(N); R = np.zeros(N)
tt = lambda d: np.arange(int(d * SR)) / SR
def add(sig, t0, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N: return
    sig = sig[:N - i]
    L[i:i+len(sig)] += sig*g*np.sqrt(.5*(1-pan)); R[i:i+len(sig)] += sig*g*np.sqrt(.5*(1+pan))
def lp(x, k): return np.convolve(x, np.ones(k)/k, 'same')
def tanpura(f, d):
    t = tt(d); s = sum((0.9**k)*np.sin(2*np.pi*f*k*t + 0.3*np.sin(2*np.pi*0.2*k*t)) for k in range(1, 9))
    return s/4 * np.minimum(1, t/1.5) * np.minimum(1, (d-t)/1.0)
def pluck(f, d=1.4):   # Karplus-Strong string with a little sitar buzz
    n = int(d*SR); p = int(SR/f); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = 0.5*(buf[i % p] + buf[(i+1) % p])*0.996
    return np.tanh(out*2.2)*0.6
def dha(): t = tt(0.5); f = 70 + 90*np.exp(-t*18); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*7)
def na():  t = tt(0.25); return (np.sin(2*np.pi*620*t)+0.5*np.sin(2*np.pi*1240*t))*np.exp(-t*26)*0.6 + rng.standard_normal(len(t))*np.exp(-t*90)*0.15
def ting(f): t = tt(1.2); return (np.sin(2*np.pi*f*t) + 0.3*np.sin(2*np.pi*f*2.76*t)*np.exp(-t*5))*np.exp(-t*3.2)
def swell(d): t = tt(d); n = lp(rng.standard_normal(len(t)), 30); return n*(t/d)**2*0.5
BEAT = 60/84
D = 146.83
SC = {'D':293.66,'E':329.63,'F#':369.99,'A':440.0,'B':493.88,'d':587.33,'e':659.25}
MEL = ['A','F#','E','D','E','F#','A','B','A','F#','A','d','e','d','B','A']
# drone throughout
add(tanpura(D, END+0.2), 0, 0.22, -0.2); add(tanpura(D*1.5, END+0.2), 0.4, 0.14, 0.25)
t = 0.0; k = 0
while t < END - 0.05:
    if not (BREATH[0] <= t < BREATH[1]):
        if t >= 0.6: add(pluck(SC[MEL[k % len(MEL)]]), t, 0.32, 0.25 if k % 2 else -0.25)
        if t >= 3:
            b = k % 8
            if b in (0, 3, 6): add(dha(), t, 0.55)
            if b in (2, 4, 5, 7): add(na(), t, 0.22, 0.3)
            if t >= 9: add(na(), t + BEAT/2, 0.1, -0.3)
    t += BEAT; k += 1
for c in CUTS: add(ting(1174.66), c, 0.12, 0.3); add(swell(0.5), c - 0.5, 0.08)
add(swell(1.2), 1.8, 0.12)
# end: resolve on D
for i, f in enumerate([293.66, 369.99, 440.0, 587.33]): add(pluck(f, 2.5), END + i*0.08, 0.3, (i-1.5)*0.25)
add(tanpura(D, DUR-END), END, 0.25); add(dha(), END, 0.6); add(ting(1760), END+0.3, 0.15)
mix = np.stack([L, R], 1); fo = SR; mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix = np.tanh(mix*1.2)/np.tanh(1.2); mix *= 0.89/np.max(np.abs(mix))
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype(np.int16).tobytes())
print('wrote', sys.argv[1])
