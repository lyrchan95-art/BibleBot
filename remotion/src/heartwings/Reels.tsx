// Three more 15s mobile Reels for the vintage jewellery jar, one per content pillar.
import React from "react";
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  BLACK,
  ChromeStar,
  Cut,
  EndCard,
  GOLD,
  Glints,
  Headline,
  K,
  LILAC,
  Macro,
  PEARL,
  PHOTO_FILTER,
  PIXEL,
  Photo,
  ROUND,
  SILVER_LT,
  SpotlightPhoto,
  Timeline,
  chrome,
  clamp,
  img,
} from "./brand";
import { REEL_A, REEL_B, REEL_C } from "./copy";

export const REEL_SECONDS = 15;
const T = 300;

// ---------------------------------------------------------------------------
// Reel A — SILVER ARMOR: "數下呢罐有幾多寶" (macro detail hunt)
// ---------------------------------------------------------------------------
const Tag: React.FC<{ label: string }> = ({ label }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 3, fps, config: { damping: 11, stiffness: 160 } });
  const [no, ...rest] = label.split(" ");
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 1080,
        transform: `rotate(${-6 + Math.sin(f / 10) * 2}deg) scale(${s})`,
        transformOrigin: "20px 0",
      }}
    >
      <div style={{ width: 3, height: 90, background: SILVER_LT, marginLeft: 60 }} />
      <div
        style={{
          background: PEARL,
          border: `3px solid ${K}`,
          borderRadius: "22px 22px 22px 6px",
          boxShadow: `6px 6px 0 ${K}`,
          padding: "18px 36px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div style={{ fontFamily: PIXEL, fontWeight: 700, fontSize: 44, color: LILAC, WebkitTextStroke: `1.5px ${K}` }}>{no}</div>
        <div style={{ fontFamily: BLACK, fontWeight: 900, fontSize: 84, color: K }}>{rest.join(" ")}</div>
      </div>
    </div>
  );
};

export const ReelA: React.FC = () => {
  const { width, height } = useVideoConfig();
  const macro = (n: number, fx: number, fy: number, label: string) => (d: number) => (
    <>
      <Macro n={n} dur={d} fx={fx} fy={fy} />
      <Tag label={label} />
    </>
  );
  const cuts: Cut[] = [
    {
      at: 0,
      dur: 2.5,
      node: (d) => (
        <>
          <Photo n={2} dur={d} from={1.0} to={1.14} />
          <Glints seed={11} w={width} h={height} />
          <AbsoluteFill style={{ top: T, alignItems: "center" }}>
            <Headline text={REEL_A.hook} size={90} delay={3} />
          </AbsoluteFill>
        </>
      ),
    },
    { at: 2.5, dur: 2, node: macro(2, 44, 42, REEL_A.n1) },
    { at: 4.5, dur: 2, node: macro(2, 80, 80, REEL_A.n2) },
    { at: 6.5, dur: 2, node: macro(5, 39, 25, REEL_A.n3) },
    { at: 8.5, dur: 1.5, node: macro(5, 52, 56, REEL_A.n4) },
    {
      at: 10,
      dur: 2,
      node: (d) => (
        <>
          <Photo n={3} dur={d} from={1.35} to={1.0} />
          <AbsoluteFill style={{ top: T - 20, alignItems: "center" }}>
            <Headline text={REEL_A.end} sub={REEL_A.endSub} size={180} delay={2} variant="chrome" />
          </AbsoluteFill>
        </>
      ),
    },
    { at: 12, dur: 3, end: true, node: () => <EndCard mobile /> },
  ];
  return (
    <AbsoluteFill style={{ background: K }}>
      <Timeline cuts={cuts} mobile />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Reel B — HK MOMENTS: 2AM, tired girls, Mong Kok
// ---------------------------------------------------------------------------
const NightTint: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,10,10,.45), rgba(10,10,10,.68))" }} />
    <AbsoluteFill style={{ boxShadow: `inset 0 0 160px rgba(200,182,217,.35)` }} />
  </>
);

const Clock: React.FC = () => {
  const f = useCurrentFrame();
  const blink = Math.floor(f / 15) % 2 === 0;
  return (
    <div style={{ position: "absolute", top: 270, right: 160, fontFamily: PIXEL, fontWeight: 700, fontSize: 46, color: LILAC, textShadow: `0 0 16px ${LILAC}` }}>
      02{blink ? ":" : " "}00 AM
    </div>
  );
};

const StationSign: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: { damping: 14, stiffness: 140 } });
  return (
    <div
      style={{
        position: "absolute",
        top: 300,
        left: 90,
        right: 170,
        transform: `translateY(${(1 - s) * -40}px)`,
        opacity: s,
        background: PEARL,
        border: `4px solid ${K}`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: `0 18px 40px -16px rgba(0,0,0,.6)`,
      }}
    >
      <div style={{ height: 22, background: LILAC, borderBottom: `3px solid ${K}` }} />
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 26, padding: "14px 0 18px" }}>
        <span style={{ fontFamily: BLACK, fontWeight: 900, fontSize: 104, color: K }}>{REEL_B.station}</span>
        <span style={{ fontFamily: PIXEL, fontWeight: 700, fontSize: 56, color: K }}>{REEL_B.stationEn}</span>
      </div>
    </div>
  );
};

export const ReelB: React.FC = () => {
  const cuts: Cut[] = [
    {
      at: 0,
      dur: 2.5,
      dark: true,
      node: (d) => (
        <>
          <SpotlightPhoto dur={d} />
          <Clock />
          <AbsoluteFill style={{ top: 400, alignItems: "center" }}>
            <Headline text={REEL_B.hook} size={96} delay={6} variant="neon" />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 2.5,
      dur: 2.5,
      dark: true,
      node: (d) => (
        <>
          <Photo n={4} dur={d} from={1.1} to={1.0} />
          <NightTint />
          <Clock />
          <AbsoluteFill style={{ top: 1200, alignItems: "center" }}>
            <Headline text={REEL_B.deserve} size={86} delay={3} variant="neon" />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 5,
      dur: 2.5,
      dark: true,
      node: (d) => (
        <>
          <Photo n={5} dur={d} oy={60} />
          <NightTint />
          <AbsoluteFill style={{ top: T, alignItems: "center" }}>
            <ArmorTitle />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 7.5,
      dur: 2.5,
      node: (d) => (
        <>
          <Photo n={2} dur={d} from={1.0} to={1.1} />
          <StationSign />
          <AbsoluteFill style={{ top: 1180, alignItems: "center" }}>
            <Headline text={REEL_B.wind} sub={REEL_B.windEn} size={84} delay={6} />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 10,
      dur: 2,
      node: (d) => (
        <>
          <Photo n={3} dur={d} ox={40} />
          <AbsoluteFill style={{ top: T, alignItems: "center" }}>
            <Headline text={REEL_B.stall} size={82} delay={2} />
          </AbsoluteFill>
        </>
      ),
    },
    { at: 12, dur: 3, end: true, node: () => <EndCard mobile /> },
  ];
  return (
    <AbsoluteFill style={{ background: K }}>
      <Timeline cuts={cuts} mobile />
    </AbsoluteFill>
  );
};

const ArmorTitle: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f - 3, fps, config: { damping: 12, stiffness: 160 } });
  const b = spring({ frame: f - 12, fps, config: { damping: 12, stiffness: 160 } });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ fontFamily: PIXEL, fontWeight: 700, fontSize: 150, lineHeight: 1, transform: `scale(${0.6 + a * 0.4})`, opacity: a, ...chrome() }}>pearl armor</div>
      <div style={{ fontFamily: PIXEL, fontWeight: 700, fontSize: 70, color: PEARL, textShadow: `0 0 18px ${LILAC}, 0 0 40px ${LILAC}`, opacity: b, transform: `translateY(${(1 - b) * 16}px)` }}>
        for tired girls
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Reel C — 尋安 WHISPER: the postcard tucked into every jar
// ---------------------------------------------------------------------------
const Ginkgo: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="-60 -60 120 120">
    <path d="M0 50 L0 6 C -36 4 -52 -22 -44 -40 C -28 -34 -14 -40 0 -26 C 14 -40 28 -34 44 -40 C 52 -22 36 4 0 6" fill={GOLD} opacity={0.75} />
    <path d="M0 6 C -10 -10 -18 -22 -26 -34 M0 6 C 0 -12 0 -20 0 -26 M0 6 C 10 -10 18 -22 26 -34" stroke="#a7861f" strokeWidth={2} fill="none" opacity={0.6} />
  </svg>
);

const Postcard: React.FC<{ enterAt: number; zoomAt?: number }> = ({ enterAt, zoomAt }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - enterAt, fps, config: { damping: 18, stiffness: 90 } });
  const z = zoomAt != null ? interpolate(f, [zoomAt, zoomAt + 50], [1, 1.18], clamp) : 1;
  const blob = (x: number, y: number, r: number, c: string): React.CSSProperties => ({
    position: "absolute",
    left: x - r,
    top: y - r,
    width: r * 2,
    height: r * 2,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${c} 0%, transparent 70%)`,
    filter: "blur(10px)",
    mixBlendMode: "multiply",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 190,
        top: 560,
        width: 700,
        height: 960,
        transform: `translateY(${(1 - s) * 900}px) rotate(${-4 + s * 2}deg) scale(${z})`,
        background: PEARL,
        borderRadius: 10,
        boxShadow: "0 40px 80px -30px rgba(0,0,0,.65), 0 2px 0 rgba(0,0,0,.15)",
        overflow: "hidden",
      }}
    >
      <div style={blob(220, 300, 260, "rgba(200,182,217,.75)")} />
      <div style={blob(500, 520, 230, "rgba(212,175,55,.35)")} />
      <div style={blob(300, 700, 260, "rgba(170,190,215,.45)")} />
      <div style={{ position: "absolute", left: 260, top: 300 }}>
        <Ginkgo size={200} />
      </div>
      <div style={{ position: "absolute", right: 40, top: 40 }}>
        <ChromeStar size={56} spin={false} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 150, textAlign: "center", fontFamily: ROUND, fontSize: 46, color: K, letterSpacing: 4 }}>
        {REEL_C.cardLine}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 104, textAlign: "center", fontFamily: ROUND, fontSize: 24, color: "#6b6760" }}>
        {REEL_C.cardRef}
      </div>
      <div style={{ position: "absolute", left: 40, bottom: 36, fontFamily: ROUND, fontSize: 26, color: "#6b6760", letterSpacing: 4 }}>心翼 • 尋安</div>
    </div>
  );
};

const PostcardScene: React.FC<{ enterAt: number; zoomAt?: number }> = ({ enterAt, zoomAt }) => (
  <AbsoluteFill style={{ background: K }}>
    <AbsoluteFill style={{ opacity: 0.55 }}>
      <Img src={img(3)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: `blur(22px) ${PHOTO_FILTER}` }} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(10,10,10,.2), rgba(10,10,10,.55))` }} />
    <Postcard enterAt={enterAt} zoomAt={zoomAt} />
  </AbsoluteFill>
);

const RestWord: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [2, 14, 24, 30], [0, 1, 1, 0.9], clamp);
  return (
    <AbsoluteFill style={{ background: K, alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: ROUND, fontSize: 150, color: PEARL, letterSpacing: 30, opacity: o, textShadow: `0 0 40px ${LILAC}66` }}>{REEL_C.rest}</div>
    </AbsoluteFill>
  );
};

export const ReelC: React.FC = () => {
  const cuts: Cut[] = [
    {
      at: 0,
      dur: 2.5,
      node: (d) => (
        <>
          <Photo n={5} dur={d} from={1.1} to={1.02} oy={55} />
          <AbsoluteFill style={{ top: T, alignItems: "center" }}>
            <Headline text={REEL_C.hook} size={84} delay={4} variant="soft" />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 2.5,
      dur: 2.5,
      node: (d) => (
        <>
          <Photo n={2} dur={d} from={1.02} to={1.08} />
          <AbsoluteFill style={{ top: 1240, alignItems: "center" }}>
            <Headline text={REEL_C.notJewel} size={92} delay={6} variant="soft" />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 5,
      dur: 3.5,
      dark: true,
      node: () => (
        <>
          <PostcardScene enterAt={4} />
          <AbsoluteFill style={{ top: T, alignItems: "center" }}>
            <Headline text={REEL_C.card} size={84} delay={24} variant="soft" />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 8.5,
      dur: 2.5,
      dark: true,
      node: () => (
        <>
          <PostcardScene enterAt={-60} zoomAt={0} />
          <AbsoluteFill style={{ top: T, alignItems: "center" }}>
            <Headline text={REEL_C.discover} size={76} delay={4} variant="soft" />
          </AbsoluteFill>
        </>
      ),
    },
    { at: 11, dur: 1, dark: true, node: () => <RestWord /> },
    { at: 12, dur: 3, end: true, node: () => <EndCard mobile /> },
  ];
  return (
    <AbsoluteFill style={{ background: K }}>
      <Timeline cuts={cuts} mobile />
    </AbsoluteFill>
  );
};
