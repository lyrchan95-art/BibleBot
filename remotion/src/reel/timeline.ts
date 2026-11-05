export const FPS = 30;

// Voiceover lines on the output timeline (seconds). `at`/`end` are replaced
// with silence-detected values once the ElevenLabs take is placed.
export type Line = { at: number; end: number; en: string; zh: string };

export const LINES: Line[] = [
  { at: 0.25, end: 2.75, en: "Stop editing the hard way. Let Claude do it.", zh: "別再用困難的方式剪片了——讓 Claude 來。" },
  { at: 3.1, end: 5.3, en: "Paste your rough transcript into Claude.", zh: "把粗略逐字稿貼進 Claude。" },
  { at: 5.6, end: 9.3, en: "Ask for three things: a shot list, a caption pack, and b-roll ideas.", zh: "要三樣東西：分鏡表、字幕包，還有 B-roll 建議。" },
  { at: 9.6, end: 11.8, en: "Step one: every cut, timed and labeled.", zh: "第一步：每個剪接點都標好時間和名稱。" },
  { at: 12.1, end: 14.6, en: "Step two: punchy captions, ready to burn in.", zh: "第二步：吸睛字幕，直接燒錄。" },
  { at: 15.1, end: 17.3, en: "Step three: b-roll matched to every line.", zh: "第三步：每一句都配好 B-roll。" },
  { at: 17.6, end: 19.6, en: "Drop it in your editor, and boom.", zh: "丟進剪輯軟體，砰！" },
  { at: 27.6, end: 29.8, en: "Hours of editing, done in minutes.", zh: "幾個小時的剪輯，幾分鐘搞定。" },
  { at: 31.9, end: 34.4, en: "Follow for daily Claude editing tutorials.", zh: "追蹤我，每天學 Claude 剪輯教學。" },
  { at: 35.0, end: 36.9, en: "What should Claude edit next?", zh: "下一支要讓 Claude 剪什麼？" },
];

// Scene cuts, on a 120 BPM grid (0.5 s per beat).
export const SCENES = {
  hook: [0, 3.0],
  paste: [3.0, 5.5],
  ask: [5.5, 9.5],
  shotList: [9.5, 12.0],
  captions: [12.0, 15.0],
  broll: [15.0, 17.5],
  drop: [17.5, 20.0],
  clip1: [20.0, 22.5],
  clip2: [22.5, 25.0],
  clip3: [25.0, 27.5],
  stats: [27.5, 31.5],
  cta: [31.5, 40.0],
} as const;

export const TOTAL_SECONDS = 40;
export const TOTAL_FRAMES = TOTAL_SECONDS * FPS;

export const sec = (s: number) => Math.round(s * FPS);
