import { Composition } from "remotion";
import { ClaudeEditReel } from "./reel/ClaudeEditReel";
import { FPS, TOTAL_FRAMES } from "./reel/timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ClaudeEditReel"
      component={ClaudeEditReel}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};
