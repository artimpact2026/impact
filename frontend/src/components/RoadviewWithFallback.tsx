// 임베드 + 폴백 통합 — 이동 화면이 이 컴포넌트 한 번만 호출하면 분기 알아서 처리
//   1) 카카오 panoId 잡힘  → <KakaoRoadview />
//   2) panoId 없음 / SDK 실패 + fallbackSteps 있음 → <MiniRoadview /> (사진 캡쳐)
//   3) panoId 없음 + fallbackSteps 없음 → 가이드 안내 화면

import { useCallback, useState } from "react";
import type { Mission, RoadviewStep } from "../data/missions";
import KakaoRoadview from "./KakaoRoadview";
import MiniRoadview from "./MiniRoadview";

type Props = {
  position: { lat: number; lng: number };
  startPosition?: { lat: number; lng: number };
  fallbackSteps?: RoadviewStep[];
  mission: Mission;
  destination: string;
  ctaLabel: string;
  onBack: () => void;
  onComplete: () => void;
};

export default function RoadviewWithFallback({
  position,
  startPosition,
  fallbackSteps,
  mission,
  destination,
  ctaLabel,
  onBack,
  onComplete,
}: Props) {
  const [fellBack, setFellBack] = useState(false);

  // 안정적인 reference — KakaoRoadview의 useEffect dep에 들어가서
  // 좌표가 바뀌지 않는 한 재실행되지 않게 함
  const handleUnavailable = useCallback(() => {
    setFellBack(true);
  }, []);

  // ── 폴백 분기 1: 사진 미니 로드뷰 ────────────────
  if (fellBack && fallbackSteps && fallbackSteps.length > 0) {
    return (
      <MiniRoadview
        steps={fallbackSteps}
        mission={mission}
        destination={destination}
        ctaLabel={ctaLabel}
        onBack={onBack}
        onComplete={onComplete}
      />
    );
  }

  // ── 폴백 분기 2: 사진도 없을 때 안내 화면 ──────
  if (fellBack) {
    return (
      <div
        className="relative flex flex-col items-center justify-center bg-black px-8 text-center"
        style={{ height: "calc(100dvh - var(--content-bottom))" }}
      >
        <p className="text-white text-[14px] font-bold">
          이 지점의 로드뷰가 아직 준비되지 않았어요
        </p>
        <p className="mt-2 text-white/60 text-[11px]">{destination}</p>
        <button
          type="button"
          onClick={onComplete}
          className="mt-5 px-6 py-3 rounded-full bg-primary text-white text-[13px] font-extrabold shadow-soft active:scale-[0.99]"
        >
          {ctaLabel}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="mt-3 text-white/60 text-[11px]"
        >
          ← 미션 리스트로
        </button>
      </div>
    );
  }

  // ── 정상 분기: 카카오 임베드 ───────────────────
  return (
    <KakaoRoadview
      position={position}
      startPosition={startPosition}
      mission={mission}
      destination={destination}
      ctaLabel={ctaLabel}
      onBack={onBack}
      onComplete={onComplete}
      onUnavailable={handleUnavailable}
    />
  );
}
