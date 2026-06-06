// 미션 이동 화면 — 4장의 슬라이드(스냅샷)를 스와이프로 넘기는 카카오 로드뷰 스타일
// 1. 출발 — 거주지 골목 입구
// 2. 골목 + 주민 이야기 카드
// 3. 다가옴 — 목적지가 멀리 보임
// 4. 도착! — 목적지 풀 뷰 + 미션 시작 CTA

import { useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import type { Mission } from "../data/missions";
import MiniRoadview from "../components/MiniRoadview";
import RoadviewWithFallback from "../components/RoadviewWithFallback";

type Props = {
  mission: Mission;
  onComplete: () => void;
  // 뒤로가기 — 이동 화면을 닫고 미션 리스트로 돌아감
  onBack?: () => void;
  // 미션에 좌표가 없을 때 쓸 fallback (보통 현재 머무는 마을 중심부 좌표).
  // → 모든 로드뷰 미션이 데이터 누락 없이 실제 로드뷰로 뜨도록 보장.
  fallbackPosition?: { lat: number; lng: number };
};

// 미션별 도착지 라벨
function getDestinationLabel(mission: Mission): string {
  const m: Record<string, string> = {
    market: "동네 밥집",
    hospital: "동네 종합병원",
    cafe: "주민 카페",
    home: "레지던스",
    office: "공유 작업실",
    transit: "버스 정류장",
    library: "마을 안내소",
    neighbor: "이주자 댁",
  };
  return m[mission.background] ?? "장소";
}

// 미션별 짧은 주민 이야기 한 줄 (슬라이드 2에 오버레이)
function getStory(mission: Mission): string {
  const map: Record<string, string> = {
    hospital:
      "이 길로 쭉 가면 종합병원이 보여요. 약국도 바로 옆이라 진료 끝나면 약도 한 자리에서 받아요.",
    market:
      "어머, 처음 보는 얼굴이네요. 저 골목 안쪽 밥집, 백반이 진짜 푸짐해요.",
    cost: "이 길 끝에 이주민들이 모이는 사무실이 있어요. 한 번 들러서 들어보세요.",
    transit: "정류장은 이 길 끝이에요. 시간표는 미리 봐두는 게 좋아요.",
    routine: "이 마을에선 하루가 천천히 가요. 산책부터 시작하시면 좋아요.",
    food: "동네 분식집이에요. 한 번 들러보세요. 단골 되기 좋아요.",
    shop: "이 가게는 30년째예요. 동네 어르신들이 다 우리 집 단골이에요.",
    neighbor:
      "이주민들 모임이 매월 한 번 있어요. 부담 갖지 말고 한번 와봐요.",
    "ganghwa-mudflat":
      "갯벌은 썰물 때만 들어갈 수 있어요. 시간 잘 봐두고 가세요.",
    "ganghwa-dolmen":
      "이 길 끝에 고인돌이 있어요. 한적해서 책 한 권 들고 가도 좋아요.",
    "ganghwa-farm":
      "텃밭 한 평이면 시금치도 키울 수 있어요. 동네 분들이 도와줘요.",
    "ganghwa-sunset": "동막해변에서 일몰 보세요. 사계절 다 달라요.",
    "gwangyang-cafework":
      "이 동네 카페는 한적해서 작업하기 좋아요. 와이파이도 잘 돼요.",
    "gwangyang-walk":
      "매화마을 산책로예요. 3월엔 꽃 보러 많이 와요. 평일은 한적해요.",
    "gwangyang-coworking":
      "코워킹 스페이스가 두 곳이에요. 입주자들이 자연스럽게 친해져요.",
    "gwangyang-creator":
      "도시에서 내려온 작가·개발자들이 의외로 많아요. 모임 한번 와봐요.",
    "geoje-walk-sea":
      "바다까지 평지로 15분이에요. 매일 가는 분도 많아요.",
    "geoje-beach": "성수기엔 활기차고 비수기엔 한적해요. 두 풍경이 다 좋아요.",
    "geoje-fishing":
      "초보면 갯바위 낚시부터 시작해요. 강습이 매주 있어요.",
    "geoje-leisure":
      "서핑·자전거·등산 동호회가 다 있어요. 한 번 따라가 보세요.",
  };
  return (
    map[mission.id] ??
    `이 길로 쭉 가시면 ${getDestinationLabel(mission)}이 나와요. 천천히 둘러보세요.`
  );
}

// 슬라이드 단계 라벨 — 모달 캡션 등에 사용
const SLIDE_LABEL: Record<"depart" | "alley" | "approach" | "arrive", string> = {
  depart: "출발지",
  alley: "골목길",
  approach: "다가옴",
  arrive: "도착",
};

// 받침 유무에 따라 와/과 조사 선택 (예: 사장님→과, 아주머니→와)
function waGwa(word: string): string {
  const code = word.charCodeAt(word.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return "과";
  return (code - 0xac00) % 28 === 0 ? "와" : "과";
}

// 도착 슬라이드의 CTA 라벨 — 미션 모드에 맞게 분기
function getArrivalCtaLabel(mission: Mission): string {
  switch (mission.mode) {
    case "map-dialogue":
      return `${mission.npc.name}${waGwa(mission.npc.name)} 대화 나누기 💬`;
    case "map-info":
      return "장소 둘러보기 👀";
    default:
      // 이론상 traveling 화면을 거치는 다른 모드는 없지만 안전 fallback
      return "미션 시작하기";
  }
}

export default function MissionTravelingScreen({
  mission,
  onComplete,
  onBack,
  fallbackPosition,
}: Props) {
  const [idx, setIdx] = useState(0);
  const [showRoadview, setShowRoadview] = useState(false);
  const destination = getDestinationLabel(mission);
  const ctaLabel = getArrivalCtaLabel(mission);

  // 좌표 우선순위: 미션 명시 좌표 → 마을 중심 fallback → 없음(사진/일러스트)
  const position = mission.kakaoPosition ?? fallbackPosition;

  // 카카오 좌표가 있으면 임베드 우선 — panoId 못 잡으면 RoadviewWithFallback 내부에서
  // 자동으로 미니 로드뷰(사진)로 폴백
  if (position) {
    return (
      <RoadviewWithFallback
        position={position}
        fallbackSteps={mission.roadviewSteps}
        mission={mission}
        destination={destination}
        ctaLabel={ctaLabel}
        onBack={onBack ?? onComplete}
        onComplete={onComplete}
      />
    );
  }

  // 좌표 없고 사진 미니 로드뷰만 있으면 그대로 사용 — 4슬라이드 카드는 최종 fallback
  if (mission.roadviewSteps && mission.roadviewSteps.length > 0) {
    return (
      <MiniRoadview
        steps={mission.roadviewSteps}
        mission={mission}
        destination={destination}
        ctaLabel={ctaLabel}
        onBack={onBack ?? onComplete}
        onComplete={onComplete}
      />
    );
  }

  const slides: Array<{
    id: "depart" | "alley" | "approach" | "arrive";
    subtitle: string;
    story?: string;
    isLast?: boolean;
  }> = [
    { id: "depart", subtitle: "골목 입구에서 출발했어요" },
    {
      id: "alley",
      subtitle: "조용한 골목을 지나가요",
      story: getStory(mission),
    },
    { id: "approach", subtitle: `${destination}이 보이기 시작해요` },
    { id: "arrive", subtitle: `${destination}에 도착했어요`, isLast: true },
  ];

  const next = () => setIdx((i) => Math.min(slides.length - 1, i + 1));
  const prev = () => setIdx((i) => Math.max(0, i - 1));

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -500) next();
    else if (info.offset.x > 60 || info.velocity.x > 500) prev();
  };

  return (
    <div
      className="relative flex flex-col overflow-hidden bg-[#F3ECE2]"
      style={{ height: "calc(100dvh - var(--content-bottom))" }}
    >
      {/* 상단 — 진행 + 미션 정보 */}
      <header className="absolute top-0 left-0 right-0 z-30 px-4 pt-4 pb-3 flex items-center gap-2 bg-gradient-to-b from-cream/95 via-cream/55 to-transparent">
        <button
          type="button"
          onClick={onBack ?? onComplete}
          aria-label="미션 리스트로 돌아가기"
          className="w-8 h-8 rounded-full bg-white shadow-soft
                     text-ink text-[14px] font-bold
                     flex items-center justify-center active:scale-[0.96]"
        >
          ←
        </button>
        <div className="flex-1 min-w-0 text-ink">
          <p className="text-[10px] font-bold text-ink-mute tracking-widest uppercase">
            이동 중 · {idx + 1} / {slides.length}
          </p>
          <p className="text-[13px] font-extrabold truncate">
            {mission.icon} {destination}로 가는 길
          </p>
        </div>
      </header>

      {/* 슬라이드 트랙 */}
      <motion.div
        className="flex w-full h-full"
        animate={{ x: `-${idx * 100}%` }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        onDragEnd={handleDragEnd}
      >
        {slides.map((slide, slideIdx) => {
          const photoUrl = mission.realRoadview?.[slideIdx];
          return (
            <div
              key={slide.id}
              className="w-full h-full shrink-0 relative select-none"
            >
              <Snapshot kind={slide.id} mission={mission} />
              <SlideSubtitle text={slide.subtitle} />

              {/* 슬라이드별 캡처 사진 — 일러스트와 실사 비교용 */}
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setShowRoadview(true)}
                  aria-label="실제 사진 보기"
                  className="absolute top-[64px] right-4 z-20
                             w-10 h-10 rounded-full bg-white shadow-soft border border-cream-200
                             flex items-center justify-center text-base
                             active:scale-[0.96]"
                >
                  📷
                </button>
              )}

              {slide.story && (
                <StoryCard speaker={mission.npc.name} text={slide.story} />
              )}

              {slide.isLast && <ArrivalLabel destination={destination} />}
            </div>
          );
        })}
      </motion.div>

      {/* 캐릭터 레이어 — 슬라이드 트랙 바깥에 고정. 배경(SVG)만 뒤로 흐르고 캐릭터는 그 자리에서 통통 튀어 "걷는 느낌" */}
      <WalkingCharacters isArrival={idx === slides.length - 1} />

      {/* 하단 — 도트 + 다음 / 미션 시작 */}
      <footer className="absolute bottom-6 left-0 right-0 z-30 px-6 flex flex-col items-center gap-3">
        <div className="flex gap-1.5" aria-hidden>
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all
                ${i === idx ? "bg-primary w-6" : "bg-ink-mute/30 w-1.5"}`}
            />
          ))}
        </div>

        {idx < slides.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="px-5 py-2.5 rounded-full bg-white
                       text-ink text-[13px] font-extrabold shadow-soft border border-cream-200
                       active:scale-[0.99]"
          >
            다음 →
          </button>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {/* 도착 슬라이드: 실제 로드뷰 확인 외부링크 — 공유링크 있을 때만 */}
            {mission.arrivalRoadviewUrl && (
              <a
                href={mission.arrivalRoadviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-full bg-white shadow-soft
                           border border-cream-200 text-ink-soft text-[11px] font-bold
                           active:scale-[0.99]"
              >
                🗺️ 실제 로드뷰로 확인해보기
              </a>
            )}
            <motion.button
              type="button"
              onClick={onComplete}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="px-6 py-3 rounded-full bg-primary text-white
                         text-[14px] font-extrabold shadow-soft active:scale-[0.99]"
            >
              {ctaLabel}
            </motion.button>
          </div>
        )}

        <p className="text-ink-mute text-[10px]">
          좌우로 스와이프하거나 '다음'을 눌러요
        </p>
      </footer>

      {/* 실제 사진 모달 — 슬라이드의 캡처 사진을 라이트박스로 표시 */}
      <AnimatePresence>
        {showRoadview && mission.realRoadview?.[idx] && (
          <RoadviewModal
            photoUrl={mission.realRoadview[idx]!}
            caption={`${SLIDE_LABEL[slides[idx].id]} · ${destination}`}
            stepIndex={idx + 1}
            totalSteps={slides.length}
            onClose={() => setShowRoadview(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================================
// 실제 로드뷰 모달 — 전체 화면 라이트박스
// =====================================================================

function RoadviewModal({
  photoUrl,
  caption,
  stepIndex,
  totalSteps,
  onClose,
}: {
  photoUrl: string;
  caption: string;
  stepIndex: number;
  totalSteps: number;
  onClose: () => void;
}) {
  return (
    <>
      <motion.button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/85 z-40"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", damping: 22, stiffness: 240 }}
        className="absolute inset-0 z-50 flex flex-col items-center justify-center px-5 pointer-events-none"
      >
        <div className="w-full max-w-[380px] bg-white rounded-3xl overflow-hidden shadow-soft pointer-events-auto">
          <div className="relative">
            <img
              src={photoUrl}
              alt="실제 사진"
              className="w-full h-auto block aspect-[4/3] object-cover"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/95
                         flex items-center justify-center text-[#3E2C20] shadow-soft"
            >
              ✕
            </button>
          </div>
          <div className="p-3 text-center">
            <p className="text-[10px] font-bold text-[#9A8778] tracking-widest uppercase">
              {stepIndex} / {totalSteps} 지점
            </p>
            <p className="mt-0.5 text-[13px] font-extrabold text-[#3E2C20]">
              {caption}
            </p>
            <p className="mt-0.5 text-[11px] text-[#9A8778]">
              실제 사진 · 일러스트와 비교해보세요
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// =====================================================================
// Snapshot — 4가지 variant별 SVG 풍경
// =====================================================================

// ── 공용 일러스트 헬퍼 ────────────────────────────
// 부드러운 구름 — 흰 타원 3개를 겹쳐서 통통한 실루엣
function Cloud({
  cx,
  cy,
  scale = 1,
  opacity = 0.85,
}: {
  cx: number;
  cy: number;
  scale?: number;
  opacity?: number;
}) {
  return (
    <g
      opacity={opacity}
      transform={`translate(${cx} ${cy}) scale(${scale})`}
    >
      <ellipse cx="0" cy="0" rx="14" ry="6" fill="#FFFFFF" />
      <ellipse cx="-8" cy="2" rx="8" ry="5" fill="#FFFFFF" />
      <ellipse cx="9" cy="2" rx="9" ry="5" fill="#FFFFFF" />
    </g>
  );
}

// 나무 — 통통한 원형(plump) 또는 침엽수(cone)
function Tree({
  x,
  y,
  scale = 1,
  variant = "round",
}: {
  x: number;
  y: number;
  scale?: number;
  variant?: "round" | "cone";
}) {
  if (variant === "cone") {
    return (
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <rect x="-1.2" y="0" width="2.4" height="6" fill="#8B5E42" rx="0.3" />
        <path d="M -9 0 L 0 -22 L 9 0 Z" fill="#8FBC9C" />
        <path d="M -6 -8 L 0 -22 L 6 -8 Z" fill="#A8CFB5" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-1.2" y="0" width="2.4" height="9" fill="#8B5E42" rx="0.3" />
      <circle cx="0" cy="-2" r="10" fill="#8BCB90" />
      <circle cx="-5" cy="-6" r="7" fill="#B1DCB5" />
      <circle cx="5" cy="-4" r="6" fill="#A8CFB5" />
    </g>
  );
}

// 작은 새 두 마리 — m자 실루엣
function Birds({ x, y }: { x: number; y: number }) {
  return (
    <g
      stroke="#6B5446"
      strokeWidth="0.8"
      fill="none"
      strokeLinecap="round"
      opacity="0.55"
    >
      <path d={`M ${x} ${y} q 2 -2 4 0 q 2 -2 4 0`} />
      <path d={`M ${x + 10} ${y + 3} q 1.5 -1.5 3 0 q 1.5 -1.5 3 0`} />
    </g>
  );
}

// 길가 작은 꽃 — 점 3~4개로 표현
function FlowerCluster({
  cx,
  cy,
  scale = 1,
}: {
  cx: number;
  cy: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      <circle cx="0" cy="0" r="1.6" fill="#FFB6A8" />
      <circle cx="3" cy="-1.5" r="1.4" fill="#FFE9A8" />
      <circle cx="-2.5" cy="-1" r="1.4" fill="#FFC4DC" />
      <circle cx="1.5" cy="2" r="1.2" fill="#FFFFFF" />
    </g>
  );
}

function Snapshot({
  kind,
  mission,
}: {
  kind: "depart" | "alley" | "approach" | "arrive";
  mission: Mission;
}) {
  return (
    <svg
      viewBox="0 0 200 320"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden
    >
      <defs>
        {/* 하늘 — 연하늘 → 살구 → 크림 */}
        <linearGradient id="snapSky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#D8EFFF" />
          <stop offset="0.55" stopColor="#FFE9D6" />
          <stop offset="1" stopColor="#FBE6C2" />
        </linearGradient>
        {/* 길 — 따뜻한 베이지 */}
        <linearGradient id="snapRoad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#F2DDB8" />
          <stop offset="1" stopColor="#D8B98C" />
        </linearGradient>
        {/* 잔디 — 라이트 민트 */}
        <linearGradient id="snapGrass" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#DCEDD0" />
          <stop offset="1" stopColor="#C2DDB7" />
        </linearGradient>
        {/* 먼 산 3겹 — 멀수록 옅고 푸르게 */}
        <linearGradient id="snapMtnFar" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#D5E1E8" />
          <stop offset="1" stopColor="#C4D6DD" />
        </linearGradient>
        <linearGradient id="snapMtnMid" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#BDD5CB" />
          <stop offset="1" stopColor="#A6C5BA" />
        </linearGradient>
        <linearGradient id="snapMtnNear" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#A8CFB5" />
          <stop offset="1" stopColor="#8FBC9C" />
        </linearGradient>
      </defs>

      {/* 하늘 (전체 배경) */}
      <rect width="200" height="320" fill="url(#snapSky)" />

      {kind === "depart" && <DepartScene />}
      {kind === "alley" && <AlleyScene />}
      {kind === "approach" && <ApproachScene mission={mission} />}
      {kind === "arrive" && <ArriveScene mission={mission} />}
    </svg>
  );
}

// ── 출발: 한옥 + 골목 입구 ──────────────────────
function DepartScene() {
  return (
    <g>
      {/* 구름 + 새 */}
      <Cloud cx={45} cy={30} scale={0.85} />
      <Cloud cx={150} cy={50} scale={1} />
      <Birds x={108} y={72} />

      {/* 먼 산 3겹 — 멀수록 옅고 푸르게 */}
      <path
        d="M -10 130 Q 30 100 70 115 Q 110 95 150 110 Q 180 100 210 115 L 210 170 L -10 170 Z"
        fill="url(#snapMtnFar)"
      />
      <path
        d="M -10 145 Q 40 120 80 135 Q 120 110 160 130 Q 185 120 210 135 L 210 170 L -10 170 Z"
        fill="url(#snapMtnMid)"
      />
      <path
        d="M -10 158 Q 50 138 100 150 Q 150 138 210 152 L 210 175 L -10 175 Z"
        fill="url(#snapMtnNear)"
      />

      {/* 잔디 */}
      <rect y="165" width="200" height="155" fill="url(#snapGrass)" />

      {/* 길 — 곡선 사다리꼴(앞으로 부드럽게 넓어짐) */}
      <path
        d="M 78 165 Q 62 220 28 320 L 172 320 Q 138 220 122 165 Z"
        fill="url(#snapRoad)"
      />
      <path
        d="M 100 170 Q 100 240 100 320"
        stroke="#FFF8F0"
        strokeWidth="1.4"
        strokeDasharray="5 9"
        opacity="0.65"
        fill="none"
      />

      {/* 좌측 한옥 — 기와 곡선 강조 */}
      <g transform="translate(34 200)">
        {/* 본채 */}
        <rect x="-26" y="-2" width="54" height="32" rx="1.5" fill="#F4DEC2" />
        {/* 토대(밝은 그림자) */}
        <rect x="-26" y="26" width="54" height="6" fill="#E8C8A4" />
        {/* 기와 지붕 — 살짝 곡선 */}
        <path
          d="M -34 -2 Q -32 -9 -28 -11 L 28 -11 Q 32 -9 34 -2 Z"
          fill="#C97D5C"
        />
        <path d="M -34 -2 L 34 -2 L 34 2 L -34 2 Z" fill="#A35F45" />
        {/* 창문 */}
        <rect
          x="-15"
          y="6"
          width="11"
          height="13"
          rx="1"
          fill="#C9E1EF"
          stroke="#8B5E42"
          strokeWidth="0.7"
        />
        <rect
          x="4"
          y="6"
          width="11"
          height="13"
          rx="1"
          fill="#C9E1EF"
          stroke="#8B5E42"
          strokeWidth="0.7"
        />
        {/* 문 */}
        <rect x="-4" y="18" width="8" height="14" fill="#8B5E42" rx="0.5" />
      </g>

      {/* 우측 작은 집 — 멀리, 작게 */}
      <g transform="translate(172 218)">
        <rect x="-14" y="0" width="28" height="20" rx="1" fill="#FFE0CC" />
        <path d="M -17 0 L 0 -12 L 17 0 Z" fill="#E8A88A" />
        <rect x="-12" y="2" width="6" height="6" rx="1" fill="#FFE9A8" />
        <rect x="-3" y="8" width="6" height="12" fill="#8B5E42" rx="0.5" />
      </g>

      {/* 나무 — 가까운 큰 나무 + 멀리 작은 나무들 */}
      <Tree x={20} y={238} scale={1.1} />
      <Tree x={165} y={186} scale={0.85} variant="cone" />
      <Tree x={186} y={252} scale={0.65} />

      {/* 전경 풀덤불 */}
      <ellipse cx="55" cy="308" rx="14" ry="4" fill="#A8C695" opacity="0.7" />
      <ellipse cx="158" cy="312" rx="18" ry="4" fill="#A8C695" opacity="0.7" />
    </g>
  );
}

// ── 골목: 좁은 길 + 담장 + 가로등 ──────────────
function AlleyScene() {
  return (
    <g>
      {/* 살짝 구름 + 새 */}
      <Cloud cx={100} cy={26} scale={0.7} opacity={0.8} />
      <Birds x={40} y={60} />

      {/* 골목 끝 원경 — 멀리 살짝 보이는 산/나무 + 빛 */}
      <path
        d="M 70 160 Q 100 148 130 160 L 128 175 L 72 175 Z"
        fill="url(#snapMtnNear)"
        opacity="0.55"
      />
      <circle cx="100" cy="172" r="22" fill="#FFE9D6" opacity="0.7" />

      {/* 좌측 담장 (퍼스펙티브, 살구빛) */}
      <path d="M 0 160 L 78 167 L 28 320 L 0 320 Z" fill="#F4DEC2" />
      {/* 담장 상단 그림자 */}
      <path
        d="M 0 160 L 78 167 L 78 171 L 0 164 Z"
        fill="#C97D5C"
        opacity="0.55"
      />
      {/* 담장 줄기 패턴 */}
      <path
        d="M 20 200 L 14 320"
        stroke="#E8C8A4"
        strokeWidth="0.6"
        opacity="0.8"
      />
      <path
        d="M 45 200 L 38 320"
        stroke="#E8C8A4"
        strokeWidth="0.6"
        opacity="0.8"
      />

      {/* 우측 담장 (크림) */}
      <path d="M 200 160 L 122 167 L 172 320 L 200 320 Z" fill="#FFE0CC" />
      <path
        d="M 200 160 L 122 167 L 122 171 L 200 164 Z"
        fill="#C97D5C"
        opacity="0.55"
      />
      <path
        d="M 180 200 L 186 320"
        stroke="#F4C8AA"
        strokeWidth="0.6"
        opacity="0.8"
      />
      <path
        d="M 155 200 L 162 320"
        stroke="#F4C8AA"
        strokeWidth="0.6"
        opacity="0.8"
      />

      {/* 길 (곡선 사다리꼴) */}
      <path
        d="M 78 167 Q 60 220 28 320 L 172 320 Q 140 220 122 167 Z"
        fill="url(#snapRoad)"
      />
      <path
        d="M 100 172 Q 100 240 100 320"
        stroke="#FFF8F0"
        strokeWidth="1.4"
        strokeDasharray="5 9"
        opacity="0.7"
        fill="none"
      />

      {/* 가로등 — 따뜻한 노랑빛 */}
      <g transform="translate(85 178)">
        <rect x="-0.6" y="4" width="1.2" height="28" fill="#6B5446" rx="0.3" />
        <circle cx="0" cy="0" r="6" fill="#FFE9A8" opacity="0.45" />
        <circle cx="0" cy="0" r="3.5" fill="#FFCB6E" opacity="0.95" />
        <path d="M -2.5 -4 L 2.5 -4 L 1.5 -2 L -1.5 -2 Z" fill="#6B5446" />
      </g>

      {/* 빨래줄 + 빨래 (파스텔) */}
      <path
        d="M 30 178 Q 100 186 170 178"
        stroke="#8B5E42"
        strokeWidth="0.4"
        fill="none"
      />
      <rect x="50" y="182" width="6" height="9" fill="#FFD0BB" rx="1" />
      <rect x="72" y="184" width="5" height="8" fill="#C9E1EF" rx="1" />
      <rect x="98" y="184" width="6" height="9" fill="#FFFFFF" rx="1" />
      <rect x="120" y="182" width="5" height="8" fill="#B1DCB5" rx="1" />
      <rect x="140" y="184" width="5" height="8" fill="#FFE9A8" rx="1" />

      {/* 화분 — 좌측 */}
      <g transform="translate(38 274)">
        <rect x="-5" y="2" width="10" height="7" fill="#C97D5C" rx="0.8" />
        <ellipse cx="0" cy="1" rx="7" ry="4" fill="#8BCB90" />
        <circle cx="-3" cy="-2" r="2.5" fill="#B1DCB5" />
        <circle cx="3" cy="-3" r="2.8" fill="#A8CFB5" />
        <circle cx="0" cy="-4.5" r="2" fill="#FFB6A8" />
        <circle cx="-3.5" cy="-4" r="1.4" fill="#FFE9A8" />
      </g>

      {/* 화분 — 우측 (다른 꽃) */}
      <g transform="translate(166 286)">
        <rect x="-5" y="2" width="10" height="7" fill="#C97D5C" rx="0.8" />
        <ellipse cx="0" cy="1" rx="7" ry="4" fill="#A8CFB5" />
        <circle cx="-2" cy="-3" r="1.8" fill="#FFB6A8" />
        <circle cx="2" cy="-4" r="1.8" fill="#FFC4DC" />
        <circle cx="0" cy="-2" r="1.5" fill="#FFE9A8" />
      </g>
    </g>
  );
}

// ── 다가옴: 길 끝에 목적지 윤곽 ──────────────
function ApproachScene({ mission }: { mission: Mission }) {
  return (
    <g>
      {/* 구름 + 새 */}
      <Cloud cx={35} cy={32} scale={0.75} />
      <Cloud cx={160} cy={48} scale={0.9} />
      <Birds x={50} y={75} />

      {/* 먼 산 3겹 */}
      <path
        d="M -10 125 Q 40 95 90 110 Q 140 92 210 108 L 210 165 L -10 165 Z"
        fill="url(#snapMtnFar)"
      />
      <path
        d="M -10 140 Q 50 118 110 130 Q 160 115 210 128 L 210 165 L -10 165 Z"
        fill="url(#snapMtnMid)"
      />
      <path
        d="M -10 155 Q 60 138 130 148 Q 180 138 210 150 L 210 170 L -10 170 Z"
        fill="url(#snapMtnNear)"
      />

      {/* 잔디 */}
      <rect y="160" width="200" height="160" fill="url(#snapGrass)" />

      {/* 길 (곡선) */}
      <path
        d="M 82 160 Q 65 220 26 320 L 174 320 Q 135 220 118 160 Z"
        fill="url(#snapRoad)"
      />
      <path
        d="M 100 165 Q 100 240 100 320"
        stroke="#FFF8F0"
        strokeWidth="1.4"
        strokeDasharray="5 9"
        opacity="0.6"
        fill="none"
      />

      {/* 목적지 윤곽 (작게 멀리) */}
      <g opacity="0.92" transform="translate(100 148)">
        {mission.background === "hospital" && (
          <>
            <rect x="-18" y="-22" width="36" height="22" fill="#FFFCF7" />
            <rect x="-3" y="-18" width="6" height="14" fill="#FF7043" />
            <rect x="-9" y="-13" width="18" height="4" fill="#FF7043" />
          </>
        )}
        {mission.background === "market" && (
          <>
            <path d="M -22 -16 L 22 -16 L 20 -8 L -20 -8 Z" fill="#FF8A5C" />
            <rect x="-18" y="-8" width="36" height="8" fill="#B88C6E" />
          </>
        )}
        {mission.background === "cafe" && (
          <>
            <rect x="-16" y="-20" width="32" height="20" fill="#F4DEC2" />
            <path d="M -18 -20 L 18 -20 L 16 -16 L -16 -16 Z" fill="#B88C6E" />
          </>
        )}
        {mission.background === "transit" && (
          <>
            <rect x="-12" y="-22" width="24" height="2" fill="#6B4530" />
            <rect x="-11" y="-20" width="2" height="20" fill="#7A7066" />
            <rect x="9" y="-20" width="2" height="20" fill="#7A7066" />
            <rect x="-9" y="-17" width="18" height="12" fill="#FFFCF7" />
          </>
        )}
        {mission.background === "office" && (
          <>
            <rect x="-18" y="-20" width="36" height="20" fill="#E8F0F4" />
            <rect x="-14" y="-14" width="10" height="8" fill="#A4C8DE" />
            <rect x="4" y="-14" width="10" height="8" fill="#A4C8DE" />
          </>
        )}
        {mission.background === "library" && (
          <>
            <rect x="-20" y="-22" width="40" height="22" fill="#F4E5C0" />
            <rect x="-16" y="-18" width="32" height="3" fill="#8B5E42" />
            <rect x="-16" y="-13" width="32" height="3" fill="#8B5E42" />
            <rect x="-16" y="-8" width="32" height="3" fill="#8B5E42" />
          </>
        )}
        {mission.background === "neighbor" && (
          <>
            <rect x="-16" y="-20" width="32" height="20" fill="#F4DEC2" />
            <path d="M -20 -20 L 0 -32 L 20 -20 Z" fill="#8B5E42" />
          </>
        )}
        {mission.background === "home" && (
          <>
            <rect x="-16" y="-20" width="32" height="20" fill="#FBE6C2" />
            <path d="M -20 -20 L 0 -30 L 20 -20 Z" fill="#8B5E42" />
          </>
        )}
      </g>

      {/* 길가 나무 — 가까운 큰 것 / 멀리 작은 것 */}
      <Tree x={30} y={220} scale={0.9} />
      <Tree x={170} y={228} scale={1} variant="cone" />
      <Tree x={186} y={258} scale={0.55} />
      <Tree x={15} y={262} scale={0.55} variant="cone" />

      {/* 길 옆 들꽃 */}
      <FlowerCluster cx={58} cy={278} scale={0.9} />
      <FlowerCluster cx={142} cy={285} scale={0.85} />
      <FlowerCluster cx={48} cy={300} scale={1} />
      <FlowerCluster cx={155} cy={306} scale={1} />

      {/* 전경 풀 */}
      <ellipse cx="35" cy="316" rx="20" ry="3" fill="#A8C695" opacity="0.6" />
      <ellipse cx="170" cy="318" rx="22" ry="3" fill="#A8C695" opacity="0.6" />
    </g>
  );
}

// ── 도착: 목적지 정면 ─────────────────────────
function ArriveScene({ mission }: { mission: Mission }) {
  return (
    <g>
      {/* 구름 (도착 분위기) */}
      <Cloud cx={38} cy={32} scale={0.8} />
      <Cloud cx={160} cy={48} scale={0.9} />

      {/* 먼 산 2겹 (낮게 — 목적지 가려지지 않게) */}
      <path
        d="M -10 138 Q 50 110 110 122 Q 160 110 210 120 L 210 168 L -10 168 Z"
        fill="url(#snapMtnFar)"
        opacity="0.85"
      />
      <path
        d="M -10 152 Q 60 132 130 144 Q 180 134 210 142 L 210 170 L -10 170 Z"
        fill="url(#snapMtnNear)"
        opacity="0.7"
      />

      {/* 잔디 */}
      <rect y="160" width="200" height="160" fill="url(#snapGrass)" />
      {/* 진입로 — 곡선 */}
      <path
        d="M 62 160 Q 50 220 28 320 L 172 320 Q 150 220 138 160 Z"
        fill="url(#snapRoad)"
      />

      {/* 목적지 풀버전 — 파스텔 톤, 둥근 모서리 */}
      {mission.background === "hospital" && (
        <g transform="translate(100 130)">
          <rect x="-50" y="-20" width="100" height="80" rx="3" fill="#FFFCF7" />
          <rect x="-52" y="-22" width="104" height="4" rx="1" fill="#FFE0CC" />
          <rect x="-12" y="-12" width="24" height="22" rx="1.5" fill="#FFFFFF" />
          <rect x="-3" y="-10" width="6" height="18" fill="#FF8A5C" rx="0.5" />
          <rect x="-9" y="-3" width="18" height="6" fill="#FF8A5C" rx="0.5" />
          <text x="0" y="22" fontSize="6" fill="#6B5446" textAnchor="middle" fontWeight="bold">병원</text>
          {[0, 1, 2].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={-42 + col * 22}
                y={28 + row * 9}
                width="16"
                height="6"
                rx="1"
                fill="#C9E1EF"
                opacity="0.8"
              />
            ))
          )}
        </g>
      )}
      {mission.background === "market" && (
        <g transform="translate(100 150)">
          <path d="M -64 -18 Q -64 -20 -62 -20 L 62 -20 Q 64 -20 64 -18 L 56 -2 L -56 -2 Z" fill="#FF9F7A" />
          <path d="M -56 -2 L 56 -2" stroke="#FFF8F0" strokeWidth="1" strokeDasharray="3 4" />
          <rect x="-50" y="-2" width="32" height="20" rx="1.5" fill="#D9A98C" />
          <rect x="-15" y="-2" width="32" height="20" rx="1.5" fill="#D9A98C" />
          <rect x="20" y="-2" width="32" height="20" rx="1.5" fill="#D9A98C" />
          <circle cx="-34" cy="-8" r="3" fill="#A8CFB5" />
          <circle cx="-24" cy="-9" r="3.5" fill="#B1DCB5" />
          <circle cx="0" cy="-8" r="3" fill="#FF8A5C" />
          <circle cx="10" cy="-9" r="3.5" fill="#FFE0A8" />
          <circle cx="30" cy="-8" r="3" fill="#A8CFB5" />
        </g>
      )}
      {mission.background === "cafe" && (
        <g transform="translate(100 130)">
          <rect x="-40" y="-20" width="80" height="60" rx="3" fill="#F4DEC2" />
          <path d="M -42 -20 Q -42 -22 -40 -22 L 40 -22 Q 42 -22 42 -20 L 38 -10 L -38 -10 Z" fill="#D9A98C" />
          <rect x="-22" y="-4" width="44" height="14" rx="1.5" fill="#FFFCF7" />
          <text x="0" y="6" fontSize="6" fill="#6B5446" textAnchor="middle" fontWeight="bold">주민 카페</text>
          <rect x="-15" y="14" width="30" height="22" rx="1.5" fill="#8B5E42" />
          {/* 화분 양옆 */}
          <ellipse cx="-30" cy="38" rx="6" ry="3" fill="#A8CFB5" />
          <ellipse cx="30" cy="38" rx="6" ry="3" fill="#A8CFB5" />
        </g>
      )}
      {mission.background === "transit" && (
        <g transform="translate(120 150)">
          <rect x="-22" y="-18" width="44" height="4" rx="1" fill="#8B5E42" />
          <rect x="-21" y="-15" width="2" height="40" fill="#9A8C7A" rx="0.5" />
          <rect x="19" y="-15" width="2" height="40" fill="#9A8C7A" rx="0.5" />
          <rect x="-17" y="-10" width="34" height="22" rx="1.5" fill="#FFFCF7" />
          <circle cx="0" cy="-26" r="7" fill="#A8CFB5" />
          <text x="0" y="-24" fontSize="6" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">B</text>
          <rect x="-19" y="14" width="38" height="4" rx="1" fill="#C97D5C" />
        </g>
      )}
      {mission.background === "office" && (
        <g transform="translate(100 130)">
          <rect x="-44" y="-20" width="88" height="60" rx="3" fill="#E8F0F4" />
          <rect x="-22" y="-12" width="20" height="14" rx="1" fill="#C9E1EF" />
          <rect x="2" y="-12" width="20" height="14" rx="1" fill="#C9E1EF" />
          <rect x="-22" y="6" width="20" height="14" rx="1" fill="#C9E1EF" />
          <rect x="2" y="6" width="20" height="14" rx="1" fill="#C9E1EF" />
          <rect x="-10" y="26" width="20" height="14" rx="1.5" fill="#8B5E42" />
        </g>
      )}
      {mission.background === "library" && (
        <g transform="translate(100 130)">
          <rect x="-48" y="-20" width="96" height="60" rx="3" fill="#F4E5C0" />
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={-40 + col * 22}
                y={-10 + row * 12}
                width="18"
                height="10"
                rx="1"
                fill={
                  (row + col) % 3 === 0
                    ? "#FF9F7A"
                    : (row + col) % 3 === 1
                    ? "#A8CFB5"
                    : "#C9E1EF"
                }
              />
            ))
          )}
        </g>
      )}
      {mission.background === "neighbor" && (
        <g transform="translate(100 130)">
          <rect x="-40" y="-20" width="80" height="60" rx="3" fill="#F4DEC2" />
          <path d="M -44 -20 L 0 -40 L 44 -20 Z" fill="#C97D5C" />
          <rect x="-12" y="-8" width="24" height="20" rx="1.5" fill="#C9E1EF" />
          <rect x="-8" y="20" width="16" height="20" rx="1.5" fill="#8B5E42" />
        </g>
      )}
      {mission.background === "home" && (
        <g transform="translate(100 130)">
          <rect x="-40" y="-20" width="80" height="60" rx="3" fill="#FBE6C2" />
          <path d="M -44 -20 L 0 -36 L 44 -20 Z" fill="#C97D5C" />
          <rect x="-10" y="-6" width="20" height="14" rx="1.5" fill="#C9E1EF" />
          <rect x="-8" y="20" width="16" height="20" rx="1.5" fill="#8B5E42" />
        </g>
      )}

      {/* 입구 꽃다발 — 환영하는 느낌 */}
      <FlowerCluster cx={45} cy={296} scale={1.1} />
      <FlowerCluster cx={155} cy={300} scale={1.1} />
      <FlowerCluster cx={32} cy={312} scale={0.9} />
      <FlowerCluster cx={168} cy={314} scale={0.9} />
    </g>
  );
}

// =====================================================================
// 텍스트/오버레이 컴포넌트
// =====================================================================

// 두 캐릭터(지음+바람)가 화면 앞쪽에 서서 통통 튀며 "걷는 듯" 보이게 하는 레이어.
// 진짜로 위치가 바뀌는 게 아니라 SVG 배경이 슬라이드 트랙과 함께 뒤로 흐르는 식.
function WalkingCharacters({ isArrival }: { isArrival: boolean }) {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-[150px] z-[5] pointer-events-none
                 flex justify-center items-end gap-0"
    >
      <motion.img
        src="/character1/clay-jieum-solo.png"
        alt=""
        className="w-[124px] h-auto -mr-7 drop-shadow-[0_8px_12px_rgba(62,44,32,0.22)] relative z-[2]"
        animate={
          isArrival
            ? { y: [-1.5, 0, -1.5], rotate: 0 }
            : { y: [-6, 0, -6], rotate: [-1.5, 1.5, -1.5] }
        }
        transition={{
          duration: isArrival ? 1.8 : 0.7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.img
        src="/character1/clay-baram-solo.png"
        alt=""
        className="w-[104px] h-auto mb-1 drop-shadow-[0_8px_12px_rgba(62,44,32,0.22)] relative z-[1]"
        animate={
          isArrival
            ? { y: [-1.5, 0, -1.5], rotate: 0 }
            : { y: [-4, 0, -4], rotate: [1.5, -1.5, 1.5] }
        }
        transition={{
          duration: isArrival ? 1.8 : 0.78,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.12,
        }}
      />
    </div>
  );
}

function SlideSubtitle({ text }: { text: string }) {
  return (
    <div className="absolute top-[68px] left-0 right-0 z-10 px-6 text-center">
      <p className="inline-block px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur
                    text-ink text-[12px] font-bold shadow-soft border border-cream-200">
        {text}
      </p>
    </div>
  );
}

function StoryCard({ speaker, text }: { speaker: string; text: string }) {
  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="absolute left-4 right-4 bottom-[110px] z-10
                 bg-white rounded-2xl px-4 py-3 shadow-soft border border-cream-200"
    >
      <p className="text-[10px] font-bold text-primary-600">💬 {speaker}</p>
      <p className="mt-1 text-ink text-[13px] leading-relaxed">"{text}"</p>
    </motion.div>
  );
}

function ArrivalLabel({ destination }: { destination: string }) {
  return (
    <div className="absolute inset-x-0 top-[18%] z-10 flex flex-col items-center pointer-events-none">
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 14, stiffness: 200 }}
        className="px-5 py-2 rounded-2xl bg-white shadow-soft border border-cream-200"
      >
        <span className="text-ink text-[32px] font-extrabold leading-none">도착!</span>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-2 px-3 py-1 rounded-full bg-primary text-white text-[12px] font-bold shadow-soft"
      >
        {destination}
      </motion.p>
    </div>
  );
}
