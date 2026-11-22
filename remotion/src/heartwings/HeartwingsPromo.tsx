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
import { COPY } from "./copy";

// ---------------------------------------------------------------------------
// Fonts (local, subset — see scripts/heartwings/fetch-fonts.py)
// ---------------------------------------------------------------------------
const FONTS: [string, string, string][] = [
  ["Huninn", "400", "Huninn-400.woff2"],
  ["HW Noto Sans TC", "900", "NotoSansTC-900.woff2"],
  ["Unbounded", "900", "Unbounded-900.woff2"],
];
if (typeof document !== "undefined") {
  const h = delayRender("Heartwings fonts");
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
const ROUND = "'Huninn', 'HW Noto Sans TC', sans-serif";
const BLACK = "'HW Noto Sans TC', 'Huninn', sans-serif";
const WORD = "'Unbounded', 'HW Noto Sans TC', sans-serif";

// Brand palette — lifted from the product photography
const LAV = "#ECEAF8";
const PERI = "#C9D2F4";
const LILAC = "#B9A8E8";
const ORCHID = "#8E6FD8";
const INK = "#2A2240";
const GOLD = "#E2B656";
const PINK = "#F6B6D6";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const img = (n: number) => staticFile(`heartwings/${n}.webp`);

const chrome: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(180deg, #ffffff 0%, #e9ecf8 22%, #8e97bd 48%, #f7f8ff 56%, #b7bedc 78%, #6f78a0 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  filter: `drop-shadow(0 2px 0 ${INK}) drop-shadow(0 -2px 0 ${INK}) drop-shadow(2px 0 0 ${INK}) drop-shadow(-2px 0 0 ${INK}) drop-shadow(0 10px 18px rgba(80,60,150,.45))`,
};

// ---------------------------------------------------------------------------
// Y2K pieces
// ---------------------------------------------------------------------------
const Sparkle: React.FC<{ x: number; y: number; size: number; delay?: number; color?: string }> = ({
  x,
  y,
  size,
  delay = 0,
  color = "#fff",
}) => {
  const f = useCurrentFrame();
  const t = (f + delay) / 18;
  const s = 0.35 + 0.65 * Math.abs(Math.sin(t));
  return (
    <svg
      width={size}
      height={size}
      viewBox="-50 -50 100 100"
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        transform: `scale(${s}) rotate(${(f + delay) * 1.5}deg)`,
        opacity: 0.4 + 0.6 * s,
        filter: "drop-shadow(0 0 8px rgba(255,255,255,.9))",
      }}
    >
      <path d="M0 -50 C 6 -8 8 -6 50 0 C 8 6 6 8 0 50 C -6 8 -8 6 -50 0 C -8 -6 -6 -8 0 -50 Z" fill={color} />
    </svg>
  );
};

const SparkleField: React.FC<{ seed: number; w: number; h: number; n?: number }> = ({ seed, w, h, n = 9 }) => {
  const pts = new Array(n).fill(0).map((_, i) => {
    const r = (k: number) => {
      const v = Math.sin(seed * 97.1 + i * 13.7 + k * 7.3) * 43758.5453;
      return v - Math.floor(v);
    };
    return { x: r(1) * w, y: r(2) * h, s: 26 + r(3) * 46, d: Math.floor(r(4) * 60), c: r(5) > 0.85 ? GOLD : r(5) > 0.65 ? PINK : "#fff" };
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {pts.map((p, i) => (
        <Sparkle key={i} x={p.x} y={p.y} size={p.s} delay={p.d} color={p.c} />
      ))}
    </AbsoluteFill>
  );
};

const IridescentSweep: React.FC<{ period?: number }> = ({ period = 70 }) => {
  const f = useCurrentFrame();
  const p = (f % period) / period;
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(115deg, transparent 30%, rgba(246,182,214,.35) 42%, rgba(201,210,244,.45) 50%, rgba(185,168,232,.35) 58%, transparent 70%)",
        mixBlendMode: "screen",
        transform: `translateX(${interpolate(p, [0, 1], [-120, 120])}%)`,
      }}
    />
  );
};

export const HeartWingsLogo: React.FC<{ size: number }> = ({ size }) => {
  const feathers = [
    { rx: 30, ry: 11, a: -18, x: 58, y: -6 },
    { rx: 26, ry: 10, a: 4, x: 60, y: 12 },
    { rx: 20, ry: 8, a: 24, x: 54, y: 28 },
  ];
  return (
    <svg width={size} height={size * 0.62} viewBox="-100 -62 200 124">
      <defs>
        <linearGradient id="hwChrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#9aa3c8" />
          <stop offset="0.55" stopColor="#f6f7ff" />
          <stop offset="1" stopColor="#7c84aa" />
        </linearGradient>
        <linearGradient id="hwHeart" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd9ec" />
          <stop offset="0.5" stopColor={PINK} />
          <stop offset="1" stopColor={ORCHID} />
        </linearGradient>
      </defs>
      {[-1, 1].map((d) => (
        <g key={d} transform={`scale(${d},1)`}>
          {feathers.map((fe, i) => (
            <ellipse
              key={i}
              cx={fe.x}
              cy={fe.y}
              rx={fe.rx}
              ry={fe.ry}
              transform={`rotate(${fe.a} ${fe.x} ${fe.y})`}
              fill="url(#hwChrome)"
              stroke={INK}
              strokeWidth={3}
            />
          ))}
        </g>
      ))}
      <path
        d="M0 46 C -60 8 -44 -40 -12 -34 C -4 -32 0 -24 0 -20 C 0 -24 4 -32 12 -34 C 44 -40 60 8 0 46 Z"
        fill="url(#hwHeart)"
        stroke={INK}
        strokeWidth={3.5}
      />
      <path d="M-18 -22 C -26 -18 -28 -8 -24 -2" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.85} />
    </svg>
  );
};

const Wordmark: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ fontFamily: WORD, fontWeight: 900, fontSize: size, letterSpacing: -1, ...chrome }}>Heartwings</div>
);

const Badge: React.FC<{ text: string; size: number; delay?: number }> = ({ text, size, delay = 0 }) => {
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
        color: INK,
        background: `linear-gradient(90deg, #ffffff, ${PERI}, ${PINK})`,
        border: `3px solid ${INK}`,
        borderRadius: 999,
        padding: `${size * 0.28}px ${size * 0.7}px`,
        boxShadow: `4px 4px 0 ${INK}`,
        transform: `scale(${s}) rotate(-3deg)`,
        whiteSpace: "nowrap",
      }}
    >
      ✦ {text} ✦
    </div>
  );
};

// big chrome headline + optional sub
const Headline: React.FC<{
  text: string;
  sub?: string;
  small?: string;
  size: number;
  align?: "left" | "center";
  delay?: number;
  chromeMain?: boolean;
}> = ({ text, sub, small, size, align = "center", delay = 0, chromeMain = true }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f - delay, fps, config: { damping: 13, stiffness: 170 } });
  const b = spring({ frame: f - delay - 6, fps, config: { damping: 14, stiffness: 170 } });
  const box: React.CSSProperties = {
    background: "rgba(255,255,255,.82)",
    border: `3px solid ${INK}`,
    borderRadius: 24,
    boxShadow: `6px 6px 0 ${INK}`,
    padding: `${size * 0.14}px ${size * 0.36}px`,
    display: "inline-block",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : "flex-start", gap: size * 0.22 }}>
      <div
        style={{
          fontFamily: chromeMain ? BLACK : ROUND,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.08,
          textAlign: align,
          whiteSpace: "nowrap",
          transform: `scale(${0.6 + a * 0.4}) translateY(${(1 - a) * 30}px)`,
          opacity: a,
          ...(chromeMain ? chrome : { ...box, color: INK }),
        }}
      >
        {text}
      </div>
      {sub ? (
        <div style={{ ...box, whiteSpace: "nowrap", fontFamily: ROUND, fontSize: size * 0.46, color: INK, opacity: b, transform: `translateY(${(1 - b) * 20}px) rotate(-1.5deg)` }}>
          {sub}
        </div>
      ) : null}
      {small ? (
        <div style={{ fontFamily: ROUND, fontSize: Math.max(34, size * 0.36), color: INK, background: "rgba(255,255,255,.88)", border: `2px solid ${INK}`, padding: "8px 20px", borderRadius: 999, opacity: b }}>
          {small}
        </div>
      ) : null}
    </div>
  );
};

// full-bleed photo with Ken Burns + iridescent sheen
const Photo: React.FC<{ n: number; dur: number; from?: number; to?: number; ox?: number; oy?: number }> = ({
  n,
  dur,
  from = 1.04,
  to = 1.14,
  ox = 50,
  oy = 45,
}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, dur], [from, to]);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img src={img(n)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z})`, transformOrigin: `${ox}% ${oy}%` }} />
      <IridescentSweep />
    </AbsoluteFill>
  );
};

// white flash on every cut (Y2K camera-flash)
const Flash: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 1, 6], [0.95, 0.75, 0], clamp);
  return <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none" }} />;
};

// spotlight reveal for the dark jar shot (image 1)
const SpotlightPhoto: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const r = interpolate(f, [0, 10, 24], [0, 26, 75], clamp);
  const z = interpolate(f, [0, dur], [1.18, 1.08]);
  const mask = `radial-gradient(circle at 50% 50%, #000 ${r}%, transparent ${r + 18}%)`;
  return (
    <AbsoluteFill style={{ background: "#07060b", overflow: "hidden" }}>
      <AbsoluteFill style={{ WebkitMaskImage: mask, maskImage: mask }}>
        <Img src={img(1)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z})` }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// MOBILE — 9:16, 15 s
// ---------------------------------------------------------------------------
type Cut = { at: number; dur: number; node: (d: number) => React.ReactNode };

const Timeline: React.FC<{ cuts: Cut[] }> = ({ cuts }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {cuts.map((c, i) => {
        const from = Math.round(c.at * fps);
        const d = Math.round(c.dur * fps);
        return (
          <Sequence key={i} from={from} durationInFrames={d}>
            {c.node(d)}
            {i > 0 ? <Flash /> : null}
          </Sequence>
        );
      })}
    </>
  );
};

const EndCard: React.FC<{ mobile: boolean }> = ({ mobile }) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const a = spring({ frame: f - 2, fps, config: { damping: 12, stiffness: 150 } });
  const b = spring({ frame: f - 14, fps, config: { damping: 14, stiffness: 150 } });
  const c = spring({ frame: f - 26, fps, config: { damping: 11, stiffness: 170 } });
  const pulse = 1 + Math.sin(f / 5) * 0.03;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 40%, #ffffff 0%, ${LAV} 45%, ${PERI} 100%)` }}>
      <AbsoluteFill style={{ opacity: 0.12 }}>
        <Img src={img(2)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(18px)" }} />
      </AbsoluteFill>
      <SparkleField seed={7} w={width} h={height} n={mobile ? 14 : 18} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: mobile ? 30 : 22, padding: mobile ? "0 70px" : 0 }}>
        <div style={{ transform: `scale(${0.5 + a * 0.5}) translateY(${Math.sin(f / 12) * 6}px)`, opacity: a }}>
          <HeartWingsLogo size={mobile ? 300 : 240} />
        </div>
        <div style={{ opacity: a, transform: `scale(${0.7 + a * 0.3})` }}>
          <Wordmark size={mobile ? 118 : 120} />
        </div>
        <div style={{ fontFamily: ROUND, fontSize: mobile ? 52 : 44, color: INK, opacity: b, transform: `translateY(${(1 - b) * 20}px)` }}>
          {COPY.tagline}
        </div>
        <div style={{ opacity: b }}>
          <Badge text={COPY.badge} size={mobile ? 36 : 30} delay={14} />
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: ROUND,
            fontSize: mobile ? 50 : 40,
            color: "#fff",
            background: `linear-gradient(90deg, #6f4fc4, ${ORCHID} 55%, #c25a9c)`,
            border: `3px solid ${INK}`,
            boxShadow: `6px 6px 0 ${INK}`,
            padding: mobile ? "22px 52px" : "16px 44px",
            borderRadius: 999,
            transform: `scale(${(0.6 + c * 0.4) * pulse})`,
            opacity: c,
            textShadow: `0 2px 0 ${INK}`,
          }}
        >
          {COPY.cta}
        </div>
        <div style={{ fontFamily: ROUND, fontSize: mobile ? 34 : 28, color: INK, opacity: c * 0.85 }}>{COPY.comment}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const MOBILE_SECONDS = 15;
export const HeartwingsMobile: React.FC = () => {
  const { width, height } = useVideoConfig();
  const T = 300; // keep text below the Reels top bar
  const cuts: Cut[] = [
    {
      at: 0,
      dur: 2.5,
      node: (d) => (
        <>
          <SpotlightPhoto dur={d} />
          <AbsoluteFill style={{ top: T, alignItems: "center" }}>
            <Headline text={COPY.hook} size={92} delay={6} chromeMain={false} />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 2.5,
      dur: 2.5,
      node: (d) => (
        <>
          <Photo n={2} dur={d} />
          <SparkleField seed={2} w={width} h={height} />
          <AbsoluteFill style={{ top: T - 40, alignItems: "center" }}>
            <Headline text={COPY.first} sub={COPY.firstSub} size={170} delay={2} />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 5.0,
      dur: 2.0,
      node: (d) => (
        <>
          <Photo n={3} dur={d} ox={30} oy={40} />
          <SparkleField seed={3} w={width} h={height} n={7} />
          <AbsoluteFill style={{ top: 1290, alignItems: "center" }}>
            <Headline text={COPY.pieces} size={84} delay={2} chromeMain={false} />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 7.0,
      dur: 2.5,
      node: (d) => (
        <>
          <Photo n={4} dur={d} from={1.12} to={1.02} ox={45} oy={55} />
          <SparkleField seed={4} w={width} h={height} n={7} />
          <AbsoluteFill style={{ top: T, alignItems: "center" }}>
            <Headline text={COPY.unique} size={88} delay={2} chromeMain={false} />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 9.5,
      dur: 2.5,
      node: (d) => (
        <>
          <Photo n={5} dur={d} oy={60} />
          <SparkleField seed={5} w={width} h={height} n={10} />
          <AbsoluteFill style={{ top: 1250, alignItems: "center" }}>
            <Headline text={COPY.faith} small={COPY.verse} size={86} delay={4} chromeMain={false} />
          </AbsoluteFill>
        </>
      ),
    },
    { at: 12.0, dur: 3.0, node: () => <EndCard mobile /> },
  ];
  return (
    <AbsoluteFill style={{ background: "#07060b" }}>
      <Timeline cuts={cuts} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// DESKTOP — 16:9, 30 s: Y2K "window" cards over a blurred world
// ---------------------------------------------------------------------------
const Window: React.FC<{ n: number; w: number; title: string; dur: number; dark?: boolean; rot?: number; delay?: number }> = ({
  n,
  w,
  title,
  dur,
  dark,
  rot = 0,
  delay = 0,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 14, stiffness: 120 } });
  const h = (w * 16) / 9;
  const z = interpolate(f, [0, dur], [1.02, 1.1]);
  return (
    <div
      style={{
        width: w,
        border: `3px solid ${INK}`,
        borderRadius: 18,
        overflow: "hidden",
        background: "#fff",
        boxShadow: `10px 10px 0 ${INK}, 0 30px 60px -20px rgba(60,40,120,.55)`,
        transform: `translateY(${(1 - s) * 80}px) rotate(${rot}deg) scale(${0.85 + s * 0.15})`,
        opacity: s,
      }}
    >
      <div
        style={{
          height: 44,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 14px",
          background: `linear-gradient(90deg, ${LILAC}, ${PERI} 60%, ${PINK})`,
          borderBottom: `3px solid ${INK}`,
          fontFamily: WORD,
          fontWeight: 900,
          fontSize: 16,
          color: INK,
        }}
      >
        <span style={{ flex: 1 }}>{title}</span>
        {["#fff", "#fff", PINK].map((c, i) => (
          <span key={i} style={{ width: 18, height: 18, borderRadius: 5, background: c, border: `2px solid ${INK}` }} />
        ))}
      </div>
      <div style={{ position: "relative", height: h, overflow: "hidden", background: dark ? "#07060b" : LAV }}>
        <Img src={img(n)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z})` }} />
        <IridescentSweep period={90} />
      </div>
    </div>
  );
};

const WorldBg: React.FC<{ n: number; dark?: boolean }> = ({ n, dark }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: dark ? "#07060b" : `linear-gradient(135deg, ${LAV}, ${PERI})` }}>
      <AbsoluteFill style={{ opacity: dark ? 0.3 : 0.5 }}>
        <Img
          src={img(n)}
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(40px) saturate(1.2)", transform: `scale(${1.3 + f * 0.0006})` }}
        />
      </AbsoluteFill>
      {!dark ? (
        <AbsoluteFill
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      ) : null}
      <SparkleField seed={n * 3} w={width} h={height} n={dark ? 8 : 14} />
    </AbsoluteFill>
  );
};

export const DESKTOP_SECONDS = 30;
export const HeartwingsDesktop: React.FC = () => {
  const cuts: Cut[] = [
    {
      at: 0,
      dur: 6,
      node: (d) => (
        <>
          <WorldBg n={1} dark />
          <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 120 }}>
            <Window n={1} w={420} title="heartwings_jar.exe" dur={d} dark delay={4} />
            <div style={{ width: 760 }}>
              <FadeText text={COPY.dWorld} size={76} from={20} />
            </div>
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 6,
      dur: 6,
      node: (d) => (
        <>
          <WorldBg n={2} />
          <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 110 }}>
            <div style={{ width: 820 }}>
              <Headline text={COPY.first} sub={COPY.firstSub} size={190} align="left" delay={6} />
            </div>
            <Window n={2} w={420} title="vintage_jar_01.jpg" dur={d} rot={2} />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 12,
      dur: 6,
      node: (d) => (
        <>
          <WorldBg n={3} />
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
            <Headline text={COPY.dPieces} sub={COPY.dPiecesSub} size={84} delay={20} chromeMain={false} />
          </AbsoluteFill>
          <AbsoluteFill style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 60, paddingBottom: 40 }}>
            <Window n={3} w={300} title="sun.jpg" dur={d} rot={-4} delay={0} />
            <Window n={4} w={300} title="butterfly.jpg" dur={d} rot={1} delay={6} />
            <Window n={5} w={300} title="watch.jpg" dur={d} rot={4} delay={12} />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 18,
      dur: 6,
      node: (d) => (
        <>
          <WorldBg n={5} />
          <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 120 }}>
            <Window n={5} w={420} title="treasured.jpg" dur={d} rot={-2} />
            <div style={{ width: 780 }}>
              <Headline text={COPY.faith} small={COPY.verse} size={96} align="left" delay={10} chromeMain={false} />
            </div>
          </AbsoluteFill>
        </>
      ),
    },
    { at: 24, dur: 6, node: () => <EndCard mobile={false} /> },
  ];
  return (
    <AbsoluteFill style={{ background: "#07060b" }}>
      <Timeline cuts={cuts} />
    </AbsoluteFill>
  );
};

const FadeText: React.FC<{ text: string; size: number; from: number }> = ({ text, size, from }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [from, from + 20], [0, 1], clamp);
  return (
    <div style={{ fontFamily: ROUND, fontSize: size, color: "#fff", lineHeight: 1.3, whiteSpace: "nowrap", opacity: o, transform: `translateY(${(1 - o) * 20}px)`, textShadow: "0 0 24px rgba(185,168,232,.8)" }}>
      {text}
    </div>
  );
};
