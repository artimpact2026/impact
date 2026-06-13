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
import { motion, AnimatePresence } from "framer-motion";
import type { Mission } from "../data/missions";
import { getNearestPanoId, loadKakaoMaps } from "../lib/kakao";

// (호기심 질문 카드 제거 — MISSION_QUESTIONS / curiosityFor 제거)
// (도착 전 좌하단 가이드는 NPC 가 아니라 안내자 톤으로 통일 — pickNpcAvatar/getNpcTeaser 제거)

// ==========================================================================
// 지리 유틸 — 도착 100m 떨어진 위치에서 시작 + 도착지 방향 화살표
// ==========================================================================

const EARTH_R = 6371000; // m
const DEG = Math.PI / 180;

// 좌표에서 bearing(0=북, 시계방향) 방향으로 distance(m) 만큼 이동한 좌표
function offsetCoord(
  lat: number,
  lng: number,
  distance: number,
  bearingDeg: number
) {
  const φ1 = lat * DEG;
  const λ1 = lng * DEG;
  const θ = bearingDeg * DEG;
  const δ = distance / EARTH_R;
  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
  );
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
    );
  return { lat: φ2 / DEG, lng: λ2 / DEG };
}

// 두 좌표 사이 거리 (m) — haversine
function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const φ1 = lat1 * DEG;
  const φ2 = lat2 * DEG;
  const Δφ = (lat2 - lat1) * DEG;
  const Δλ = (lng2 - lng1) * DEG;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(a));
}

// (lat1,lng1) → (lat2,lng2) 진행 방위각 (0=북, 시계방향, deg)
function bearingDeg(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const φ1 = lat1 * DEG;
  const φ2 = lat2 * DEG;
  const λ1 = lng1 * DEG;
  const λ2 = lng2 * DEG;
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

type Props = {
  position: { lat: number; lng: number };
  // 출발 좌표 — 정의되면 이 좌표에서 panoId 잡고 시작 (100m 자동 offset 대신).
  // 미정의 시 도착지 기준 100m 8방위 offset 으로 시작 위치 자동 탐색.
  startPosition?: { lat: number; lng: number };
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
  startPosition,
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
  // 호기심 질문 카드 제거 — 사용자 피드백. 그 자리는 화살표 네비게이션 카드로 대체.

  // === 네비게이션 — 100m 떨어진 곳에서 시작 → 화살표 따라 도착지로 ===
  const [distanceM, setDistanceM] = useState<number | null>(null);
  const [bearingFromNorth, setBearingFromNorth] = useState<number>(0);
  // 카카오 로드뷰 viewpoint pan — 사용자가 현재 어디를 보고 있는지 (북 기준 deg).
  // 화살표 = bearingFromNorth - viewHeading 으로 상대 방위 보정 → 역주행 해소.
  const [viewHeading, setViewHeading] = useState<number>(0);
  const [arrived, setArrived] = useState(false);
  // 도착 후 짧은 축하 → onComplete 자동 호출 (한 번만)
  const autoCompletedRef = useRef(false);
  useEffect(() => {
    if (arrived && !autoCompletedRef.current) {
      autoCompletedRef.current = true;
      const t = window.setTimeout(() => onComplete(), 1800);
      return () => window.clearTimeout(t);
    }
  }, [arrived, onComplete]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        let startPos: { lat: number; lng: number } | null = null;
        let startPanoId: number | null = null;

        // 우선순위 1: 명시 startPosition — 그 좌표 기준 panoId 잡기 (실패 시 인근 50/100m 탐색)
        if (startPosition) {
          const r = await getNearestPanoId(startPosition.lat, startPosition.lng);
          if (cancelled) return;
          if (r) {
            startPos = { lat: startPosition.lat, lng: startPosition.lng };
            startPanoId = r.panoId;
          } else {
            // 명시 좌표에서 panoId 못 잡으면 그 좌표 기준 8방위 50m 탐색
            const directions = [0, 45, 90, 135, 180, 225, 270, 315];
            for (const bearing of directions) {
              const off = offsetCoord(startPosition.lat, startPosition.lng, 50, bearing);
              const rr = await getNearestPanoId(off.lat, off.lng);
              if (cancelled) return;
              if (rr) {
                startPos = off;
                startPanoId = rr.panoId;
                break;
              }
            }
          }
        }

        // 우선순위 2: 도착지 기준 100m 8방위 자동 offset (기존 동작)
        if (!startPanoId || !startPos) {
          const directions = [0, 45, 90, 135, 180, 225, 270, 315];
          for (const bearing of directions) {
            const off = offsetCoord(position.lat, position.lng, 100, bearing);
            const r = await getNearestPanoId(off.lat, off.lng);
            if (cancelled) return;
            if (r) {
              startPos = off;
              startPanoId = r.panoId;
              break;
            }
          }
        }

        // 우선순위 3: 도착지에서 바로 시작 (최종 폴백)
        if (!startPanoId || !startPos) {
          const r = await getNearestPanoId(position.lat, position.lng);
          if (cancelled) return;
          if (!r) {
            setStatus("unavailable");
            onUnavailable?.("no-panoid");
            return;
          }
          startPanoId = r.panoId;
          startPos = { lat: position.lat, lng: position.lng };
        }

        if (!containerRef.current) return;

        const kakao = await loadKakaoMaps();
        containerRef.current.innerHTML = "";
        const rv = new kakao.maps.Roadview(containerRef.current);
        rv.setPanoId(
          startPanoId,
          new kakao.maps.LatLng(startPos.lat, startPos.lng)
        );

        // 초기 거리·방위 계산
        const initDist = distanceMeters(
          startPos.lat,
          startPos.lng,
          position.lat,
          position.lng
        );
        const initBear = bearingDeg(
          startPos.lat,
          startPos.lng,
          position.lat,
          position.lng
        );
        setDistanceM(initDist);
        setBearingFromNorth(initBear);

        // 사용자가 카카오 SDK 의 화살표로 이동할 때마다 업데이트
        kakao.maps.event.addListener(rv, "position_changed", () => {
          const cur = rv.getPosition();
          const curLat = cur.getLat();
          const curLng = cur.getLng();
          const d = distanceMeters(curLat, curLng, position.lat, position.lng);
          const b = bearingDeg(curLat, curLng, position.lat, position.lng);
          setDistanceM(d);
          setBearingFromNorth(b);
          // 도착 임계 30 → 60m. 정문 panoId 가 멀어도 자동 도착 트리거 잘 되도록.
          if (d < 60) setArrived(true);
        });

        // viewpoint(보고 있는 방향) 변경 — 화살표 상대 방위 보정에 사용
        kakao.maps.event.addListener(rv, "viewpoint_changed", () => {
          try {
            const vp = rv.getViewpoint();
            if (vp && typeof vp.pan === "number") setViewHeading(vp.pan);
          } catch {
            /* SDK 호환 ignore */
          }
        });
        // 초기 viewpoint 한 번 잡아두기
        try {
          const vp0 = rv.getViewpoint();
          if (vp0 && typeof vp0.pan === "number") setViewHeading(vp0.pan);
        } catch {
          /* ignore */
        }

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
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [position.lat, position.lng, startPosition, onUnavailable]);

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

      {/* ===== 네비게이션 카드 — 회전 화살표 + 거리 + 큰 방향 라벨 ===== */}
      {status === "ready" && distanceM !== null && !arrived && (() => {
        // 시야 상대 방위 (0~360 정규화) — 카카오 SDK pan(0~360) 과 우리 bearing(-180~180) 차이 보정
        const normalize360 = (deg: number) => ((deg % 360) + 360) % 360;
        const relative = normalize360(bearingFromNorth - viewHeading);
        // 4방향 시인성 라벨 — 사용자가 어느 쪽 골목으로 갈지 큰 글자로
        const directionLabel =
          relative < 45 || relative >= 315
            ? { icon: "⬆", text: "그대로 직진" }
            : relative < 135
            ? { icon: "➡", text: "오른쪽 골목으로" }
            : relative < 225
            ? { icon: "🔄", text: "뒤로 돌아가기" }
            : { icon: "⬅", text: "왼쪽 골목으로" };
        return (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="absolute top-[68px] left-4 right-4 z-30
                       pointer-events-none"
          >
            {/* 큰 방향 라벨 카드 — 어느 쪽 가야 하는지 한눈에 */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-3xl
                            bg-white shadow-[0_12px_32px_-6px_rgba(0,0,0,0.5)]
                            border-2 border-primary">
              {/* 회전 화살표 — 정확한 절대 방향 (시야 보정 포함) */}
              <motion.div
                animate={{ rotate: relative }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="shrink-0"
                aria-hidden
              >
                <motion.span
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-block text-primary text-[42px] leading-none font-extrabold
                             drop-shadow-[0_2px_6px_rgba(255,112,67,0.5)]"
                >
                  ⬆
                </motion.span>
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-ink text-[16px] font-extrabold leading-tight">
                  <span className="mr-1" aria-hidden>{directionLabel.icon}</span>
                  {directionLabel.text}
                </p>
                <p className="mt-1 text-[11px] font-extrabold text-ink-mute tracking-wide">
                  {destination} <span className="text-primary tabular-nums text-[13px]">{Math.round(distanceM)}m</span> 남음
                </p>
              </div>
            </div>
            <p className="mt-2 text-center text-white/90 text-[11px] font-bold
                          [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
              화살표 따라 천천히 걸어가요
            </p>
          </motion.div>
        );
      })()}

      {/* ===== 도착 오버레이 — < 30m 근접 시 ===== */}
      <AnimatePresence>
        {arrived && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center
                       bg-black/45 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.6, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 14, stiffness: 220 }}
              className="bg-white rounded-3xl px-7 py-6 shadow-[0_20px_40px_rgba(0,0,0,0.45)]
                         flex flex-col items-center"
            >
              <p className="text-[42px] leading-none">🎉</p>
              <p className="mt-2 text-ink text-[20px] font-extrabold">
                도착!
              </p>
              <p className="mt-1 text-ink-soft text-[12.5px]">
                {destination}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* (호기심 질문 카드 제거 — 그 자리에 화살표 네비게이션 카드가 들어감) */}

      {/* ===== 좌하단 가이드 — 도착 전에는 안내자 톤 (NPC 인사는 도착 후 미션 화면에서) ===== */}
      {status === "ready" && !arrived && (
        <motion.div
          initial={{ opacity: 0, x: -10, y: 6 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="absolute left-3 z-30 flex items-end gap-2 pointer-events-none"
          style={{ bottom: "150px" }}
        >
          {/* 안내자 캐릭터(바람) — 살짝 둥실 */}
          <motion.img
            src="/character1/clay-baram-solo.png"
            alt=""
            aria-hidden
            className="w-[64px] h-auto drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] shrink-0"
            animate={{ y: [-2, 1, -2] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* 말풍선 — mission.travelGuide 있으면 그거, 없으면 기본 카피 */}
          <div className="relative bg-white rounded-2xl shadow-[0_6px_16px_-4px_rgba(0,0,0,0.35)]
                          border border-cream-200 px-3 py-2 max-w-[240px] mb-1
                          pointer-events-auto">
            <p className="text-[10px] font-extrabold text-primary leading-none tracking-wider">
              🧭 안내
            </p>
            <p className="mt-1 text-ink text-[12px] leading-snug">
              {/* 100m 이내 진입 시 도착 직전 멘트(travelGuideArrival), 그 전엔 일반 travelGuide */}
              {(distanceM !== null && distanceM < 100 && mission.travelGuideArrival)
                ? mission.travelGuideArrival
                : mission.travelGuide
                ?? `${destination}으로 가요. 골목 한 번 둘러봐도 좋아요.`}
            </p>
            {/* 말풍선 꼬리 — 왼쪽 */}
            <span
              aria-hidden
              className="absolute left-[-6px] bottom-3 w-3 h-3
                         bg-white border-l border-b border-cream-200 rotate-45"
            />
          </div>
        </motion.div>
      )}

      {/* 하단 — 미션 시작 CTA. 도착 후에만 표시 (도착 안 했는데 "들어가기" 떠 있던 어색함 제거). */}
      {status === "ready" && arrived && (
        <footer className="absolute bottom-6 left-0 right-0 z-30 px-6 flex flex-col items-center gap-2 pointer-events-none">
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
        </footer>
      )}
      {/* 도착 전 안내 — "드래그·핀치로 둘러보세요" 만 */}
      {status === "ready" && !arrived && (
        <p className="absolute bottom-6 left-0 right-0 z-30 text-center text-white/70 text-[10.5px] pointer-events-none">
          드래그·핀치로 둘러보세요
        </p>
      )}
    </div>
  );
}
