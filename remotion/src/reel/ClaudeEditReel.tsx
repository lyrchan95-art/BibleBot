import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FPS, LINES, SCENES, sec } from "./timeline";

// ---------------------------------------------------------------------------
// Palette + type
// ---------------------------------------------------------------------------
const INK = "#141413";
const INK_2 = "#1F1E1C";
const CREAM = "#F0EEE6";
const CORAL = "#D97757";
const HILITE = "#FFD84D";
const MUTED = "#9A988F";
const SANS = "'Liberation Sans','WenQuanYi Zen Hei','DejaVu Sans',sans-serif";
const ZH = "'WenQuanYi Zen Hei','Liberation Sans',sans-serif";
const MONO = "'DejaVu Sans Mono',monospace";

// Instagram Reels safe area: keep UI/text inside x 60–940, y 250–1520.
const SAFE_TOP = 250;
const SUB_BOTTOM = 1520;

const outline = (px: number, color = "#000"): React.CSSProperties => ({
  WebkitTextStroke: `${px}px ${color}`,
  paintOrder: "stroke fill",
});

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const useLocal = () => useCurrentFrame();

const pop = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 220 } });

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------
const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  const gx = Math.sin(f * 0.012) * 160;
  const gy = Math.cos(f * 0.009) * 120;
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(240,238,230,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(240,238,230,.045) 1px,transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          left: -200 + gx,
          top: 380 + gy,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${CORAL}33, transparent 62%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene wrapper: punch-in on entry, quick whip on exit (2–3 s cuts)
// ---------------------------------------------------------------------------
const Scene: React.FC<{ dur: number; children: React.ReactNode; whip?: boolean; enter?: boolean }> = ({
  dur,
  children,
  whip = true,
  enter = true,
}) => {
  const f = useLocal();
  const inP = enter ? interpolate(f, [0, 7], [0, 1], { ...clamp, easing: easeOut }) : 1;
  const outP = whip ? interpolate(f, [dur - 5, dur], [0, 1], clamp) : 0;
  const scale = 1.08 - 0.08 * inP;
  return (
    <AbsoluteFill
      style={{
        opacity: inP,
        transform: `translateX(${-outP * 140}px) scale(${scale})`,
        filter: `blur(${(1 - inP) * 10 + outP * 8}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Step chip + on-screen title (with 繁中 line under every on-screen text)
// ---------------------------------------------------------------------------
const StepChip: React.FC<{ n?: string; en: string; zh: string }> = ({ n, en, zh }) => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  const s = pop(f, fps, 2);
  return (
    <div
      style={{
        position: "absolute",
        top: SAFE_TOP + 20,
        left: 60,
        transform: `translateX(${(1 - s) * -60}px)`,
        opacity: s,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {n ? (
          <div
            style={{
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 34,
              color: INK,
              background: CORAL,
              borderRadius: 14,
              padding: "8px 16px",
            }}
          >
            {n}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 46,
            letterSpacing: 2,
            color: CREAM,
            ...outline(6),
          }}
        >
          {en}
        </div>
      </div>
      <div style={{ fontFamily: ZH, fontSize: 32, color: CORAL, marginTop: 8, ...outline(5) }}>{zh}</div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Claude chat window (recreated UI)
// ---------------------------------------------------------------------------
const ChatWindow: React.FC<{ children: React.ReactNode; top?: number; height?: number }> = ({
  children,
  top = 430,
  height = 860,
}) => (
  <div
    style={{
      position: "absolute",
      left: 60,
      width: 880,
      top,
      height,
      borderRadius: 34,
      background: CREAM,
      boxShadow: "0 40px 90px -30px rgba(0,0,0,.7)",
      overflow: "hidden",
      fontFamily: SANS,
    }}
  >
    <div
      style={{
        height: 76,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "0 28px",
        borderBottom: "1px solid rgba(20,20,19,.1)",
      }}
    >
      <ClaudeMark size={34} />
      <div style={{ fontWeight: 700, fontSize: 28, color: INK }}>Claude</div>
      <div style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 20, color: MUTED }}>video-edit.md</div>
    </div>
    <div style={{ padding: 28 }}>{children}</div>
  </div>
);

const ClaudeMark: React.FC<{ size: number }> = ({ size }) => {
  const rays = 10;
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100">
      {new Array(rays).fill(0).map((_, i) => (
        <rect
          key={i}
          x={-5}
          y={-46}
          width={10}
          height={40}
          rx={5}
          fill={CORAL}
          transform={`rotate(${(i * 360) / rays})`}
        />
      ))}
    </svg>
  );
};

const Bubble: React.FC<{ from: "you" | "claude"; children: React.ReactNode; delay?: number }> = ({
  from,
  children,
  delay = 0,
}) => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  const s = pop(f, fps, delay);
  const you = from === "you";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: you ? "flex-end" : "flex-start",
        marginBottom: 18,
        opacity: s,
        transform: `translateY(${(1 - s) * 30}px)`,
      }}
    >
      <div
        style={{
          maxWidth: you ? "88%" : "100%",
          background: you ? "#E3DFD3" : "transparent",
          borderRadius: 22,
          padding: you ? "18px 22px" : "4px 0",
          fontSize: 27,
          lineHeight: 1.45,
          color: INK,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Typewriter reveal by character count over [start, end] local frames
const Type: React.FC<{ text: string; start: number; end: number; style?: React.CSSProperties }> = ({
  text,
  start,
  end,
  style,
}) => {
  const f = useLocal();
  const n = Math.floor(interpolate(f, [start, end], [0, text.length], clamp));
  const caret = f >= start && f < end + 10 && Math.floor(f / 8) % 2 === 0;
  return (
    <span style={style}>
      {text.slice(0, n)}
      {caret ? <span style={{ color: CORAL }}>▍</span> : null}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------
const MessyTimeline: React.FC = () => {
  const f = useLocal();
  const shake = f < 45 ? Math.sin(f * 2.3) * 6 : 0;
  const clips = [
    [80, 300, "#5B6C8F"],
    [300, 520, "#8F5B6C"],
    [190, 430, "#6C8F5B"],
    [520, 760, "#8F7F5B"],
    [610, 860, "#5B8F86"],
    [40, 220, "#7A5B8F"],
  ] as const;
  return (
    <div style={{ position: "absolute", left: 60, top: 1010, width: 880, transform: `translateX(${shake}px)` }}>
      {clips.map(([a, b, c], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: (i % 3) * 64,
            left: a,
            width: b - a,
            height: 52,
            borderRadius: 10,
            background: c,
            opacity: 0.85,
            transform: `rotate(${(i % 2 ? 1 : -1) * 1.5}deg)`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          top: -12,
          left: 0,
          right: 0,
          height: 220,
          border: `3px dashed ${MUTED}`,
          borderRadius: 18,
          opacity: 0.4,
        }}
      />
    </div>
  );
};

const HookScene: React.FC = () => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  const a = pop(f, fps, -12);
  const strike = interpolate(f, [24, 34], [0, 1], { ...clamp, easing: easeOut });
  const b = pop(f, fps, 38);
  return (
    <AbsoluteFill>
      <MessyTimeline />
      <div style={{ position: "absolute", top: SAFE_TOP + 70, left: 60, right: 140 }}>
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 104,
            lineHeight: 0.98,
            color: CREAM,
            transform: `scale(${0.6 + a * 0.4})`,
            transformOrigin: "left top",
            opacity: a,
            position: "relative",
            ...outline(10),
          }}
        >
          STOP EDITING
          <br />
          THE HARD WAY
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "52%",
              height: 14,
              width: `${strike * 100}%`,
              background: CORAL,
              borderRadius: 7,
            }}
          />
        </div>
        <div style={{ fontFamily: ZH, fontSize: 44, color: MUTED, marginTop: 18, opacity: a, ...outline(6) }}>
          別再用困難的方式剪片了
        </div>
        <div
          style={{
            marginTop: 54,
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 76,
            whiteSpace: "nowrap",
            color: INK,
            background: HILITE,
            display: "inline-block",
            padding: "6px 22px 10px",
            borderRadius: 16,
            transform: `scale(${b}) rotate(-2deg)`,
            transformOrigin: "left center",
          }}
        >
          LET CLAUDE DO IT
        </div>
        <div style={{ fontFamily: ZH, fontSize: 44, color: HILITE, marginTop: 14, opacity: b, ...outline(6) }}>
          讓 Claude 來
        </div>
      </div>
    </AbsoluteFill>
  );
};

const TRANSCRIPT =
  "um so yeah today i wanna show you my morning routine, uh, i edit like ten videos a week and honestly here's my secret, it's, it's claude...";

const PasteScene: React.FC = () => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  const paste = pop(f, fps, 14);
  return (
    <AbsoluteFill>
      <StepChip n="01" en="PASTE TRANSCRIPT" zh="貼上逐字稿" />
      <ChatWindow>
        <div style={{ opacity: paste, transform: `scale(${0.9 + paste * 0.1})`, transformOrigin: "right top" }}>
          <Bubble from="you">
            <div style={{ fontFamily: MONO, fontSize: 18, color: MUTED, marginBottom: 8 }}>
              rough_transcript.txt · 1,240 words
            </div>
            <span style={{ color: "#4A4842" }}>{TRANSCRIPT}</span>
          </Bubble>
        </div>
      </ChatWindow>
      <Cursor x={interpolate(f, [0, 14], [760, 640], clamp)} y={interpolate(f, [0, 14], [1180, 700], clamp)} down={f > 10 && f < 18} />
    </AbsoluteFill>
  );
};

const Cursor: React.FC<{ x: number; y: number; down?: boolean }> = ({ x, y, down }) => (
  <div
    style={{
      position: "absolute",
      left: x - 22,
      top: y - 22,
      width: 44,
      height: 44,
      borderRadius: "50%",
      border: `4px solid ${INK}`,
      background: "rgba(255,216,77,.85)",
      transform: `scale(${down ? 0.7 : 1})`,
      boxShadow: "0 6px 18px rgba(0,0,0,.4)",
    }}
  />
);

const ASK = "Turn this into: 1) a shot list 2) a caption pack 3) b-roll ideas";

const AskScene: React.FC = () => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  const chips = [
    { en: "SHOT LIST", zh: "分鏡表", at: 52 },
    { en: "CAPTION PACK", zh: "字幕包", at: 70 },
    { en: "B-ROLL IDEAS", zh: "B-roll 建議", at: 88 },
  ];
  return (
    <AbsoluteFill>
      <StepChip n="02" en="ASK FOR 3 THINGS" zh="要三樣東西" />
      <ChatWindow height={520}>
        <Bubble from="you">
          <span style={{ color: "#8C897F" }}>[transcript attached]</span>
          <br />
          <Type text={ASK} start={4} end={46} style={{ fontWeight: 700 }} />
        </Bubble>
      </ChatWindow>
      <div style={{ position: "absolute", top: 1000, left: 60, display: "flex", flexDirection: "column", gap: 16 }}>
        {chips.map((c) => {
          const s = pop(f, fps, c.at);
          return (
            <div
              key={c.en}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 18,
                opacity: s,
                transform: `translateX(${(1 - s) * -80}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: 44,
                  color: INK,
                  background: CORAL,
                  padding: "4px 18px",
                  borderRadius: 12,
                }}
              >
                {c.en}
              </div>
              <div style={{ fontFamily: ZH, fontSize: 34, color: CREAM, ...outline(5) }}>{c.zh}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const SHOTS = [
  ["00:00", "HOOK", "Close-up · “I edit 10 videos a week”"],
  ["00:03", "B-ROLL", "Sunrise timelapse"],
  ["00:06", "TALK", "Medium · “Here’s my secret”"],
  ["00:09", "PUNCH-IN", "“It’s Claude.” + whoosh"],
];

const ShotListScene: React.FC = () => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <StepChip n="01" en="SHOT LIST" zh="分鏡表" />
      <ChatWindow>
        <Bubble from="claude">
          <div style={{ fontWeight: 700, fontSize: 30, marginBottom: 16 }}>Shot list</div>
          {SHOTS.map(([t, tag, desc], i) => {
            const s = pop(f, fps, 6 + i * 9);
            return (
              <div
                key={t}
                style={{
                  display: "flex",
                  gap: 18,
                  alignItems: "center",
                  padding: "16px 0",
                  borderTop: "1px solid rgba(20,20,19,.1)",
                  opacity: s,
                  transform: `translateX(${(1 - s) * 40}px)`,
                }}
              >
                <div style={{ fontFamily: MONO, fontSize: 24, color: CORAL, width: 100 }}>{t}</div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 18,
                    fontWeight: 700,
                    background: INK,
                    color: CREAM,
                    borderRadius: 8,
                    padding: "6px 10px",
                    width: 140,
                    textAlign: "center",
                  }}
                >
                  {tag}
                </div>
                <div style={{ fontSize: 26, color: INK }}>{desc}</div>
              </div>
            );
          })}
        </Bubble>
      </ChatWindow>
    </AbsoluteFill>
  );
};

const CAPTION_PACK = [
  { en: "I EDIT 10 VIDEOS A WEEK", zh: "我一週剪 10 支影片" },
  { en: "HERE’S MY SECRET", zh: "這是我的秘密" },
  { en: "IT’S CLAUDE.", zh: "就是 Claude。" },
];

const CaptionsScene: React.FC = () => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <StepChip n="02" en="CAPTION PACK" zh="字幕包" />
      <div style={{ position: "absolute", top: 470, left: 60, width: 880, display: "flex", flexDirection: "column", gap: 34 }}>
        {CAPTION_PACK.map((c, i) => {
          const s = pop(f, fps, 6 + i * 14);
          const hi = i === Math.min(2, Math.floor(f / 26));
          return (
            <div
              key={c.en}
              style={{
                background: INK_2,
                border: `3px solid ${hi ? HILITE : "rgba(240,238,230,.15)"}`,
                borderRadius: 26,
                padding: "30px 34px",
                opacity: s,
                transform: `scale(${0.85 + s * 0.15}) rotate(${(i - 1) * 1.2}deg)`,
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 20, color: MUTED, marginBottom: 10 }}>CAPTION {i + 1}</div>
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: 60,
                  color: hi ? HILITE : CREAM,
                  ...outline(8),
                }}
              >
                {c.en}
              </div>
              <div style={{ fontFamily: ZH, fontSize: 36, color: CREAM, marginTop: 8, ...outline(5) }}>{c.zh}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const BROLL = [
  { t: "Sunrise timelapse", g: "linear-gradient(160deg,#F6B26B,#D97757 55%,#5B3A5F)" },
  { t: "Coffee pour · slow-mo", g: "linear-gradient(160deg,#C9A27E,#6B4A33)" },
  { t: "Laptop screen glow", g: "linear-gradient(160deg,#5B7CA8,#1F2A44)" },
  { t: "City walk · golden hour", g: "linear-gradient(160deg,#F2C46B,#8F6B3A 60%,#2F2A26)" },
];

const BrollScene: React.FC = () => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <StepChip n="03" en="B-ROLL IDEAS" zh="B-roll 建議" />
      <div
        style={{
          position: "absolute",
          top: 470,
          left: 60,
          width: 880,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
        }}
      >
        {BROLL.map((b, i) => {
          const s = pop(f, fps, 4 + i * 8);
          return (
            <div key={b.t} style={{ opacity: s, transform: `translateY(${(1 - s) * 50}px)` }}>
              <div
                style={{
                  height: 330,
                  borderRadius: 24,
                  background: b.g,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(115deg,transparent 35%,rgba(255,255,255,.18) 50%,transparent 65%)",
                    transform: `translateX(${interpolate(f, [0, 75], [-400, 400])}px)`,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    fontFamily: MONO,
                    fontSize: 18,
                    color: CREAM,
                    background: "rgba(0,0,0,.45)",
                    padding: "4px 10px",
                    borderRadius: 8,
                  }}
                >
                  {`LINE ${i + 1}`}
                </div>
              </div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, color: CREAM, marginTop: 12 }}>{b.t}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const DropScene: React.FC = () => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  // beats at 0.5 s → every 15 frames a clip snaps in
  const tracks = [
    { label: "V2", y: 0, clips: [[0, 220, "#F6B26B"], [470, 700, "#5B7CA8"]] },
    { label: "V1", y: 92, clips: [[0, 300, CORAL], [300, 560, "#8F5B6C"], [560, 820, "#D97757"]] },
    { label: "T1", y: 184, clips: [[0, 260, HILITE], [280, 540, HILITE], [560, 820, HILITE]] },
    { label: "A1", y: 276, clips: [[0, 820, "#4A6B5B"]] },
  ] as const;
  let k = 0;
  const play = interpolate(f, [10, 70], [0, 820], clamp);
  const boomAt = sec(19.35 - SCENES.drop[0]);
  const boom = interpolate(f, [boomAt, boomAt + 4, boomAt + 16], [0, 1, 0], clamp);
  const boomPop = pop(f, fps, boomAt);
  return (
    <AbsoluteFill>
      <StepChip en="DROP IT IN YOUR EDITOR" zh="丟進剪輯軟體" />
      <div
        style={{
          position: "absolute",
          top: 560,
          left: 60,
          width: 880,
          height: 420,
          background: INK_2,
          borderRadius: 26,
          padding: "40px 30px",
        }}
      >
        {tracks.map((tr) => (
          <div key={tr.label} style={{ position: "absolute", top: 40 + tr.y, left: 30, right: 30, height: 72 }}>
            <div style={{ position: "absolute", left: 0, top: 22, fontFamily: MONO, fontSize: 20, color: MUTED }}>
              {tr.label}
            </div>
            {tr.clips.map(([a, b, c]) => {
              const s = pop(f, fps, (k++ % 9) * 4);
              const w = ((b as number) - (a as number)) * 0.86;
              return (
                <div
                  key={`${tr.label}-${a}`}
                  style={{
                    position: "absolute",
                    left: 50 + (a as number) * 0.86,
                    width: w - 6,
                    top: 0,
                    height: 72,
                    borderRadius: 10,
                    background: c as string,
                    opacity: s,
                    transform: `translateY(${(1 - s) * -60}px)`,
                  }}
                />
              );
            })}
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            top: 20,
            bottom: 20,
            left: 80 + play * 0.86,
            width: 4,
            background: CREAM,
            borderRadius: 2,
          }}
        />
      </div>
      <AbsoluteFill style={{ background: CREAM, opacity: boom * 0.85 }} />
      <div
        style={{
          position: "absolute",
          top: 1050,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: boomPop,
          transform: `scale(${0.4 + boomPop * 0.6}) rotate(-4deg)`,
        }}
      >
        <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 150, color: HILITE, ...outline(12) }}>BOOM</span>
        <div style={{ fontFamily: ZH, fontSize: 56, color: CREAM, ...outline(6) }}>砰！</div>
      </div>
    </AbsoluteFill>
  );
};

// Result clips: the caption pack + b-roll applied, fast cuts.
const ResultClip: React.FC<{ variant: 0 | 1 | 2 }> = ({ variant }) => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  const cap = CAPTION_PACK[variant];
  const s = pop(f, fps, 2);
  const zoom = 1 + f * 0.0018;
  const scenes = [
    // sunrise
    <AbsoluteFill key="a" style={{ background: "linear-gradient(180deg,#2B2440 0%,#D97757 55%,#F6B26B 100%)" }}>
      <div
        style={{
          position: "absolute",
          left: 340,
          top: 1180 - f * 4,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle,#FFE7A8,#F6B26B 60%,transparent 70%)",
        }}
      />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 560, background: "#1F1A24" }} />
    </AbsoluteFill>,
    // laptop desk
    <AbsoluteFill key="b" style={{ background: "linear-gradient(180deg,#1F2A44,#0E1320)" }}>
      <div
        style={{
          position: "absolute",
          left: 190,
          top: 640,
          width: 700,
          height: 440,
          borderRadius: 20,
          background: "linear-gradient(160deg,#9CC3F0,#5B7CA8)",
          boxShadow: "0 0 160px 40px rgba(156,195,240,.35)",
          transform: `rotate(${Math.sin(f * 0.05) * 1.2}deg)`,
        }}
      />
      <div style={{ position: "absolute", left: 120, top: 1080, width: 840, height: 30, borderRadius: 10, background: "#3A4660" }} />
    </AbsoluteFill>,
    // city
    <AbsoluteFill key="c" style={{ background: "linear-gradient(180deg,#F2C46B,#8F6B3A 60%,#2F2A26)" }}>
      {new Array(9).fill(0).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: 0,
            left: i * 130 - ((f * 6) % 130),
            width: 110,
            height: 500 + ((i * 137) % 420),
            background: "#2F2A26",
            borderRadius: "8px 8px 0 0",
          }}
        />
      ))}
    </AbsoluteFill>,
  ];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>{scenes[variant]}</AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: SAFE_TOP + 20,
          left: 60,
          fontFamily: MONO,
          fontSize: 22,
          color: CREAM,
          background: "rgba(0,0,0,.55)",
          padding: "8px 14px",
          borderRadius: 10,
        }}
      >
        {`EDITED BY CLAUDE · SHOT ${variant + 1}/3 · ${BROLL[variant === 2 ? 3 : variant === 1 ? 2 : 0].t.toUpperCase()}`}
      </div>
      <div
        style={{
          position: "absolute",
          top: 760,
          left: 60,
          right: 140,
          textAlign: "center",
          opacity: s,
          transform: `scale(${0.7 + s * 0.3})`,
        }}
      >
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 104, lineHeight: 1.02, color: variant === 2 ? HILITE : CREAM, ...outline(12) }}>
          {cap.en}
        </div>
        <div style={{ fontFamily: ZH, fontSize: 56, color: CREAM, marginTop: 16, ...outline(7) }}>{cap.zh}</div>
      </div>
    </AbsoluteFill>
  );
};

const StatsScene: React.FC = () => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  const a = pop(f, fps, 0);
  const strike = interpolate(f, [16, 26], [0, 1], clamp);
  const mins = Math.round(interpolate(f, [26, 60], [240, 12], { ...clamp, easing: easeOut }));
  const b = pop(f, fps, 26);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 470, left: 60, right: 140 }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: MUTED, opacity: a }}>EDITING TIME · 剪輯時間</div>
        <div style={{ position: "relative", display: "inline-block", marginTop: 20, opacity: a }}>
          <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 150, color: MUTED }}>4 HRS</span>
          <div style={{ position: "absolute", left: -10, top: "50%", height: 16, width: `${strike * 105}%`, background: CORAL, borderRadius: 8 }} />
        </div>
        <div style={{ fontFamily: ZH, fontSize: 44, color: MUTED, opacity: a }}>4 小時</div>
        <div style={{ marginTop: 50, opacity: b, transform: `scale(${0.7 + b * 0.3})`, transformOrigin: "left center" }}>
          <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 210, color: HILITE, ...outline(12) }}>{mins} MIN</span>
          <div style={{ fontFamily: ZH, fontSize: 56, color: HILITE, ...outline(6) }}>{mins} 分鐘</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CtaScene: React.FC = () => {
  const f = useLocal();
  const { fps } = useVideoConfig();
  const followIn = pop(f, fps, 4);
  const tapAt = sec(33.2 - SCENES.cta[0]);
  const tapped = f >= tapAt;
  const tapPop = pop(f, fps, tapAt);
  const commentAt = sec(34.9 - SCENES.cta[0]);
  const comment = pop(f, fps, commentAt);
  const finalAt = sec(37.2 - SCENES.cta[0]);
  const fin = pop(f, fps, finalAt);
  const pulse = 1 + Math.sin(f * 0.25) * 0.04;
  return (
    <AbsoluteFill>
      {/* save prompt — top ribbon, below the IG header zone */}
      <div
        style={{
          position: "absolute",
          top: SAFE_TOP + 10,
          left: 60,
          right: 140,
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: followIn,
        }}
      >
        <svg width="40" height="48" viewBox="0 0 20 24">
          <path d="M2 1h16v22l-8-5-8 5z" fill={HILITE} stroke="#000" strokeWidth="1.5" />
        </svg>
        <div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: CREAM, ...outline(5) }}>SAVE THIS FOR YOUR NEXT EDIT</div>
          <div style={{ fontFamily: ZH, fontSize: 28, color: HILITE, ...outline(4) }}>收藏起來，下次剪片用</div>
        </div>
      </div>

      <div style={{ position: "absolute", top: 430, left: 60, right: 140, opacity: followIn, transform: `translateY(${(1 - followIn) * 40}px)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 76, lineHeight: 1.05, color: CREAM, ...outline(9) }}>
          FOLLOW FOR DAILY
          <br />
          <span style={{ color: CORAL }}>CLAUDE EDITING</span>
          <br />
          TUTORIALS
        </div>
        <div style={{ fontFamily: ZH, fontSize: 40, color: CREAM, marginTop: 12, ...outline(5) }}>追蹤我，每天學 Claude 剪輯</div>
        <div
          style={{
            marginTop: 28,
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 44,
            padding: "18px 44px",
            borderRadius: 999,
            background: tapped ? INK_2 : CORAL,
            color: tapped ? CREAM : INK,
            border: tapped ? `3px solid ${CREAM}` : "3px solid transparent",
            transform: `scale(${tapped ? 0.96 + tapPop * 0.04 : pulse})`,
          }}
        >
          {tapped ? "✓ FOLLOWING" : "+ FOLLOW"}
        </div>
      </div>

      {/* comment prompt */}
      <div
        style={{
          position: "absolute",
          top: 960,
          left: 60,
          width: 800,
          background: CREAM,
          borderRadius: 26,
          padding: "26px 30px",
          opacity: comment,
          transform: `translateY(${(1 - comment) * 60}px) rotate(-1deg)`,
        }}
      >
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 48, color: INK }}>What should Claude edit next?</div>
        <div style={{ fontFamily: ZH, fontSize: 34, color: "#5A574F", marginTop: 6 }}>下一支要讓 Claude 剪什麼？</div>
        <div
          style={{
            marginTop: 18,
            border: "2px solid rgba(20,20,19,.2)",
            borderRadius: 999,
            padding: "12px 22px",
            fontFamily: SANS,
            fontSize: 28,
            color: MUTED,
          }}
        >
          <Type text="a wedding vlog? a podcast clip?" start={commentAt + 10} end={commentAt + 50} />
        </div>
      </div>

      {/* curiosity final frame: an empty clip slot waiting for "your" video */}
      <div
        style={{
          position: "absolute",
          top: 1270,
          left: 60,
          width: 800,
          height: 90,
          borderRadius: 14,
          border: `4px dashed ${HILITE}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          opacity: fin,
          transform: `scale(${0.9 + fin * 0.1 * pulse})`,
        }}
      >
        <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 38, color: HILITE, ...outline(5) }}>YOUR VIDEO HERE?</span>
        <span style={{ fontFamily: ZH, fontSize: 30, color: CREAM, ...outline(4) }}>下一支是你的？</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Bilingual subtitles: English (karaoke) on top, 繁體中文 below.
// Bottom-anchored at y=1520 to stay above the Reels caption/UI zone.
// ---------------------------------------------------------------------------
const Subtitles: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const line = LINES.find((l) => t >= l.at - 0.05 && t <= l.end + 0.25);
  if (!line) return null;
  const words = line.en.split(" ");
  const weights = words.map((w) => w.length + 1.5);
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = line.at;
  const spans = words.map((w, i) => {
    const d = ((line.end - line.at) * weights[i]) / total;
    const s = acc;
    acc += d;
    return { w, s, e: acc };
  });
  const enter = interpolate(t, [line.at - 0.05, line.at + 0.1], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 140,
        bottom: 1920 - SUB_BOTTOM,
        textAlign: "center",
        opacity: enter,
        transform: `translateY(${(1 - enter) * 16}px)`,
      }}
    >
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, lineHeight: 1.22, color: CREAM, ...outline(9) }}>
        {spans.map((s, i) => {
          const active = t >= s.s && t < s.e;
          const spoken = t >= s.e;
          return (
            <span
              key={i}
              style={{
                color: active ? HILITE : spoken ? CREAM : "rgba(240,238,230,.62)",
              }}
            >
              {s.w}
              {i < spans.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
      <div style={{ fontFamily: ZH, fontSize: 40, lineHeight: 1.3, color: CREAM, marginTop: 8, ...outline(8) }}>
        {line.zh}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Root composition
// ---------------------------------------------------------------------------
const S = (k: keyof typeof SCENES) => ({
  from: sec(SCENES[k][0]),
  durationInFrames: sec(SCENES[k][1]) - sec(SCENES[k][0]),
});

export const ClaudeEditReel: React.FC = () => {
  const seq = (k: keyof typeof SCENES, node: React.ReactNode, whip = true, enter = true) => {
    const { from, durationInFrames } = S(k);
    return (
      <Sequence from={from} durationInFrames={durationInFrames}>
        <Scene dur={durationInFrames} whip={whip} enter={enter}>
          {node}
        </Scene>
      </Sequence>
    );
  };
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Backdrop />
      {seq("hook", <HookScene />, true, false)}
      {seq("paste", <PasteScene />)}
      {seq("ask", <AskScene />)}
      {seq("shotList", <ShotListScene />)}
      {seq("captions", <CaptionsScene />)}
      {seq("broll", <BrollScene />)}
      {seq("drop", <DropScene />)}
      {seq("clip1", <ResultClip variant={0} />)}
      {seq("clip2", <ResultClip variant={1} />)}
      {seq("clip3", <ResultClip variant={2} />)}
      {seq("stats", <StatsScene />)}
      {seq("cta", <CtaScene />, false)}
      <Subtitles />
    </AbsoluteFill>
  );
};
