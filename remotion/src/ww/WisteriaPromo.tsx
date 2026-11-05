import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MARU, MINCHO } from "./fonts";

// The game's own palette
const PAPER = "#edefe7";
const CARD = "#fbfbf7";
const INK = "#2d2935";
const WISTERIA = "#8a6bbd";
const DEEP = "#583c88";
const SOFT = "#e9e0f5";
const BLUSH = "#e88fa6";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Shot = {
  src?: string; // take clip in public/ww/<fmt>/
  at: number; // seconds
  dur: number;
  start?: number; // seconds into the take
  rate?: number;
  text?: string;
  sub?: string;
  label?: string; // garden name chip
};

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------
const Footage: React.FC<{ shot: Shot; fmt: string; fadeF: number }> = ({ shot, fmt, fadeF }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = Math.round(shot.dur * fps);
  const fade = Math.max(1, fadeF);
  const op = Math.min(
    fadeF === 0 ? 1 : interpolate(f, [0, fade], [0, 1], clamp),
    interpolate(f, [total - 2, total + fade], [1, 0], clamp),
  );
  const push = interpolate(f, [0, total], [1.0, 1.035]);
  return (
    <AbsoluteFill style={{ opacity: op, transform: `scale(${push})` }}>
      <OffthreadVideo
        src={staticFile(`ww/${fmt}/${shot.src}.mp4`)}
        startFrom={Math.round((shot.start ?? 0) * fps)}
        playbackRate={shot.rate ?? 1}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ text: string; sub?: string; mobile: boolean; dur: number }> = ({ text, sub, mobile, dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = Math.round(dur * fps);
  const s = spring({ frame: f - 3, fps, config: { damping: 16, stiffness: 160 } });
  const out = interpolate(f, [total - 8, total], [1, 0], clamp);
  const pos: React.CSSProperties = mobile
    ? { top: 300, left: 70, right: 160, alignItems: "flex-start" }
    : { bottom: 110, left: 0, right: 420, alignItems: "center" };
  return (
    <div style={{ position: "absolute", display: "flex", flexDirection: "column", gap: 14, ...pos, opacity: out }}>
      <div
        style={{
          fontFamily: MINCHO,
          fontWeight: 800,
          fontSize: mobile ? 64 : 62,
          lineHeight: 1.1,
          color: DEEP,
          background: `${CARD}f2`,
          borderRadius: mobile ? 28 : 24,
          padding: mobile ? "22px 32px 26px" : "16px 34px 20px",
          boxShadow: "0 18px 40px -18px rgba(70,45,110,.55)",
          transform: `translateY(${(1 - s) * 30}px) rotate(${mobile ? -1.2 : 0}deg)`,
          opacity: s,
          maxWidth: mobile ? 850 : 1300,
          textAlign: mobile ? "left" : "center",
        }}
      >
        {text}
      </div>
      {sub ? (
        <div
          style={{
            fontFamily: MARU,
            fontWeight: 700,
            fontSize: mobile ? 36 : 30,
            color: CARD,
            background: WISTERIA,
            borderRadius: 999,
            padding: "8px 22px",
            opacity: interpolate(f, [10, 20], [0, 1], clamp),
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};

const GardenLabel: React.FC<{ label: string; mobile: boolean }> = ({ label, mobile }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [4, 14], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: mobile ? 470 : 150,
        ...(mobile ? { right: 160 } : { left: 60 }),
        fontFamily: MARU,
        fontWeight: 700,
        fontSize: mobile ? 32 : 28,
        color: DEEP,
        background: `${SOFT}f0`,
        padding: "8px 20px",
        borderRadius: 999,
        opacity: o,
        transform: `translateX(${(1 - o) * 20}px)`,
      }}
    >
      {label}
    </div>
  );
};

const CatFace: React.FC<{ size: number; color?: string }> = ({ size, color = WISTERIA }) => (
  <svg width={size} height={size} viewBox="-50 -55 100 100">
    <path d="M-40 -8 L-34 -48 L-12 -30 Z M40 -8 L34 -48 L12 -30 Z" fill={color} />
    <ellipse cx="0" cy="0" rx="44" ry="36" fill={color} />
    <ellipse cx="-15" cy="-2" rx="5" ry="6" fill={CARD} />
    <ellipse cx="15" cy="-2" rx="5" ry="6" fill={CARD} />
    <path d="M-4 10 L4 10 L0 15 Z" fill={BLUSH} />
  </svg>
);

const EndCard: React.FC<{ mobile: boolean; dur: number; fmt: string; bg: string }> = ({ mobile, dur, fmt, bg }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f - 2, fps, config: { damping: 15, stiffness: 140 } });
  const b = spring({ frame: f - Math.round(0.5 * fps), fps, config: { damping: 15, stiffness: 140 } });
  const c = spring({ frame: f - Math.round(0.95 * fps), fps, config: { damping: 12, stiffness: 160 } });
  const pulse = 1 + Math.sin(f / fps * 5) * 0.025;
  const fadeIn = interpolate(f, [0, 10], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <AbsoluteFill style={{ filter: "blur(14px) saturate(1.1)", transform: "scale(1.15)" }}>
        <OffthreadVideo src={staticFile(`ww/${fmt}/${bg}.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `${PAPER}a6` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: mobile ? 34 : 26, padding: mobile ? "0 80px" : 0 }}>
        <div style={{ transform: `scale(${0.6 + a * 0.4})`, opacity: a }}>
          <CatFace size={mobile ? 150 : 120} />
        </div>
        <div
          style={{
            fontFamily: MINCHO,
            fontWeight: 800,
            fontSize: mobile ? 104 : 104,
            lineHeight: 1.02,
            color: DEEP,
            textAlign: "center",
            opacity: a,
            transform: `translateY(${(1 - a) * 24}px)`,
          }}
        >
          Wisteria
          {mobile ? <br /> : " "}
          <span style={{ color: WISTERIA }}>&amp;</span> Whiskers
        </div>
        <div style={{ fontFamily: MARU, fontWeight: 700, fontSize: mobile ? 44 : 38, color: INK, opacity: b, transform: `translateY(${(1 - b) * 18}px)` }}>
          Can you find all twelve?
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: MARU,
            fontWeight: 700,
            fontSize: mobile ? 44 : 36,
            color: CARD,
            background: `linear-gradient(90deg, ${WISTERIA}, ${BLUSH})`,
            padding: mobile ? "22px 52px" : "18px 46px",
            borderRadius: 999,
            boxShadow: "0 16px 34px -14px rgba(88,60,136,.7)",
            opacity: c,
            transform: `scale(${(0.7 + c * 0.3) * pulse})`,
          }}
        >
          Play free in your browser
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Generic promo builder
// ---------------------------------------------------------------------------
const Promo: React.FC<{ fmt: "mobile" | "desktop"; shots: Shot[]; end: { at: number; dur: number; bg: string } }> = ({
  fmt,
  shots,
  end,
}) => {
  const { fps } = useVideoConfig();
  const mobile = fmt === "mobile";
  const fadeF = mobile ? 5 : 10;
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {shots.map((s, i) => {
        const from = Math.round(s.at * fps);
        const d = Math.round(s.dur * fps);
        return (
          <Sequence key={i} from={from} durationInFrames={d + fadeF}>
            <Footage shot={s} fmt={fmt} fadeF={i === 0 ? 0 : fadeF} />
            {s.label ? <GardenLabel label={s.label} mobile={mobile} /> : null}
            {s.text ? <Caption text={s.text} sub={s.sub} mobile={mobile} dur={s.dur} /> : null}
          </Sequence>
        );
      })}
      <Sequence from={Math.round(end.at * fps)} durationInFrames={Math.round(end.dur * fps)}>
        <EndCard mobile={mobile} dur={end.dur} fmt={fmt} bg={end.bg} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// MOBILE — 15 s, hook first
// ---------------------------------------------------------------------------
export const MOBILE_SHOTS: Shot[] = [
  { src: "m1_hook", at: 0, dur: 2.4, start: 0.2, text: "12 cats are hiding here" },
  { src: "m2_finds", at: 2.4, dur: 4.0, start: 0.25, text: "Tap one. Hear it mew.", sub: "Each one has a name" },
  { src: "m3_hard", at: 6.4, dur: 2.2, start: 0.3, text: "Some hide in plain sight." },
  { src: "m4_meadow", at: 8.6, dur: 2.2, start: 0.6, text: "22 painted gardens", label: "Petal Meadow" },
  { src: "m5_album", at: 10.8, dur: 1.9, rate: 1.7, text: "Collect every garden" },
];
export const MOBILE_END = { at: 12.7, dur: 2.3, bg: "m4_meadow" };
export const MOBILE_SECONDS = 15;

export const WisteriaPromoMobile: React.FC = () => <Promo fmt="mobile" shots={MOBILE_SHOTS} end={MOBILE_END} />;

// ---------------------------------------------------------------------------
// DESKTOP — 45 s, world first
// ---------------------------------------------------------------------------
export const DESKTOP_SHOTS: Shot[] = [
  { src: "d1_world", at: 0, dur: 6.6, text: "A garden, painted by hand." },
  { src: "d2_finds", at: 6.6, dur: 6.8, text: "Twelve cats are hiding in it.", sub: "Tap one to add it to your journal" },
  { src: "d3_hint", at: 13.4, dur: 3.9, text: "Stuck? Ask for a gentle hint." },
  { src: "d4_lotus", at: 17.3, dur: 2.3, label: "Lotus Pond", text: "22 gardens to explore" },
  { src: "d5_sunflower", at: 19.6, dur: 2.3, label: "Sunflower Field" },
  { src: "d6_bookshop", at: 21.9, dur: 2.3, label: "Cozy Bookshop" },
  { src: "d7_shrine", at: 24.2, dur: 2.3, label: "Snowy Shrine" },
  { src: "d8_moon", at: 26.5, dur: 2.3, label: "Moonflower Night" },
  { src: "d9_mush", at: 28.8, dur: 2.3, label: "Mushroom Woods" },
  { src: "d10_album", at: 31.1, dur: 5.2, text: "Find eight to open the next." },
];
export const DESKTOP_END = { at: 36.6, dur: 8.4, bg: "d1_world" };
export const DESKTOP_SECONDS = 45;

export const WisteriaPromoDesktop: React.FC = () => <Promo fmt="desktop" shots={DESKTOP_SHOTS} end={DESKTOP_END} />;
