// 미션 이동 화면 — 4장의 슬라이드(스냅샷)를 스와이프로 넘기는 카카오 로드뷰 스타일
// 1. 출발 — 거주지 골목 입구
// 2. 골목 + 주민 이야기 카드
// 3. 다가옴 — 목적지가 멀리 보임
// 4. 도착! — 목적지 풀 뷰 + 미션 시작 CTA

import { useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import type { Mission } from "../data/missions";

type Props = {
  mission: Mission;
  onComplete: () => void;
};

// 미션별 도착지 라벨
function getDestinationLabel(mission: Mission): string {
  const m: Record<string, string> = {
    market: "전통시장",
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
      "어머, 처음 보는 얼굴이네요. 시장 안쪽으로 들어가면 진짜 좋은 채소가 많아요.",
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

// 도착 슬라이드의 CTA 라벨 — 미션 모드에 맞게 분기
function getArrivalCtaLabel(mission: Mission): string {
  switch (mission.mode) {
    case "map-dialogue":
      return `${mission.npc.name}과 대화 나누기 💬`;
    case "map-info":
      return "장소 둘러보기 👀";
    default:
      // 이론상 traveling 화면을 거치는 다른 모드는 없지만 안전 fallback
      return "미션 시작하기";
  }
}

export default function MissionTravelingScreen({ mission, onComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const destination = getDestinationLabel(mission);
  const ctaLabel = getArrivalCtaLabel(mission);

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
    <div className="relative h-[calc(100dvh-6rem)] flex flex-col overflow-hidden bg-black">
      {/* 상단 — 진행 + 미션 정보 */}
      <header className="absolute top-0 left-0 right-0 z-30 px-4 pt-4 pb-3 flex items-center gap-2 bg-gradient-to-b from-black/45 via-black/15 to-transparent">
        <button
          type="button"
          onClick={onComplete}
          aria-label="건너뛰기"
          className="w-8 h-8 rounded-full bg-white/85 backdrop-blur shadow-soft
                     text-[#3E2C20] text-[11px] font-bold"
        >
          ⤴
        </button>
        <div className="flex-1 min-w-0 text-white">
          <p className="text-[10px] font-bold opacity-85 tracking-widest uppercase">
            이동 중 · {idx + 1} / {slides.length}
          </p>
          <p className="text-[13px] font-extrabold truncate drop-shadow">
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
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="w-full h-full shrink-0 relative select-none"
          >
            <Snapshot kind={slide.id} mission={mission} />
            <SlideSubtitle text={slide.subtitle} />

            {slide.story && (
              <StoryCard speaker={mission.npc.name} text={slide.story} />
            )}

            {slide.isLast && <ArrivalLabel destination={destination} />}
          </div>
        ))}
      </motion.div>

      {/* 하단 — 도트 + 다음 / 미션 시작 */}
      <footer className="absolute bottom-6 left-0 right-0 z-30 px-6 flex flex-col items-center gap-3">
        <div className="flex gap-1.5" aria-hidden>
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all
                ${i === idx ? "bg-white w-6" : "bg-white/40 w-1.5"}`}
            />
          ))}
        </div>

        {idx < slides.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="px-5 py-2.5 rounded-full bg-white/95 backdrop-blur
                       text-[#3E2C20] text-[13px] font-extrabold shadow-soft
                       active:scale-[0.99]"
          >
            다음 →
          </button>
        ) : (
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
        )}

        <p className="text-white/60 text-[10px]">
          좌우로 스와이프하거나 '다음'을 눌러요
        </p>
      </footer>
    </div>
  );
}

// =====================================================================
// Snapshot — 4가지 variant별 SVG 풍경
// =====================================================================

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
        <linearGradient id="snapSky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#BDE7FF" />
          <stop offset="0.55" stopColor="#FFE4C8" />
          <stop offset="1" stopColor="#F4D8A8" />
        </linearGradient>
        <linearGradient id="snapRoad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#D8C49E" />
          <stop offset="1" stopColor="#B89E78" />
        </linearGradient>
      </defs>

      {/* 하늘 */}
      <rect width="200" height="160" fill="url(#snapSky)" />

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
      {/* 먼 산 */}
      <path
        d="M -10 150 Q 40 110 90 130 Q 140 105 200 130 L 200 165 L -10 165 Z"
        fill="#A8C8B0"
        opacity="0.7"
      />
      {/* 잔디 */}
      <rect y="160" width="200" height="160" fill="#D8E8C8" />
      {/* 길 (사다리꼴) */}
      <path
        d="M 80 160 L 30 320 L 170 320 L 120 160 Z"
        fill="url(#snapRoad)"
      />
      <path d="M 100 165 L 100 320" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="6 10" opacity="0.55" />

      {/* 좌측 한옥 */}
      <g transform="translate(36 200)">
        <rect x="-26" y="0" width="52" height="40" fill="#EEDDC0" />
        <path d="M -32 0 L 0 -28 L 32 0 Z" fill="#7B5640" />
        <path d="M -32 -2 L 32 -2 L 32 2 L -32 2 Z" fill="#5A3D2A" />
        <rect x="-16" y="10" width="10" height="14" fill="#5A4630" />
        <rect x="6" y="10" width="10" height="14" fill="#5A4630" />
        <rect x="-5" y="22" width="10" height="18" fill="#5A4630" />
      </g>
      {/* 우측 작은 집 */}
      <g transform="translate(170 220)">
        <rect x="-16" y="0" width="32" height="22" fill="#E2CCAA" />
        <path d="M -20 0 L 0 -14 L 20 0 Z" fill="#7B5640" />
        <rect x="-4" y="8" width="8" height="14" fill="#5A4630" />
      </g>
      {/* 나무 */}
      <g transform="translate(166 180)">
        <rect x="-1" y="0" width="2" height="14" fill="#7B5640" />
        <circle r="11" fill="#7BA86F" />
        <circle cx="-4" cy="-3" r="7" fill="#A0C690" />
      </g>
    </g>
  );
}

// ── 골목: 좁은 길 + 담장 + 가로등 ──────────────
function AlleyScene() {
  return (
    <g>
      {/* 골목 끝 빛 */}
      <circle cx="100" cy="170" r="20" fill="#FFE5C8" opacity="0.7" />

      {/* 좌측 담장 (퍼스펙티브) */}
      <path d="M 0 165 L 80 165 L 30 320 L 0 320 Z" fill="#D8C0A0" />
      <path d="M 0 165 L 80 165 L 80 170 L 0 170 Z" fill="#7B5640" opacity="0.4" />
      {/* 우측 담장 */}
      <path d="M 200 165 L 120 165 L 170 320 L 200 320 Z" fill="#E2CCAA" />
      <path d="M 200 165 L 120 165 L 120 170 L 200 170 Z" fill="#7B5640" opacity="0.4" />

      {/* 길 (사다리꼴) */}
      <path d="M 80 165 L 30 320 L 170 320 L 120 165 Z" fill="url(#snapRoad)" />
      {/* 길 중앙선 흐름 */}
      <path d="M 100 170 L 100 320" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="6 10" opacity="0.6" />

      {/* 가로등 */}
      <g>
        <rect x="84" y="180" width="2" height="24" fill="#5A4630" />
        <circle cx="85" cy="180" r="4" fill="#FFE5C8" />
        <circle cx="85" cy="180" r="2.5" fill="#FFC53D" opacity="0.7" />
      </g>

      {/* 빨래줄 */}
      <path
        d="M 30 175 Q 100 184 170 175"
        stroke="#5A4630"
        strokeWidth="0.5"
        fill="none"
      />
      <rect x="60" y="178" width="6" height="9" fill="#FFE0D3" rx="0.5" />
      <rect x="84" y="180" width="5" height="8" fill="#A8D5A8" rx="0.5" />
      <rect x="120" y="178" width="6" height="9" fill="#FFFFFF" rx="0.5" />
    </g>
  );
}

// ── 다가옴: 길 끝에 목적지 윤곽 ──────────────
function ApproachScene({ mission }: { mission: Mission }) {
  return (
    <g>
      {/* 먼 산 */}
      <path
        d="M -10 145 Q 40 105 90 125 Q 140 100 200 125 L 200 160 L -10 160 Z"
        fill="#A8C8B0"
        opacity="0.65"
      />
      {/* 잔디 */}
      <rect y="160" width="200" height="160" fill="#D8E8C8" />
      {/* 길 (사다리꼴) */}
      <path d="M 80 160 L 30 320 L 170 320 L 120 160 Z" fill="url(#snapRoad)" />
      <path d="M 100 165 L 100 320" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="6 10" opacity="0.55" />

      {/* 목적지 윤곽 (작게 멀리) */}
      <g opacity="0.85" transform="translate(100 150)">
        {mission.background === "hospital" && (
          <>
            <rect x="-18" y="-22" width="36" height="22" fill="#F4F4F4" />
            <rect x="-3" y="-18" width="6" height="14" fill="#E55A30" />
            <rect x="-9" y="-13" width="18" height="4" fill="#E55A30" />
          </>
        )}
        {mission.background === "market" && (
          <>
            <path d="M -22 -16 L 22 -16 L 20 -8 L -20 -8 Z" fill="#E76F51" />
            <rect x="-18" y="-8" width="36" height="8" fill="#A8755A" />
          </>
        )}
        {mission.background === "cafe" && (
          <>
            <rect x="-16" y="-20" width="32" height="20" fill="#EFE0CB" />
            <path d="M -18 -20 L 18 -20 L 16 -16 L -16 -16 Z" fill="#A8755A" />
          </>
        )}
        {mission.background === "transit" && (
          <>
            <rect x="-12" y="-22" width="24" height="2" fill="#5A4630" />
            <rect x="-11" y="-20" width="2" height="20" fill="#5A5D60" />
            <rect x="9" y="-20" width="2" height="20" fill="#5A5D60" />
            <rect x="-9" y="-17" width="18" height="12" fill="#FFFFFF" />
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
            <rect x="-16" y="-18" width="32" height="3" fill="#7B5640" />
            <rect x="-16" y="-13" width="32" height="3" fill="#7B5640" />
            <rect x="-16" y="-8" width="32" height="3" fill="#7B5640" />
          </>
        )}
        {mission.background === "neighbor" && (
          <>
            <rect x="-16" y="-20" width="32" height="20" fill="#EEDDC0" />
            <path d="M -20 -20 L 0 -32 L 20 -20 Z" fill="#7B5640" />
          </>
        )}
        {mission.background === "home" && (
          <>
            <rect x="-16" y="-20" width="32" height="20" fill="#FBE6C2" />
            <path d="M -20 -20 L 0 -30 L 20 -20 Z" fill="#7B5640" />
          </>
        )}
      </g>

      {/* 길가 나무 */}
      <g transform="translate(38 210)">
        <rect x="-1" y="0" width="2" height="12" fill="#7B5640" />
        <circle r="10" fill="#7BA86F" />
        <circle cx="-3" cy="-2" r="6" fill="#A0C690" />
      </g>
      <g transform="translate(162 215)">
        <rect x="-1" y="0" width="2" height="12" fill="#7B5640" />
        <circle r="10" fill="#7BA86F" />
        <circle cx="3" cy="-2" r="6" fill="#A0C690" />
      </g>
    </g>
  );
}

// ── 도착: 목적지 정면 ─────────────────────────
function ArriveScene({ mission }: { mission: Mission }) {
  return (
    <g>
      {/* 잔디 */}
      <rect y="160" width="200" height="160" fill="#D8E8C8" />
      {/* 진입로 */}
      <path d="M 60 160 L 30 320 L 170 320 L 140 160 Z" fill="url(#snapRoad)" />

      {/* 목적지 풀버전 */}
      {mission.background === "hospital" && (
        <g transform="translate(100 130)">
          <rect x="-50" y="-20" width="100" height="80" fill="#F4F4F4" />
          <rect x="-52" y="-22" width="104" height="3" fill="#E0E0E0" />
          <rect x="-12" y="-12" width="24" height="20" fill="#FFFFFF" />
          <rect x="-3" y="-10" width="6" height="16" fill="#E55A30" />
          <rect x="-9" y="-5" width="18" height="6" fill="#E55A30" />
          <text x="0" y="20" fontSize="6" fill="#3E2C20" textAnchor="middle" fontWeight="bold">병원</text>
          {[0, 1, 2].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={-42 + col * 22}
                y={26 + row * 9}
                width="16"
                height="6"
                fill="#A4C8DE"
                opacity="0.7"
              />
            ))
          )}
        </g>
      )}
      {mission.background === "market" && (
        <g transform="translate(100 150)">
          <path d="M -64 -18 L 64 -18 L 56 -2 L -56 -2 Z" fill="#E76F51" />
          <path d="M -56 -2 L 56 -2" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 4" />
          <rect x="-50" y="-2" width="32" height="20" fill="#A8755A" />
          <rect x="-15" y="-2" width="32" height="20" fill="#A8755A" />
          <rect x="20" y="-2" width="32" height="20" fill="#A8755A" />
          <circle cx="-34" cy="-8" r="3" fill="#7BB57F" />
          <circle cx="-24" cy="-9" r="3.5" fill="#A8D5A8" />
          <circle cx="0" cy="-8" r="3" fill="#FF7043" />
          <circle cx="10" cy="-9" r="3.5" fill="#FFC53D" />
          <circle cx="30" cy="-8" r="3" fill="#7BB57F" />
        </g>
      )}
      {mission.background === "cafe" && (
        <g transform="translate(100 130)">
          <rect x="-40" y="-20" width="80" height="60" fill="#EFE0CB" />
          <path d="M -42 -20 L 42 -20 L 38 -10 L -38 -10 Z" fill="#A8755A" />
          <rect x="-22" y="-4" width="44" height="14" fill="#FFFFFF" />
          <text x="0" y="6" fontSize="6" fill="#5A4630" textAnchor="middle" fontWeight="bold">주민 카페</text>
          <rect x="-15" y="14" width="30" height="20" fill="#5A4630" />
        </g>
      )}
      {mission.background === "transit" && (
        <g transform="translate(120 150)">
          <rect x="-22" y="-18" width="44" height="3" fill="#5A4630" />
          <rect x="-21" y="-15" width="2" height="40" fill="#5A5D60" />
          <rect x="19" y="-15" width="2" height="40" fill="#5A5D60" />
          <rect x="-17" y="-10" width="34" height="22" fill="#FFFFFF" />
          <circle cx="0" cy="-26" r="7" fill="#7BB57F" />
          <text x="0" y="-24" fontSize="6" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">B</text>
          <rect x="-19" y="14" width="38" height="3" fill="#7B5640" />
        </g>
      )}
      {mission.background === "office" && (
        <g transform="translate(100 130)">
          <rect x="-44" y="-20" width="88" height="60" fill="#E8F0F4" />
          <rect x="-22" y="-12" width="20" height="14" fill="#A4C8DE" />
          <rect x="2" y="-12" width="20" height="14" fill="#A4C8DE" />
          <rect x="-22" y="6" width="20" height="14" fill="#A4C8DE" />
          <rect x="2" y="6" width="20" height="14" fill="#A4C8DE" />
          <rect x="-10" y="26" width="20" height="14" fill="#5A4630" />
        </g>
      )}
      {mission.background === "library" && (
        <g transform="translate(100 130)">
          <rect x="-48" y="-20" width="96" height="60" fill="#F4E5C0" />
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={-40 + col * 22}
                y={-10 + row * 12}
                width="18"
                height="10"
                fill={
                  (row + col) % 3 === 0
                    ? "#E55A30"
                    : (row + col) % 3 === 1
                    ? "#7BB57F"
                    : "#A4C8DE"
                }
              />
            ))
          )}
        </g>
      )}
      {mission.background === "neighbor" && (
        <g transform="translate(100 130)">
          <rect x="-40" y="-20" width="80" height="60" fill="#EFE0CB" />
          <path d="M -44 -20 L 0 -40 L 44 -20 Z" fill="#7B5640" />
          <rect x="-12" y="-8" width="24" height="20" fill="#A4C8DE" />
          <rect x="-8" y="20" width="16" height="20" fill="#5A4630" />
        </g>
      )}
      {mission.background === "home" && (
        <g transform="translate(100 130)">
          <rect x="-40" y="-20" width="80" height="60" fill="#FBE6C2" />
          <path d="M -44 -20 L 0 -36 L 44 -20 Z" fill="#7B5640" />
          <rect x="-10" y="-6" width="20" height="14" fill="#A4C8DE" />
          <rect x="-8" y="20" width="16" height="20" fill="#5A4630" />
        </g>
      )}
    </g>
  );
}

// =====================================================================
// 텍스트/오버레이 컴포넌트
// =====================================================================

function SlideSubtitle({ text }: { text: string }) {
  return (
    <div className="absolute top-[68px] left-0 right-0 z-10 px-6 text-center">
      <p className="inline-block px-3 py-1 rounded-full bg-black/40 backdrop-blur
                    text-white text-[12px] font-semibold">
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
                 bg-white/95 backdrop-blur rounded-2xl px-4 py-3 shadow-soft border border-white/60"
    >
      <p className="text-[10px] font-bold text-[#B8973F]">💬 {speaker}</p>
      <p className="mt-1 text-[#3E2C20] text-[13px] leading-relaxed">"{text}"</p>
    </motion.div>
  );
}

function ArrivalLabel({ destination }: { destination: string }) {
  return (
    <div className="absolute inset-x-0 top-[35%] z-10 flex flex-col items-center pointer-events-none">
      <motion.span
        initial={{ scale: 0, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 14, stiffness: 200 }}
        className="text-white text-[44px] font-extrabold drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
      >
        도착!
      </motion.span>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur
                   text-white text-[13px] font-bold"
      >
        {destination}
      </motion.p>
    </div>
  );
}
