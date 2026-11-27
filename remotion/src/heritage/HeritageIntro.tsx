// Heritage Brews — 20s mobile intro (1080x1920, 30fps).
// Premium organic teas from Bangladesh; every sip empowers teen moms.
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

export const HERITAGE_SECONDS = 20;

// ---------------------------------------------------------------------------
// Brand kit
// ---------------------------------------------------------------------------
const TEA = "#1F3A2B"; // tea-garden green
const LEAF = "#6E9A55";
const CREAM = "#F4EDE0";
const CLAY = "#B4532A"; // Dhaka brick
const GOLD = "#C99A3B";
const INK = "#1A1712";
const SERIF = "'HB Fraunces', Georgia, serif";
const SANS = "'HB DM Sans', system-ui, sans-serif";
const BENGALI = "'HB Bengali', serif";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const photo = (n: number) => staticFile(`heritage/${n}.jpg`);

const FONTS: [string, string, string, string][] = [
  ["HB Fraunces", "600", "normal", "Fraunces-600.woff2"],
  ["HB Fraunces", "500", "italic", "Fraunces-500i.woff2"],
  ["HB DM Sans", "500 700", "normal", "DMSans-500.woff2"],
  ["HB Bengali", "700", "normal", "NotoSerifBengali-700.woff2"],
];
if (typeof document !== "undefined") {
  const h = delayRender("Heritage fonts");
  Promise.all(
    FONTS.map(([fam, wt, style, file]) => {
      const f = new FontFace(fam, `url(${staticFile(`fonts/heritage/${file}`)}) format('woff2')`, { weight: wt, style });
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

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .35  0 0 0 0 .3  0 0 0 0 .2  0 0 0 .5 0'/></filter><rect width='220' height='220' filter='url(%23n)'/></svg>\")";

const Grain: React.FC<{ o?: number }> = ({ o = 0.12 }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ backgroundImage: GRAIN, opacity: o, mixBlendMode: "multiply", backgroundPosition: `${(f * 37) % 220}px ${(f * 53) % 220}px`, pointerEvents: "none" }} />;
};

// a single tea leaf
const Leaf: React.FC<{ size: number; color?: string; rot?: number }> = ({ size, color = LEAF, rot = 0 }) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ transform: `rotate(${rot}deg)`, display: "block" }}>
    <path d="M0 -46 C 30 -30 34 18 0 46 C -34 18 -30 -30 0 -46 Z" fill={color} />
    <path d="M0 -40 L0 42" stroke={CREAM} strokeOpacity={0.55} strokeWidth={3} fill="none" />
    {[-22, -6, 10, 26].map((y, i) => (
      <path key={i} d={`M0 ${y} Q ${i % 2 ? 14 : -14} ${y - 8} ${i % 2 ? 22 : -22} ${y - 18}`} stroke={CREAM} strokeOpacity={0.4} strokeWidth={2} fill="none" />
    ))}
  </svg>
);

// round seal: চা (tea) in the middle, brand name on the ring
const Seal: React.FC<{ size: number; color?: string; spin?: boolean }> = ({ size, color = GOLD, spin = true }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size} viewBox="-100 -100 200 200" style={{ position: "absolute", inset: 0, transform: `rotate(${spin ? f * 0.4 : 0}deg)` }}>
        <defs>
          <path id="ring" d="M -74 0 A 74 74 0 1 1 74 0 A 74 74 0 1 1 -74 0" />
        </defs>
        <circle r={96} fill="none" stroke={color} strokeWidth={3} />
        <circle r={56} fill="none" stroke={color} strokeWidth={2} />
        <text fill={color} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 17, letterSpacing: 5.2 }}>
          <textPath href="#ring">HERITAGE BREWS ✦ BANGLADESH ✦ ORGANIC ✦ </textPath>
        </text>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BENGALI, fontWeight: 700, fontSize: size * 0.27, color, paddingBottom: size * 0.03 }}>
        চা
      </div>
    </div>
  );
};

// rising steam
const Steam: React.FC<{ w: number; h: number; color?: string }> = ({ w, h, color = CREAM }) => {
  const f = useCurrentFrame();
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", overflow: "visible" }}>
      {[0, 1, 2].map((i) => {
        const x = w * (0.3 + i * 0.2);
        const ph = f / 14 + i * 2.1;
        const d = `M ${x} ${h} C ${x + Math.sin(ph) * 30} ${h * 0.7}, ${x - Math.sin(ph + 1) * 34} ${h * 0.4}, ${x + Math.sin(ph + 2) * 22} 0`;
        return <path key={i} d={d} stroke={color} strokeOpacity={0.55 - i * 0.1} strokeWidth={9} strokeLinecap="round" fill="none" />;
      })}
    </svg>
  );
};

// a cup of tea, line-drawn
const Cup: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <Steam w={size * 0.6} h={size * 0.45} />
    <svg width={size} height={size * 0.6} viewBox="0 0 200 120">
      <path d="M30 8 H150 V50 C150 86 124 110 90 110 C56 110 30 86 30 50 Z" fill={CREAM} />
      <path d="M38 16 H142 V32 H38 Z" fill={CLAY} opacity={0.9} />
      <path d="M150 26 C182 26 182 72 146 72" stroke={CREAM} strokeWidth={10} fill="none" />
      <path d="M12 116 H178" stroke={GOLD} strokeWidth={6} strokeLinecap="round" />
    </svg>
  </div>
);

// photo with warm grade and slow push
const Photo: React.FC<{ n: number; dur: number; z0?: number; z1?: number; fx?: number; fy?: number }> = ({ n, dur, z0 = 1.05, z1 = 1.15, fx = 50, fy = 50 }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, dur], [z0, z1]);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
      <Img
        src={photo(n)}
        style={{ width: "100%", height: "100%", objectFit: "cover", transformOrigin: `${fx}% ${fy}%`, transform: `scale(${z})`, filter: "saturate(1.05) contrast(1.04) sepia(.14)" }}
      />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(26,23,18,.62) 0%, transparent 34%, transparent 48%, rgba(26,23,18,.78) 78%, rgba(26,23,18,.8) 100%)` }} />
      <Grain />
    </AbsoluteFill>
  );
};

// kicker + big serif line
const Title: React.FC<{ kicker?: string; text: string; color?: string; size?: number; delay?: number; italic?: boolean; align?: "center" | "left" }> = ({
  kicker,
  text,
  color = CREAM,
  size = 104,
  delay = 4,
  italic = true,
  align = "center",
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f - delay, fps, config: { damping: 20, stiffness: 90 } });
  const b = spring({ frame: f - delay - 8, fps, config: { damping: 20, stiffness: 90 } });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : "flex-start", gap: 22, textAlign: align }}>
      {kicker ? (
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, letterSpacing: 8, textTransform: "uppercase", color: color === CREAM ? "#F1CF86" : GOLD, textShadow: color === CREAM ? "0 2px 14px rgba(0,0,0,.8)" : "none", opacity: a, transform: `translateY(${(1 - a) * 14}px)` }}>
          {kicker}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: italic ? "italic" : "normal",
          fontWeight: italic ? 500 : 600,
          fontSize: size,
          lineHeight: 1.08,
          color,
          opacity: b,
          transform: `translateY(${(1 - b) * 30}px)`,
          textShadow: color === CREAM ? "0 4px 30px rgba(0,0,0,.45)" : "none",
          whiteSpace: "pre-line",
        }}
      >
        {text}
      </div>
    </div>
  );
};

// each scene rises in like tea filling a cup
const Rise: React.FC<{ children: React.ReactNode; first?: boolean }> = ({ children, first }) => {
  const f = useCurrentFrame();
  const p = first ? 1 : interpolate(f, [0, 12], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  return <AbsoluteFill style={{ clipPath: `inset(${(1 - p) * 100}% 0 0 0)` }}>{children}</AbsoluteFill>;
};

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------
const T = 300; // top text line (below the Reels header)

const Pillars: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = ["Fair wages", "Ethical supply chain", "Organic tea leaves"];
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <Grain o={0.1} />
      <AbsoluteFill style={{ top: T, padding: "0 110px", gap: 70 }}>
        <Title kicker="Our promise" text={"Good tea,\ndone right."} color={TEA} size={110} delay={2} align="left" />
        <div style={{ display: "flex", flexDirection: "column", gap: 46, marginTop: 30 }}>
          {items.map((t, i) => {
            const s = spring({ frame: f - 16 - i * 9, fps, config: { damping: 16, stiffness: 120 } });
            return (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 30, opacity: s, transform: `translateX(${(1 - s) * -60}px)` }}>
                <Leaf size={74} rot={30 + i * 20} color={i === 1 ? CLAY : LEAF} />
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 62, color: INK }}>{t}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", right: 170, top: 1110, opacity: interpolate(f, [30, 44], [0, 1], clamp) }}>
        <Seal size={250} color={CLAY} />
      </div>
    </AbsoluteFill>
  );
};

const Mission: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: { damping: 14, stiffness: 100 } });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(90% 60% at 50% 40%, #2C5039, ${TEA} 75%)` }}>
      {[
        [120, 420, 40, 90],
        [880, 360, -30, 70],
        [160, 1350, 120, 60],
        [860, 1300, 200, 100],
      ].map(([x, y, r, sz], i) => (
        <div key={i} style={{ position: "absolute", left: x - sz / 2, top: y + Math.sin((f + i * 20) / 20) * 14, opacity: 0.55 }}>
          <Leaf size={sz} rot={r + f * 0.3} />
        </div>
      ))}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 50, paddingBottom: 160 }}>
        <div style={{ transform: `scale(${0.6 + 0.4 * s})`, opacity: s }}>
          <Cup size={300} />
        </div>
        <Title kicker="Every sip" text={"empowers\nteen moms."} size={128} delay={10} />
      </AbsoluteFill>
      <Grain o={0.08} />
    </AbsoluteFill>
  );
};

const Shipping: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 4, fps, config: { damping: 11, stiffness: 150 } });
  return (
    <AbsoluteFill style={{ background: CLAY, alignItems: "center", justifyContent: "center", paddingBottom: 120 }}>
      <Grain o={0.14} />
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: 10, color: CREAM, opacity: 0.9 }}>FREE SHIPPING</div>
      <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 200, color: CREAM, lineHeight: 1, marginTop: 20, transform: `scale(${0.7 + 0.3 * s})`, opacity: s }}>HK$300+</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 56, color: CREAM, marginTop: 26, opacity: interpolate(f, [16, 28], [0, 1], clamp) }}>
        delivered across Hong Kong
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f - 2, fps, config: { damping: 14, stiffness: 110 } });
  const b = spring({ frame: f - 14, fps, config: { damping: 16, stiffness: 120 } });
  const c = spring({ frame: f - 26, fps, config: { damping: 12, stiffness: 150 } });
  return (
    <AbsoluteFill style={{ background: CREAM, alignItems: "center", justifyContent: "center", gap: 34, paddingBottom: 200 }}>
      <Grain o={0.1} />
      <div style={{ opacity: a, transform: `scale(${0.7 + 0.3 * a})` }}>
        <Seal size={300} color={TEA} />
      </div>
      <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 132, color: TEA, lineHeight: 1, opacity: a, letterSpacing: -1 }}>Heritage Brews</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 52, color: INK, opacity: b, textAlign: "center", lineHeight: 1.25 }}>
        Premium organic teas
        <br />
        from Bangladesh
      </div>
      <div style={{ display: "flex", gap: 18, alignItems: "center", fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: CLAY, opacity: b }}>
        FAIR WAGES <Leaf size={30} color={GOLD} /> ETHICAL <Leaf size={30} color={GOLD} /> ORGANIC
      </div>
      <div
        style={{
          marginTop: 20,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 50,
          color: CREAM,
          background: TEA,
          padding: "26px 64px",
          borderRadius: 999,
          boxShadow: `0 0 0 6px ${CREAM}, 0 0 0 9px ${GOLD}`,
          opacity: c,
          transform: `scale(${(0.7 + 0.3 * c) * (1 + Math.sin(f / 6) * 0.02)})`,
        }}
      >
        Shop now · link in bio
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 30, color: INK, opacity: c * 0.7 }}>heritage-brews.lovable.app</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------
type Cut = { at: number; dur: number; node: (d: number) => React.ReactNode };

export const HeritageIntro: React.FC = () => {
  const { fps } = useVideoConfig();
  const cuts: Cut[] = [
    {
      at: 0,
      dur: 3,
      node: (d) => (
        <>
          <Photo n={1} dur={d} z0={1.14} z1={1.04} fy={40} />
          <AbsoluteFill style={{ top: T, alignItems: "center" }}>
            <Title kicker="Dhaka, Bangladesh" text={"Every cup\nhas a story."} size={120} delay={6} />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 3,
      dur: 3,
      node: (d) => (
        <>
          <Photo n={2} dur={d} z0={1.04} z1={1.14} fx={35} fy={55} />
          <AbsoluteFill style={{ top: 1150, alignItems: "center" }}>
            <Title kicker="Premium · Organic" text={"Ours begins\nin Bangladesh."} size={104} delay={4} />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 6,
      dur: 3,
      node: (d) => (
        <>
          <Photo n={3} dur={d} z0={1.55} z1={1.65} fx={45} fy={52} />
          <AbsoluteFill style={{ top: T, alignItems: "center" }}>
            <Title kicker="Our journey" text="Brewed with heart." size={104} delay={4} />
          </AbsoluteFill>
        </>
      ),
    },
    { at: 9, dur: 3.5, node: () => <Mission /> },
    { at: 12.5, dur: 3, node: () => <Pillars /> },
    { at: 15.5, dur: 1.8, node: () => <Shipping /> },
    { at: 17.3, dur: 2.7, node: () => <EndCard /> },
  ];
  return (
    <AbsoluteFill style={{ background: INK }}>
      {cuts.map((c, i) => (
        <Sequence key={i} from={Math.round(c.at * fps)} durationInFrames={Math.round(c.dur * fps) + (i < cuts.length - 1 ? 12 : 0)}>
          <Rise first={i === 0}>{c.node(Math.round(c.dur * fps))}</Rise>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
