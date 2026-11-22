// 尋安小卡 — three 15s mobile Reels selling the postcards ($25 each, 5 designs).
// The postcards are artwork, not photos, so they are shown as physical cards
// (no photo filter) on pearl paper; the brand signature stays on every cut.
import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  BLACK,
  ChromeStar,
  Cut,
  EndCard,
  Glints,
  HeartWingMark,
  Headline,
  K,
  LILAC,
  PEARL,
  PIXEL,
  PearlGrade,
  ROUND,
  SILVER,
  Timeline,
  clamp,
} from "./brand";
import { CARDS, CARD_A, CARD_B, CARD_C } from "./copy";

export const CARD_SECONDS = 15;
const T = 290;

const AR: Record<number, number> = { 1: 1280 / 1920, 2: 1000 / 2000, 3: 1344 / 1792, 4: 1280 / 1920, 5: 1280 / 1920 };
const card = (n: number) => staticFile(`heartwings/cards/c${n}.jpg`);

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .4  0 0 0 0 .4  0 0 0 0 .4  0 0 0 .5 0'/></filter><rect width='220' height='220' filter='url(%23n)'/></svg>\")";

const Paper: React.FC<{ tint?: number }> = ({ tint = 0 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: PEARL }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(45% 30% at ${20 + tint * 50}% 18%, ${LILAC}55, transparent 70%), radial-gradient(40% 26% at ${85 - tint * 40}% 88%, ${LILAC}40, transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: "linear-gradient(rgba(10,10,10,.045) 2px, transparent 2px), linear-gradient(90deg, rgba(10,10,10,.045) 2px, transparent 2px)",
          backgroundSize: "90px 90px",
          backgroundPosition: `0 ${f * 0.6}px`,
        }}
      />
      <AbsoluteFill style={{ backgroundImage: GRAIN, opacity: 0.14, mixBlendMode: "multiply" }} />
    </AbsoluteFill>
  );
};

// one physical postcard: springs in, floats, catches a chrome sheen
const Postcard: React.FC<{ n: number; h: number; rot?: number; delay?: number; dx?: number; dy?: number; sheen?: number; enter?: "up" | "pop" | "none" }> = ({
  n,
  h,
  rot = 0,
  delay = 0,
  dx = 0,
  dy = 0,
  sheen = 10,
  enter = "up",
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = enter === "none" ? 1 : spring({ frame: f - delay, fps, config: { damping: 15, stiffness: 120 } });
  const w = h * AR[n];
  const sx = interpolate(f, [delay + sheen, delay + sheen + 22], [-60, 160], clamp);
  const float = Math.sin((f + n * 13) / 18) * 6;
  const t =
    enter === "pop"
      ? `translate(${dx}px, ${dy + float}px) rotate(${rot}deg) scale(${0.6 + 0.4 * s})`
      : `translate(${dx}px, ${dy + float + (1 - s) * 900}px) rotate(${rot + (1 - s) * 18}deg)`;
  return (
    <div
      style={{
        position: "absolute",
        width: w,
        height: h,
        left: -w / 2,
        top: -h / 2,
        transform: t,
        opacity: enter === "pop" ? s : 1,
        borderRadius: 14,
        overflow: "hidden",
        background: "#fff",
        boxShadow: `0 2px 0 ${SILVER}, 0 30px 60px -18px rgba(10,10,10,.45), 0 0 0 3px ${K}`,
      }}
    >
      <Img src={card(n)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(115deg, transparent ${sx - 18}%, rgba(255,255,255,.65) ${sx}%, transparent ${sx + 18}%)`,
          mixBlendMode: "soft-light",
        }}
      />
    </div>
  );
};

// card anchored at a point on the canvas
const At: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => (
  <div style={{ position: "absolute", left: x, top: y }}>{children}</div>
);

// full-bleed detail of a card (an HK corner up close)
const CardMacro: React.FC<{ n: number; dur: number; fx: number; fy: number; z0: number; z1: number }> = ({ n, dur, fx, fy, z0, z1 }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, dur], [z0, z1]);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: PEARL }}>
      <Img
        src={card(n)}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transformOrigin: `${fx}% ${fy}%`,
          transform: `translate(${50 - fx}%, ${50 - fy}%) scale(${z})`,
        }}
      />
      <PearlGrade />
    </AbsoluteFill>
  );
};

// "No.02 茶餐廳" sticker
const Tag: React.FC<{ label: string; y?: number }> = ({ label, y = 1330 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 6, fps, config: { damping: 11, stiffness: 160 } });
  const [no, ...rest] = label.split(" ");
  return (
    <AbsoluteFill style={{ top: y, alignItems: "center" }}>
      <div
        style={{
          background: PEARL,
          border: `3px solid ${K}`,
          borderRadius: 22,
          boxShadow: `6px 6px 0 ${K}`,
          padding: "12px 34px 16px",
          display: "flex",
          alignItems: "baseline",
          gap: 18,
          transform: `rotate(${-3 + Math.sin(f / 10) * 1.5}deg) scale(${s})`,
        }}
      >
        <span style={{ fontFamily: PIXEL, fontWeight: 700, fontSize: 44, color: LILAC, WebkitTextStroke: `1.5px ${K}` }}>{no}</span>
        <span style={{ fontFamily: BLACK, fontWeight: 900, fontSize: 76, color: K }}>{rest.join(" ")}</span>
      </div>
    </AbsoluteFill>
  );
};

// big chrome price block
const Price: React.FC<{ text: string; sub: string; y: number; delay?: number }> = ({ text, sub, y, delay = 4 }) => (
  <AbsoluteFill style={{ top: y, alignItems: "center" }}>
    <Headline text={text} sub={sub} size={150} delay={delay} variant="chrome" />
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------
// Card Reel 1 — THE COLLECTION: deal the five, then the price
// ---------------------------------------------------------------------------
export const CardReel1: React.FC = () => {
  const hero = (n: number, label: string, rot: number) => () => (
    <>
      <Paper tint={n / 5} />
      <At x={540} y={930}>
        <Postcard n={n} h={1000} rot={rot} enter="pop" sheen={6} />
      </At>
      <Tag label={label} y={1360} />
    </>
  );
  const cuts: Cut[] = [
    {
      at: 0,
      dur: 2.5,
      node: () => (
        <>
          <Paper />
          {[2, 3, 4, 5, 1].map((n, i) => (
            <At key={n} x={540} y={1060}>
              <Postcard n={n} h={720} rot={(i - 2) * 9} dx={(i - 2) * 110} dy={Math.abs(i - 2) * 30} delay={2 + i * 4} sheen={30} />
            </At>
          ))}
          <AbsoluteFill style={{ top: T, alignItems: "center" }}>
            <Headline text={CARD_A.hook} size={96} delay={4} />
          </AbsoluteFill>
        </>
      ),
    },
    { at: 2.5, dur: 1.6, node: hero(1, CARD_A.n1, -3) },
    { at: 4.1, dur: 1.6, node: hero(2, CARD_A.n2, 3) },
    { at: 5.7, dur: 1.6, node: hero(3, CARD_A.n3, -2) },
    { at: 7.3, dur: 1.6, node: hero(4, CARD_A.n4, 2) },
    { at: 8.9, dur: 1.6, node: hero(5, CARD_A.n5, -3) },
    {
      at: 10.5,
      dur: 1.5,
      node: () => (
        <>
          <Paper tint={1} />
          {[1, 2, 3].map((n, i) => (
            <At key={n} x={260 + i * 280} y={760}>
              <Postcard n={n} h={380} rot={(i - 1) * 5} enter="pop" delay={i * 2} />
            </At>
          ))}
          {[4, 5].map((n, i) => (
            <At key={n} x={400 + i * 280} y={1140}>
              <Postcard n={n} h={380} rot={i ? 4 : -4} enter="pop" delay={6 + i * 2} />
            </At>
          ))}
          <Price text={CARD_A.price} sub={CARD_A.priceSub} y={T - 30} />
        </>
      ),
    },
    { at: 12, dur: 3, end: true, node: () => <EndCard mobile badge={CARDS.badge} foot={CARDS.foot} /> },
  ];
  return (
    <AbsoluteFill style={{ background: K }}>
      <Timeline cuts={cuts} mobile />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Card Reel 2 — HK MOMENTS: four corners of the city, up close
// ---------------------------------------------------------------------------
export const CardReel2: React.FC = () => {
  const corner = (n: number, fx: number, fy: number, text: string, top = true) => (d: number) => (
    <>
      <CardMacro n={n} dur={d} fx={fx} fy={fy} z0={1.9} z1={1.55} />
      <AbsoluteFill style={{ top: top ? T : 1250, alignItems: "center" }}>
        <Headline text={text} size={88} delay={4} />
      </AbsoluteFill>
    </>
  );
  const cuts: Cut[] = [
    {
      at: 0,
      dur: 2.5,
      node: () => (
        <>
          <Paper />
          <At x={540} y={1000}>
            <Postcard n={2} h={1060} rot={-4} delay={2} sheen={24} />
          </At>
          <AbsoluteFill style={{ top: T, alignItems: "center" }}>
            <Headline text={CARD_B.hook} size={84} delay={6} />
          </AbsoluteFill>
        </>
      ),
    },
    { at: 2.5, dur: 2.5, node: corner(2, 62, 20, CARD_B.m1, false) },
    { at: 5, dur: 2.5, node: corner(3, 50, 12, CARD_B.m2, false) },
    { at: 7.5, dur: 2.5, node: corner(4, 62, 74, CARD_B.m3) },
    { at: 10, dur: 2, node: corner(5, 50, 72, CARD_B.m4) },
    { at: 12, dur: 3, end: true, node: () => <EndCard mobile badge={CARDS.badge} foot={CARD_B.end} /> },
  ];
  return (
    <AbsoluteFill style={{ background: K }}>
      <Timeline cuts={cuts} mobile />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Card Reel 3 — 尋安 WHISPER: write one, send it to a tired friend
// ---------------------------------------------------------------------------
const H3 = 1040;
const W3 = H3 * AR[1];

// the back of the card: stamp box with the mark, address lines, a note being written
const CardBack: React.FC<{ write?: number }> = ({ write = 0 }) => {
  const f = useCurrentFrame();
  const typed = (s: string, from: number) => s.slice(0, Math.max(0, Math.floor((f - from) / 2.2)));
  const to = write ? typed(CARD_C.to, write) : CARD_C.to;
  const note = write ? typed(CARD_C.note, write + CARD_C.to.length * 2.2 + 6) : CARD_C.note;
  return (
    <div style={{ position: "absolute", inset: 0, background: PEARL, backgroundImage: GRAIN, padding: 56, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontFamily: PIXEL, fontWeight: 700, fontSize: 52, color: K, letterSpacing: 4 }}>POST CARD</div>
        <div style={{ width: 150, height: 180, border: `3px dashed ${SILVER}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: `${LILAC}30` }}>
          <HeartWingMark size={110} flap={false} />
        </div>
      </div>
      <div style={{ fontFamily: PIXEL, fontWeight: 700, fontSize: 26, color: SILVER, marginTop: 6 }}>heartwing • 尋安</div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 46, paddingTop: 30 }}>
        <div style={{ fontFamily: ROUND, fontSize: 62, color: K, minHeight: 80 }}>{to}</div>
        <div style={{ fontFamily: ROUND, fontSize: 70, color: K, minHeight: 90, lineHeight: 1.4 }}>{note}</div>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ height: 3, background: `${SILVER}aa`, marginTop: i ? 40 : 0 }} />
        ))}
      </div>
      <div style={{ alignSelf: "flex-end" }}>
        <ChromeStar size={56} />
      </div>
    </div>
  );
};

const CardFrame: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      position: "absolute",
      left: -W3 / 2,
      top: -H3 / 2,
      width: W3,
      height: H3,
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: `0 30px 60px -18px rgba(10,10,10,.45), 0 0 0 3px ${K}`,
      backfaceVisibility: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

const FlipCard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 4, fps, config: { damping: 16, stiffness: 90 } });
  const ry = 180 - s * 180;
  return (
    <div style={{ position: "absolute", left: 540, top: 960, perspective: 2400 }}>
      <div style={{ transformStyle: "preserve-3d", transform: `rotateY(${ry}deg) rotate(${-2 + s * 2}deg)` }}>
        <CardFrame style={{ transform: "rotateY(180deg)" }}>
          <CardBack />
        </CardFrame>
        <CardFrame>
          <Img src={card(1)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </CardFrame>
      </div>
    </div>
  );
};

export const CardReel3: React.FC = () => {
  const { width, height } = useVideoConfig();
  const cuts: Cut[] = [
    {
      at: 0,
      dur: 2.5,
      dark: true,
      node: () => <Hook3 w={width} h={height} />,
    },
    {
      at: 2.5,
      dur: 2.5,
      node: () => (
        <>
          <Paper />
          <div style={{ position: "absolute", left: 540, top: 980 }}>
            <CardFrame style={{ transform: "rotate(-2deg)" }}>
              <CardBack write={8} />
            </CardFrame>
          </div>
          <AbsoluteFill style={{ top: T, alignItems: "center" }}>
            <Headline text={CARD_C.quiet} size={92} delay={2} variant="soft" />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 5,
      dur: 2.5,
      node: () => (
        <>
          <Paper tint={0.5} />
          <FlipCard />
          <AbsoluteFill style={{ top: T - 10, alignItems: "center" }}>
            <Headline text={CARD_C.write} size={86} delay={20} />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 7.5,
      dur: 2.5,
      node: (d) => (
        <>
          <CardMacro n={1} dur={d} fx={50} fy={46} z0={1.35} z1={1.5} />
          <AbsoluteFill style={{ top: T, alignItems: "center" }}>
            <Headline text={CARD_C.get} size={84} delay={14} variant="soft" />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 10,
      dur: 2,
      node: () => (
        <>
          <Paper tint={1} />
          <At x={540} y={1080}>
            <Postcard n={3} h={640} rot={-12} dx={-230} enter="pop" delay={0} />
            <Postcard n={5} h={640} rot={12} dx={230} enter="pop" delay={4} />
            <Postcard n={1} h={720} rot={0} dy={-20} enter="pop" delay={8} sheen={14} />
          </At>
          <Price text={CARD_C.price} sub={CARD_C.priceSub} y={T - 30} delay={6} />
        </>
      ),
    },
    { at: 12, dur: 3, end: true, node: () => <EndCard mobile badge={CARDS.badge} foot={CARDS.foot} /> },
  ];
  return (
    <AbsoluteFill style={{ background: K }}>
      <Timeline cuts={cuts} mobile />
    </AbsoluteFill>
  );
};

// opening: a lone card back, lit in the dark
const Hook3: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const f = useCurrentFrame();
  const r = interpolate(f, [0, 24], [10, 60], clamp);
  const mask = `radial-gradient(circle at 50% 56%, #000 ${r}%, transparent ${r + 22}%)`;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(90% 60% at 50% 55%, #1d1d22, ${K} 75%)` }}>
      <AbsoluteFill style={{ WebkitMaskImage: mask, maskImage: mask }}>
        <div style={{ position: "absolute", left: 540, top: 1080, transform: `rotate(${4 - f * 0.05}deg) scale(${0.78 + f * 0.0012})` }}>
          <CardFrame>
            <CardBack />
          </CardFrame>
        </div>
      </AbsoluteFill>
      <Glints seed={9} w={w} h={h} n={9} />
      <AbsoluteFill style={{ top: T, alignItems: "center" }}>
        <Headline text={CARD_C.hook} size={80} delay={6} variant="neon" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
