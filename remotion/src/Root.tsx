import { Composition } from "remotion";
import { ClaudeEditReel } from "./reel/ClaudeEditReel";
import { FPS, TOTAL_FRAMES } from "./reel/timeline";
import {
  DESKTOP_SECONDS,
  MOBILE_SECONDS,
  WisteriaPromoDesktop,
  WisteriaPromoMobile,
} from "./ww/WisteriaPromo";
import {
  DESKTOP_SECONDS as HW_D,
  HeartwingsDesktop,
  HeartwingsMobile,
  MOBILE_SECONDS as HW_M,
} from "./heartwings/HeartwingsPromo";
import { REEL_SECONDS, ReelA, ReelB, ReelC } from "./heartwings/Reels";

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
      <Composition id="HeartwingsMobile" component={HeartwingsMobile} durationInFrames={HW_M * 30} fps={30} width={1080} height={1920} />
      <Composition id="HeartwingReelA" component={ReelA} durationInFrames={REEL_SECONDS * 30} fps={30} width={1080} height={1920} />
      <Composition id="HeartwingReelB" component={ReelB} durationInFrames={REEL_SECONDS * 30} fps={30} width={1080} height={1920} />
      <Composition id="HeartwingReelC" component={ReelC} durationInFrames={REEL_SECONDS * 30} fps={30} width={1080} height={1920} />
      <Composition id="HeartwingsDesktop" component={HeartwingsDesktop} durationInFrames={HW_D * 24} fps={24} width={1920} height={1080} />
    </>
  );
};
