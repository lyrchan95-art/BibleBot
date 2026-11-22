// HeartWing 心翼 • 尋安 — shared brand kit for every promo.
// Rule from the brand book: every visual carries one butterfly, one pearl and
// one chrome star (<Signature/>), and every photo gets the same pearl filter.
import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BRAND } from "./copy";

// ---------------------------------------------------------------------------
// Fonts (local subsets — scripts/heartwings/fetch-fonts.py)
// ---------------------------------------------------------------------------
const FONTS: [string, string, string][] = [
  ["Huninn", "400", "Huninn-400.woff2"],
  ["HW Noto Sans TC", "900", "NotoSansTC-900.woff2"],
  ["Pixelify Sans", "700", "PixelifySans-700.woff2"],
];
if (typeof document !== "undefined") {
  const h = delayRender("HeartWing fonts");
  Promise.all(
    FONTS.map(([fam, wt, file]) => {
      const f = new FontFace(fam, `url(${staticFile(`fonts/heartwings/${file}`)}) format('woff2')`, { weight: wt });
      document.fonts.add(f);
      return f.load();
    }),
  )
    .then(() => continueRender(h))
    .catch((e) => {
      console.error(e);
      continueRender(h);
    });
}
export const ROUND = "'Huninn', 'HW Noto Sans TC', sans-serif";
export const BLACK = "'HW Noto Sans TC', 'Huninn', sans-serif";
export const PIXEL = "'Pixelify Sans', 'Huninn', monospace";

// ---------------------------------------------------------------------------
// Palette (brand book)
// ---------------------------------------------------------------------------
export const K = "#0A0A0A";
export const SILVER = "#C0C0C0";
export const SILVER_LT = "#E8E8E8";
export const PEARL = "#F8F6F0";
export const LILAC = "#C8B6D9"; // ≤15% of any layout
export const GOLD = "#D4AF37";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const img = (n: number) => staticFile(`heartwings/${n}.webp`);

export const chrome = (outline = K): React.CSSProperties => ({
  backgroundImage: `linear-gradient(180deg, #ffffff 0%, ${SILVER_LT} 24%, #8d8d93 48%, #fbfbfb 56%, ${SILVER} 78%, #6e6e74 100%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  filter: `drop-shadow(0 2px 0 ${outline}) drop-shadow(0 -2px 0 ${outline}) drop-shadow(2px 0 0 ${outline}) drop-shadow(-2px 0 0 ${outline}) drop-shadow(0 10px 18px rgba(0,0,0,.45))`,
});

// ---------------------------------------------------------------------------
// The three marks: chrome (cross-)star, pearl, heart-wing butterfly
// ---------------------------------------------------------------------------
export const ChromeStar: React.FC<{ size: number; spin?: boolean }> = ({ size, spin = true }) => {
  const f = useCurrentFrame();
  const s = 0.88 + Math.sin(f / 14) * 0.12;
  return (
    <svg width={size} height={size} viewBox="-50 -60 100 120" style={{ transform: `scale(${s}) rotate(${spin ? Math.sin(f / 30) * 8 : 0}deg)`, overflow: "visible" }}>
      <defs>
        <linearGradient id="hwStar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor={SILVER} />
          <stop offset="0.55" stopColor="#fafafa" />
          <stop offset="1" stopColor="#77777d" />
        </linearGradient>
      </defs>
      {/* longer lower arm: a quiet cross-star */}
      <path d="M0 -46 C 5 -9 7 -7 38 0 C 7 7 5 9 0 58 C -5 9 -7 7 -38 0 C -7 -7 -5 -9 0 -46 Z" fill="url(#hwStar)" stroke={K} strokeWidth={3} />
    </svg>
  );
};

export const Pearl: React.FC<{ r: number; cx?: number; cy?: number }> = ({ r, cx = 0, cy = 0 }) => (
  <g>
    <defs>
      <radialGradient id="hwPearl" cx="0.35" cy="0.3" r="0.75">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.55" stopColor={PEARL} />
        <stop offset="0.85" stopColor="#d9d3c6" />
        <stop offset="1" stopColor="#b9b2a4" />
      </radialGradient>
    </defs>
    <circle cx={cx} cy={cy} r={r} fill="url(#hwPearl)" stroke={K} strokeWidth={2.5} />
    <ellipse cx={cx - r * 0.32} cy={cy - r * 0.36} rx={r * 0.28} ry={r * 0.16} fill="#fff" opacity={0.9} />
  </g>
);

const HEART = "M0 30 C -38 6 -28 -26 -8 -22 C -3 -21 0 -16 0 -13 C 0 -16 3 -21 8 -22 C 28 -26 38 6 0 30 Z";

// butterfly made of two hearts as wings + one pearl in the middle
export const HeartWingMark: React.FC<{ size: number; flap?: boolean }> = ({ size, flap = true }) => {
  const f = useCurrentFrame();
  const k = flap ? 0.86 + 0.14 * Math.abs(Math.sin(f / 9)) : 1;
  return (
    <svg width={size} height={size * 0.72} viewBox="-100 -72 200 144" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="hwWing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#a8a8ae" />
          <stop offset="0.56" stopColor="#fbfbfb" />
          <stop offset="1" stopColor="#7a7a80" />
        </linearGradient>
      </defs>
      {[-1, 1].map((d) => (
        <g key={d} transform={`scale(${d * k},1)`}>
          <g transform="translate(46,-14) rotate(58) scale(1.35)">
            <path d={HEART} fill="url(#hwWing)" stroke={K} strokeWidth={2.4} />
          </g>
          <g transform="translate(34,34) rotate(118) scale(0.78)">
            <path d={HEART} fill="url(#hwWing)" stroke={K} strokeWidth={3.2} />
          </g>
        </g>
      ))}
      <rect x={-5} y={-30} width={10} height={60} rx={5} fill={K} />
      <Pearl r={15} cy={-2} />
    </svg>
  );
};

export const Wordmark: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ fontFamily: PIXEL, fontWeight: 700, fontSize: size, letterSpacing: 2, lineHeight: 1, ...chrome() }}>{BRAND.word}</div>
);

// always-on brand signature: butterfly + pearl (the mark) and one chrome star
export const Signature: React.FC<{ mobile: boolean; dark?: boolean }> = ({ mobile, dark }) => (
  <div
    style={{
      position: "absolute",
      left: mobile ? 56 : 60,
      bottom: mobile ? 420 : 46,
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "6px 14px 6px 8px",
      borderRadius: 999,
      background: dark ? "rgba(10,10,10,.55)" : "rgba(248,246,240,.72)",
      border: `2px solid ${dark ? "rgba(232,232,232,.35)" : K}`,
    }}
  >
    <HeartWingMark size={mobile ? 74 : 62} />
    <span style={{ fontFamily: PIXEL, fontWeight: 700, fontSize: mobile ? 30 : 24, color: dark ? SILVER_LT : K }}>hw</span>
    <ChromeStar size={mobile ? 34 : 28} />
  </div>
);

// ---------------------------------------------------------------------------
// Pearl filter — same grade on every photo for instant recognition
// ---------------------------------------------------------------------------
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .55 0'/></filter><rect width='220' height='220' filter='url(%23n)'/></svg>\")";

export const PearlGrade: React.FC<{ dark?: boolean }> = ({ dark }) => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${PEARL}22, transparent 40%, ${LILAC}1c)`, mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ backgroundImage: GRAIN, opacity: 0.16, mixBlendMode: "overlay", backgroundPosition: `${(f * 37) % 220}px ${(f * 53) % 220}px` }} />
      <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 45%, transparent 55%, rgba(10,10,10,${dark ? 0.6 : 0.35}) 100%)` }} />
    </>
  );
};
export const PHOTO_FILTER = "saturate(0.82) contrast(1.06) brightness(1.02)";

export const Photo: React.FC<{ n: number; dur: number; from?: number; to?: number; ox?: number; oy?: number }> = ({
  n,
  dur,
  from = 1.04,
  to = 1.12,
  ox = 50,
  oy = 45,
}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, dur], [from, to]);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: K }}>
      <Img
        src={img(n)}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z})`, transformOrigin: `${ox}% ${oy}%`, filter: PHOTO_FILTER }}
      />
      <PearlGrade />
    </AbsoluteFill>
  );
};

// macro "detail" crop: zooms onto a focus point inside a photo
export const Macro: React.FC<{ n: number; dur: number; fx: number; fy: number; z0?: number; z1?: number }> = ({ n, dur, fx, fy, z0 = 2.2, z1 = 2.45 }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, dur], [z0, z1]);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: K }}>
      <Img
        src={img(n)}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transformOrigin: `${fx}% ${fy}%`,
          transform: `translate(${50 - fx}%, ${50 - fy}%) scale(${z})`,
          filter: PHOTO_FILTER,
        }}
      />
      <PearlGrade />
    </AbsoluteFill>
  );
};

export const SpotlightPhoto: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const r = interpolate(f, [0, 10, 24], [0, 26, 75], clamp);
  const z = interpolate(f, [0, dur], [1.18, 1.08]);
  const mask = `radial-gradient(circle at 50% 50%, #000 ${r}%, transparent ${r + 18}%)`;
  return (
    <AbsoluteFill style={{ background: "#050505", overflow: "hidden" }}>
      <AbsoluteFill style={{ WebkitMaskImage: mask, maskImage: mask }}>
        <Img src={img(1)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z})`, filter: PHOTO_FILTER }} />
      </AbsoluteFill>
      <PearlGrade dark />
    </AbsoluteFill>
  );
};

// tiny silver glints (restrained — the chrome star stays the hero)
export const Glints: React.FC<{ seed: number; w: number; h: number; n?: number }> = ({ seed, w, h, n = 6 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(n).fill(0).map((_, i) => {
        const r = (k: number) => {
          const v = Math.sin(seed * 91.7 + i * 12.9 + k * 5.1) * 43758.5453;
          return v - Math.floor(v);
        };
        const s = 0.3 + 0.7 * Math.abs(Math.sin((f + r(4) * 60) / 16));
        const size = 14 + r(3) * 18;
        return (
          <svg key={i} width={size} height={size} viewBox="-50 -50 100 100" style={{ position: "absolute", left: r(1) * w, top: r(2) * h, transform: `scale(${s})`, opacity: 0.25 + 0.6 * s }}>
            <path d="M0 -50 C 5 -6 6 -5 50 0 C 6 5 5 6 0 50 C -5 6 -6 5 -50 0 C -6 -5 -5 -6 0 -50 Z" fill="#fff" />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

export const Flash: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 1, 6], [0.9, 0.7, 0], clamp);
  return <AbsoluteFill style={{ background: PEARL, opacity: o, pointerEvents: "none" }} />;
};

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------
type Variant = "chrome" | "card" | "neon" | "soft";
export const Headline: React.FC<{
  text: string;
  sub?: string;
  small?: string;
  size: number;
  align?: "left" | "center";
  delay?: number;
  variant?: Variant;
  font?: string;
}> = ({ text, sub, small, size, align = "center", delay = 0, variant = "card", font }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f - delay, fps, config: { damping: 13, stiffness: 170 } });
  const b = spring({ frame: f - delay - 7, fps, config: { damping: 14, stiffness: 170 } });
  const card: React.CSSProperties = {
    background: `${PEARL}eb`,
    border: `3px solid ${K}`,
    borderRadius: 22,
    boxShadow: `6px 6px 0 ${K}`,
    padding: `${size * 0.14}px ${size * 0.34}px`,
    display: "inline-block",
    color: K,
  };
  const styles: Record<Variant, React.CSSProperties> = {
    chrome: { fontFamily: font ?? BLACK, fontWeight: 900, ...chrome() },
    card: { fontFamily: font ?? ROUND, ...card },
    neon: {
      fontFamily: font ?? ROUND,
      color: PEARL,
      textShadow: `0 0 10px ${LILAC}, 0 0 28px ${LILAC}, 0 0 54px rgba(200,182,217,.7)`,
    },
    soft: { fontFamily: font ?? ROUND, color: K, background: `${PEARL}d9`, padding: `${size * 0.12}px ${size * 0.3}px`, borderRadius: 18 },
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : "flex-start", gap: size * 0.22 }}>
      <div
        style={{
          fontSize: size,
          lineHeight: 1.1,
          textAlign: align,
          whiteSpace: "nowrap",
          transform: `scale(${0.65 + a * 0.35}) translateY(${(1 - a) * 26}px)`,
          opacity: a,
          ...styles[variant],
        }}
      >
        {text}
      </div>
      {sub ? (
        <div style={{ ...card, whiteSpace: "nowrap", fontFamily: ROUND, fontSize: size * 0.46, opacity: b, transform: `translateY(${(1 - b) * 18}px) rotate(-1.5deg)` }}>
          {sub}
        </div>
      ) : null}
      {small ? (
        <div style={{ fontFamily: ROUND, fontSize: Math.max(30, size * 0.34), color: K, background: `${PEARL}e6`, border: `2px solid ${K}`, padding: "6px 18px", borderRadius: 999, opacity: b }}>
          {small}
        </div>
      ) : null}
    </div>
  );
};

export const Badge: React.FC<{ text: string; size: number; delay?: number }> = ({ text, size, delay = 0 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 12, stiffness: 180 } });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: ROUND,
        fontSize: size,
        color: K,
        background: `linear-gradient(180deg, #ffffff, ${SILVER_LT} 55%, ${SILVER})`,
        border: `3px solid ${K}`,
        borderRadius: 999,
        padding: `${size * 0.28}px ${size * 0.7}px`,
        boxShadow: `4px 4px 0 ${K}`,
        transform: `scale(${s}) rotate(-2deg)`,
        whiteSpace: "nowrap",
      }}
    >
      ✦ {text} ✦
    </div>
  );
};

// ---------------------------------------------------------------------------
// End card (identical lockup + CTA on every video)
// ---------------------------------------------------------------------------
export const EndCard: React.FC<{ mobile: boolean }> = ({ mobile }) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const a = spring({ frame: f - 2, fps, config: { damping: 12, stiffness: 150 } });
  const b = spring({ frame: f - 14, fps, config: { damping: 14, stiffness: 150 } });
  const c = spring({ frame: f - 26, fps, config: { damping: 11, stiffness: 170 } });
  const pulse = 1 + Math.sin(f / 5) * 0.03;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(110% 75% at 50% 40%, #1d1d22 0%, ${K} 70%)` }}>
      <AbsoluteFill style={{ opacity: 0.1 }}>
        <Img src={img(2)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(22px) grayscale(.4)" }} />
      </AbsoluteFill>
      <Glints seed={7} w={width} h={height} n={mobile ? 8 : 10} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: mobile ? 28 : 18, padding: mobile ? "0 70px" : 0 }}>
        <div style={{ position: "relative", transform: `scale(${0.5 + a * 0.5}) translateY(${Math.sin(f / 12) * 6}px)`, opacity: a }}>
          <HeartWingMark size={mobile ? 300 : 230} />
          <div style={{ position: "absolute", right: mobile ? -40 : -30, top: mobile ? -30 : -24 }}>
            <ChromeStar size={mobile ? 70 : 54} />
          </div>
        </div>
        <div style={{ opacity: a, transform: `scale(${0.7 + a * 0.3})` }}>
          <Wordmark size={mobile ? 150 : 128} />
        </div>
        <div style={{ fontFamily: ROUND, fontSize: mobile ? 50 : 40, color: SILVER_LT, letterSpacing: 6, opacity: a }}>{BRAND.cn}</div>
        <div style={{ fontFamily: PIXEL, fontWeight: 700, fontSize: mobile ? 38 : 30, color: LILAC, opacity: b, transform: `translateY(${(1 - b) * 16}px)` }}>
          {BRAND.tagline}
        </div>
        <div style={{ opacity: b }}>
          <Badge text={BRAND.badge} size={mobile ? 34 : 28} delay={14} />
        </div>
        <div
          style={{
            marginTop: 8,
            fontFamily: ROUND,
            fontSize: mobile ? 48 : 38,
            color: K,
            background: `linear-gradient(180deg, ${PEARL}, ${LILAC})`,
            border: `3px solid ${SILVER_LT}`,
            boxShadow: `0 0 0 3px ${K}, 0 0 30px rgba(200,182,217,.55)`,
            padding: mobile ? "20px 50px" : "14px 42px",
            borderRadius: 999,
            transform: `scale(${(0.6 + c * 0.4) * pulse})`,
            opacity: c,
          }}
        >
          {BRAND.cta}
        </div>
        <div style={{ fontFamily: ROUND, fontSize: mobile ? 32 : 26, color: SILVER, opacity: c * 0.9 }}>↳ {BRAND.postcard}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Timeline: sequential cuts, a pearl flash on each, the signature always on
// ---------------------------------------------------------------------------
export type Cut = { at: number; dur: number; node: (d: number) => React.ReactNode; dark?: boolean; end?: boolean };

export const Timeline: React.FC<{ cuts: Cut[]; mobile: boolean }> = ({ cuts, mobile }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {cuts.map((c, i) => {
        const from = Math.round(c.at * fps);
        const d = Math.round(c.dur * fps);
        return (
          <Sequence key={i} from={from} durationInFrames={d}>
            {c.node(d)}
            {c.end ? null : <Signature mobile={mobile} dark={c.dark} />}
            {i > 0 ? <Flash /> : null}
          </Sequence>
        );
      })}
    </>
  );
};
