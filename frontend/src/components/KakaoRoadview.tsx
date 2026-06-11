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

// 미션별 호기심 질문 — MissionImageCard 와 동일 매핑 (작은 데이터라 inline 복제)
const MISSION_QUESTIONS: Record<string, string> = {
  hospital: "응급 상황엔 어디로, 얼마나 걸려서 갈까?",
  market: "동네 시장 물가, 서울이랑 얼마나 다를까?",
  cafe: "혼자 머물 카페, 이 동네엔 어떤 모습일까?",
  neighbor: "처음 보는 이웃이 나에게 뭐라고 할까?",
  library: "동네 도서관, 어떤 풍경일까?",
  transit: "버스 한 대 놓치면 얼마나 기다려야 할까?",
  home: "잠시 머무는 집, 첫인상은 어떨까?",
  office: "이 동네에선 어떤 일을 하며 살 수 있을까?",
  mailbox: "오늘 도착한 편지엔 무슨 말이 적혀있을까?",
  shop: "30년된 동네 가게, 어떤 인사가 기다릴까?",
};

function curiosityFor(m: Mission): string {
  if (MISSION_QUESTIONS[m.id]) return MISSION_QUESTIONS[m.id];
  if (m.description) return m.description;
  return m.title;
}

// NPC 아바타 — 외지/이주자 톤이면 baram, 로컬은 jieum (MissionExecuteScreen 와 동일)
function pickNpcAvatar(name: string): string {
  if (/이주민|이주자|노마드|크리에이터|정착|먼저 온|서퍼/.test(name)) {
    return "/character1/clay-baram-solo.png";
  }
  return "/character1/clay-jieum-solo.png";
}

// NPC 가 처음 건넬 짧은 말 — 첫 dialogue 의 첫 문장 사용
function getNpcTeaser(mission: Mission): string {
  const first = mission.dialogues[0]?.npc;
  if (first) {
    const sentence = first.split(/(?<=[.!?])\s+/)[0] ?? first;
    if (sentence.length > 60) return sentence.slice(0, 58) + "…";
    return sentence;
  }
  return mission.description ?? "여기서 만나봐요";
}

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
  // 상단 호기심 질문 카드 — ready 시 잠깐 뜨고 4.5초 후 자동 닫힘 (사용자가 ✕로도 닫음)
  const [showCuriosityCard, setShowCuriosityCard] = useState(false);
  useEffect(() => {
    if (status !== "ready") return;
    setShowCuriosityCard(true);
    const t = window.setTimeout(() => setShowCuriosityCard(false), 4500);
    return () => window.clearTimeout(t);
  }, [status]);

  // === 네비게이션 — 100m 떨어진 곳에서 시작 → 화살표 따라 도착지로 ===
  const [distanceM, setDistanceM] = useState<number | null>(null);
  const [bearingFromNorth, setBearingFromNorth] = useState<number>(0);
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
        // 100m 떨어진 곳에서 시작 — 8방위 중 panoId 잡히는 첫 번째 사용
        const directions = [0, 45, 90, 135, 180, 225, 270, 315];
        let startPos: { lat: number; lng: number } | null = null;
        let startPanoId: string | null = null;
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
        // 오프셋 다 실패 시 도착지에서 바로 시작 (폴백)
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
          if (d < 30) setArrived(true);
        });

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

      {/* ===== 네비게이션 칩 — 도착지 방향 화살표 + 남은 거리 ===== */}
      {status === "ready" && distanceM !== null && !arrived && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="absolute top-[150px] left-1/2 -translate-x-1/2 z-30
                     pointer-events-none"
        >
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full
                          bg-white shadow-[0_8px_22px_-6px_rgba(0,0,0,0.4)]
                          border border-cream-200">
            {/* 회전 화살표 */}
            <motion.span
              animate={{ rotate: bearingFromNorth }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="inline-block text-primary text-[18px] leading-none"
              aria-hidden
            >
              ↑
            </motion.span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-ink-mute leading-none">
                {destination}
              </span>
              <span className="text-ink text-[13px] font-extrabold tabular-nums leading-tight">
                {Math.round(distanceM)}m 남음
              </span>
            </div>
          </div>
          <p className="mt-1.5 text-center text-white/85 text-[10.5px] font-bold
                        [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
            화살표 따라 걸어가요
          </p>
        </motion.div>
      )}

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

      {/* ===== 상단 호기심 질문 카드 (B) — ready 시 fade-in, 4.5s 자동 닫힘 ===== */}
      <AnimatePresence>
        {status === "ready" && showCuriosityCard && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute top-[68px] left-4 right-4 z-30 pointer-events-none"
          >
            <div
              className="relative bg-white rounded-2xl shadow-[0_12px_30px_-8px_rgba(0,0,0,0.4)]
                         border border-cream-200 px-4 py-3 pointer-events-auto"
            >
              <p className="text-[10px] font-extrabold text-primary tracking-[0.2em] uppercase">
                🔍 오늘의 미션
              </p>
              <p
                className="mt-1.5 text-ink text-[14.5px] font-extrabold leading-[1.35] pr-6"
              >
                "{curiosityFor(mission)}"
              </p>
              <button
                type="button"
                onClick={() => setShowCuriosityCard(false)}
                aria-label="닫기"
                className="absolute top-2 right-2 w-6 h-6 rounded-full
                           bg-cream-100 text-ink-soft text-[11px] font-bold
                           flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 좌하단 NPC 가이드 (A) — 상주 ===== */}
      {status === "ready" && (
        <motion.div
          initial={{ opacity: 0, x: -10, y: 6 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="absolute left-3 z-30 flex items-end gap-2 pointer-events-none"
          style={{ bottom: "150px" }}
        >
          {/* 클레이 캐릭터 — 살짝 둥실 */}
          <motion.img
            src={pickNpcAvatar(mission.npc.name)}
            alt=""
            aria-hidden
            className="w-[64px] h-auto drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] shrink-0"
            animate={{ y: [-2, 1, -2] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* 말풍선 */}
          <div className="relative bg-white rounded-2xl shadow-[0_6px_16px_-4px_rgba(0,0,0,0.35)]
                          border border-cream-200 px-3 py-2 max-w-[220px] mb-1
                          pointer-events-auto">
            <p className="text-[10px] font-extrabold text-primary leading-none">
              {mission.npc.emoji} {mission.npc.name}
            </p>
            <p className="mt-1 text-ink text-[12px] leading-snug">
              {getNpcTeaser(mission)}
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
