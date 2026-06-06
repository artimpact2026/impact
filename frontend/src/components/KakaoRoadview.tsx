// 카카오 로드뷰 임베드 — 좌표를 받아 가장 가까운 panoId를 조회하고 SDK 인스턴스로 렌더
// 단독 사용 가능하지만, 폴백 분기는 부모(RoadviewWithFallback)가 onUnavailable 콜백으로 처리.
//
// 사용 예:
//   <KakaoRoadview
//     position={{ lat: 37.741370, lng: 126.492831 }}
//     mission={mission}
//     destination="강화풍물시장"
//     ctaLabel="시장 들어가기"
//     onBack={...}
//     onComplete={...}
//     onUnavailable={() => setFellBack(true)}
//   />

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Mission } from "../data/missions";
import { getNearestPanoId, loadKakaoMaps } from "../lib/kakao";

type Props = {
  position: { lat: number; lng: number };
  mission: Mission;
  destination: string;
  ctaLabel: string;
  onBack: () => void;
  onComplete: () => void;
  // panoId가 null이거나 SDK 로드 실패 시 호출 — 호출자가 사진 미니로드뷰 등으로 폴백
  onUnavailable?: (reason: "no-panoid" | "sdk-error", detail?: string) => void;
};

type Status = "loading" | "ready" | "unavailable" | "error";

export default function KakaoRoadview({
  position,
  mission,
  destination,
  ctaLabel,
  onBack,
  onComplete,
  onUnavailable,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const result = await getNearestPanoId(position.lat, position.lng);
        if (cancelled) return;

        if (!result) {
          // 카카오 커버리지 없음 — 부모에 알리고 화면은 폴백 전환 직전까지 빈 상태로 유지
          setStatus("unavailable");
          onUnavailable?.("no-panoid");
          return;
        }

        if (!containerRef.current) return;

        const kakao = await loadKakaoMaps();
        // 새 인스턴스 생성 — 컨테이너가 재사용되면 기존 내용을 비워야 깔끔
        containerRef.current.innerHTML = "";
        const rv = new kakao.maps.Roadview(containerRef.current);
        rv.setPanoId(
          result.panoId,
          new kakao.maps.LatLng(position.lat, position.lng)
        );
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        setStatus("error");
        setErrorMsg(msg);
        onUnavailable?.("sdk-error", msg);
      }
    })();

    return () => {
      cancelled = true;
      // 컴포넌트 unmount 시 컨테이너 정리 — SDK는 명시적 destroy가 없어 DOM 비우는 게 안전
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [position.lat, position.lng, onUnavailable]);

  return (
    <div
      className="relative flex flex-col overflow-hidden bg-black select-none"
      style={{ height: "calc(100dvh - var(--content-bottom))" }}
    >
      {/* 카카오 로드뷰 캔버스 — SDK가 이 div 안에 자체 DOM을 그림 */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* 로딩 오버레이 */}
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
          <p className="text-white text-[12px]">로드뷰 불러오는 중…</p>
        </div>
      )}

      {/* 에러 오버레이 — 부모가 onUnavailable로 폴백 처리할 것이므로 짧게 보이고 사라짐 */}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/85 z-10 px-6">
          <p className="text-white text-[12px] text-center leading-relaxed">
            로드뷰를 불러올 수 없어요
            <br />
            <span className="text-white/60 text-[10px]">{errorMsg}</span>
          </p>
        </div>
      )}

      {/* 상단 — 뒤로가기 + 도착지 라벨 */}
      <header
        className="absolute top-0 left-0 right-0 z-30 px-4 pt-4 pb-3 flex items-center gap-2
                   bg-gradient-to-b from-black/55 via-black/15 to-transparent pointer-events-none"
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="미션 리스트로 돌아가기"
          className="w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-soft
                     text-[#3E2C20] text-[14px] font-bold
                     flex items-center justify-center active:scale-[0.96] pointer-events-auto"
        >
          ←
        </button>
        <div className="flex-1 min-w-0 text-white">
          <p className="text-[10px] font-bold opacity-85 tracking-widest uppercase">
            🛰️ 카카오 로드뷰 · {destination}
          </p>
          <p className="text-[13px] font-extrabold truncate drop-shadow">
            {mission.icon} {mission.title}
          </p>
        </div>
      </header>

      {/* 하단 — 외부링크(있으면) + 미션 시작 CTA */}
      {status === "ready" && (
        <footer className="absolute bottom-6 left-0 right-0 z-30 px-6 flex flex-col items-center gap-2 pointer-events-none">
          {mission.arrivalRoadviewUrl && (
            <a
              href={mission.arrivalRoadviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-full bg-white/15 backdrop-blur
                         border border-white/40 text-white text-[11px] font-bold
                         active:scale-[0.99] pointer-events-auto"
            >
              🗺️ 새 탭에서 크게 보기
            </a>
          )}
          <motion.button
            type="button"
            onClick={onComplete}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="px-6 py-3 rounded-full bg-primary text-white
                       text-[14px] font-extrabold shadow-soft active:scale-[0.99] pointer-events-auto"
          >
            {ctaLabel}
          </motion.button>
          <p className="text-white/60 text-[10px]">
            드래그·핀치로 둘러보세요
          </p>
        </footer>
      )}
    </div>
  );
}
