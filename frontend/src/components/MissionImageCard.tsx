// 미션 카드 v3 — 호기심 질문 하나만. 미니멀.
//
// 디자인 원칙:
//   · 배경 이미지 + 어두운 마스크 → 분위기
//   · 가운데 큰 호기심 질문 한 줄 (제일 중요)
//   · 메타(보상/NPC/카테고리 태그/제목) 모두 제거 — 노이즈 줄이기
//   · 완료 상태는 카드 전체 톤다운 + 우상단 작은 ✓
//   · 모션 없음 — 정적 카드. tap 시 CSS active:scale 만 살짝 피드백.

import type { Mission } from "../data/missions";

type Props = {
  mission: Mission;
  bgImage: string;
  done: boolean;
  onClick?: () => void;
  eager?: boolean;
};

// 미션별 호기심 질문 — 정의된 게 있으면 우선, 없으면 description / 자동 생성 폴백
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
  restaurant: "현지인이 가는 밥집, 한 끼에 얼마쯤?",
  walking: "걷다 보면 마주칠 풍경은 어떤 모습일까?",
};

function curiosityFor(m: Mission): string {
  if (MISSION_QUESTIONS[m.id]) return MISSION_QUESTIONS[m.id];
  if (m.description) return m.description;
  switch (m.category) {
    case "생활현실형":
      return `${m.title} — 서울이랑 어떻게 다를까?`;
    case "관계형성형":
      return `${m.title} — 어떤 사람을 만나게 될까?`;
    default:
      return `${m.title} — 어떤 분위기일까?`;
  }
}

export default function MissionImageCard({
  mission,
  bgImage,
  done,
  onClick,
  eager,
}: Props) {
  const curiosity = curiosityFor(mission);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={curiosity}
      className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden
                 shadow-soft text-left ring-1 ring-black/5
                 transition active:scale-[0.98]"
    >
      {/* 배경 이미지 */}
      <img
        src={bgImage}
        alt=""
        aria-hidden
        loading={eager ? "eager" : "lazy"}
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
      />

      {/* 어두운 마스크 — 텍스트 가독성 */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none
                   bg-gradient-to-b from-black/40 via-black/35 to-black/60"
      />

      {/* 완료 톤다운 */}
      {done && (
        <div
          aria-hidden
          className="absolute inset-0 bg-[#3E2C20]/50 pointer-events-none"
        />
      )}

      {/* 우상단 — 완료 마크만 (작게) */}
      {done && (
        <span
          aria-label="완료"
          className="absolute top-3 right-3 inline-flex items-center justify-center
                     w-7 h-7 rounded-full bg-nature-500 text-white text-[12px] font-extrabold
                     shadow-[0_2px_6px_rgba(63,142,69,0.4)]"
        >
          ✓
        </span>
      )}

      {/* === 호기심 질문 — 카드의 유일한 텍스트 === */}
      <div className="absolute inset-x-5 bottom-6">
        <span
          aria-hidden
          className="block text-white/85 text-[40px] leading-none font-serif select-none"
        >
          "
        </span>
        <p
          className="mt-1 text-white text-[19px] font-extrabold leading-[1.35]
                     [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]"
        >
          {curiosity}
        </p>
      </div>
    </button>
  );
}
