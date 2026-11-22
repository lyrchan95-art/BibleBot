// Launch cut — 全港首個 Vintage 首飾盲盒罐 (mobile 15s, desktop 30s)
import React from "react";
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  Cut,
  EndCard,
  Glints,
  Headline,
  K,
  LILAC,
  PEARL,
  PHOTO_FILTER,
  PIXEL,
  PearlGrade,
  Photo,
  ROUND,
  SILVER,
  SILVER_LT,
  SpotlightPhoto,
  Timeline,
  clamp,
  img,
} from "./brand";
import { BRAND, COPY } from "./copy";

const T = 300; // keep top text below the Reels header

export const MOBILE_SECONDS = 15;
export const HeartwingsMobile: React.FC = () => {
  const { width, height } = useVideoConfig();
  const cuts: Cut[] = [
    {
      at: 0,
      dur: 2.5,
      dark: true,
      node: (d) => (
        <>
          <SpotlightPhoto dur={d} />
          <AbsoluteFill style={{ top: T, alignItems: "center" }}>
            <Headline text={COPY.hook} size={92} delay={6} />
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
          <Glints seed={2} w={width} h={height} />
          <AbsoluteFill style={{ top: T - 40, alignItems: "center" }}>
            <Headline text={COPY.first} sub={COPY.firstSub} size={170} delay={2} variant="chrome" />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 5,
      dur: 2,
      node: (d) => (
        <>
          <Photo n={3} dur={d} ox={30} oy={40} />
          <AbsoluteFill style={{ top: 1250, alignItems: "center" }}>
            <Headline text={COPY.pieces} size={84} delay={2} />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 7,
      dur: 2.5,
      node: (d) => (
        <>
          <Photo n={4} dur={d} from={1.12} to={1.02} ox={45} oy={55} />
          <AbsoluteFill style={{ top: T, alignItems: "center" }}>
            <Headline text={COPY.unique} size={88} delay={2} />
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
          <AbsoluteFill style={{ top: 1240, alignItems: "center" }}>
            <Headline text={COPY.whisper} size={74} delay={4} variant="soft" />
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
// Desktop: photo "windows" over a black, chrome-gridded world
// ---------------------------------------------------------------------------
const Window: React.FC<{ n: number; w: number; title: string; dur: number; rot?: number; delay?: number }> = ({ n, w, title, dur, rot = 0, delay = 0 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 14, stiffness: 120 } });
  const z = interpolate(f, [0, dur], [1.02, 1.1]);
  return (
    <div
      style={{
        width: w,
        border: `3px solid ${SILVER_LT}`,
        borderRadius: 18,
        overflow: "hidden",
        background: K,
        boxShadow: `0 0 0 3px ${K}, 10px 10px 0 3px ${SILVER}55, 0 30px 60px -20px rgba(0,0,0,.8)`,
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
          background: `linear-gradient(180deg, #ffffff, ${SILVER_LT} 50%, ${SILVER})`,
          borderBottom: `3px solid ${K}`,
          fontFamily: PIXEL,
          fontWeight: 700,
          fontSize: 18,
          color: K,
        }}
      >
        <span style={{ flex: 1 }}>{title}</span>
        {[PEARL, PEARL, LILAC].map((c, i) => (
          <span key={i} style={{ width: 18, height: 18, borderRadius: 5, background: c, border: `2px solid ${K}` }} />
        ))}
      </div>
      <div style={{ position: "relative", height: (w * 16) / 9, overflow: "hidden" }}>
        <Img src={img(n)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z})`, filter: PHOTO_FILTER }} />
        <PearlGrade />
      </div>
    </div>
  );
};

const World: React.FC<{ n: number }> = ({ n }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: K }}>
      <AbsoluteFill style={{ opacity: 0.28 }}>
        <Img src={img(n)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(40px) grayscale(.3)", transform: `scale(${1.3 + f * 0.0006})` }} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          backgroundImage: "linear-gradient(rgba(232,232,232,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(232,232,232,.07) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      <Glints seed={n * 3} w={width} h={height} n={8} />
    </AbsoluteFill>
  );
};

const FadeText: React.FC<{ text: string; size: number; from: number }> = ({ text, size, from }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [from, from + 20], [0, 1], clamp);
  return (
    <div style={{ fontFamily: ROUND, fontSize: size, color: PEARL, whiteSpace: "nowrap", opacity: o, transform: `translateY(${(1 - o) * 20}px)`, textShadow: `0 0 26px ${LILAC}99` }}>
      {text}
    </div>
  );
};

export const DESKTOP_SECONDS = 30;
export const HeartwingsDesktop: React.FC = () => {
  const cuts: Cut[] = [
    {
      at: 0,
      dur: 6,
      dark: true,
      node: (d) => (
        <>
          <World n={1} />
          <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 120 }}>
            <Window n={1} w={420} title="heartwing_jar.exe" dur={d} delay={4} />
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
      dark: true,
      node: (d) => (
        <>
          <World n={2} />
          <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 110 }}>
            <div style={{ width: 820 }}>
              <Headline text={COPY.first} sub={COPY.firstSub} size={190} align="left" delay={6} variant="chrome" />
            </div>
            <Window n={2} w={420} title="archive_jar_01.jpg" dur={d} rot={2} />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 12,
      dur: 6,
      dark: true,
      node: (d) => (
        <>
          <World n={3} />
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
            <Headline text={COPY.dPieces} sub={COPY.dPiecesSub} size={84} delay={20} />
          </AbsoluteFill>
          <AbsoluteFill style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 60, paddingBottom: 40 }}>
            <Window n={3} w={300} title="sun.jpg" dur={d} rot={-4} />
            <Window n={4} w={300} title="butterfly.jpg" dur={d} rot={1} delay={6} />
            <Window n={5} w={300} title="pearl.jpg" dur={d} rot={4} delay={12} />
          </AbsoluteFill>
        </>
      ),
    },
    {
      at: 18,
      dur: 6,
      dark: true,
      node: (d) => (
        <>
          <World n={5} />
          <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 120 }}>
            <Window n={5} w={420} title="xun_on.jpg" dur={d} rot={-2} />
            <div style={{ width: 780 }}>
              <Headline text={BRAND.postcard} size={70} align="left" delay={10} variant="soft" />
            </div>
          </AbsoluteFill>
        </>
      ),
    },
    { at: 24, dur: 6, end: true, node: () => <EndCard mobile={false} /> },
  ];
  return (
    <AbsoluteFill style={{ background: K }}>
      <Timeline cuts={cuts} mobile={false} />
    </AbsoluteFill>
  );
};
