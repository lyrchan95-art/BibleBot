import { Composition } from "remotion";
import { ClaudeEditReel } from "./reel/ClaudeEditReel";
import { FPS, TOTAL_FRAMES } from "./reel/timeline";
import {
  DESKTOP_SECONDS,
  MOBILE_SECONDS,
  WisteriaPromoDesktop,
  WisteriaPromoMobile,
} from "./ww/WisteriaPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ClaudeEditReel"
        component={ClaudeEditReel}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="WisteriaPromoMobile"
        component={WisteriaPromoMobile}
        durationInFrames={MOBILE_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="WisteriaPromoDesktop"
        component={WisteriaPromoDesktop}
        durationInFrames={DESKTOP_SECONDS * 24}
        fps={24}
        width={1920}
        height={1080}
      />
    </>
  );
};
