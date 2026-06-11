// 미션 카드 v4 — 이미지 위 흰 박스로 텍스트 가독성 확보 (여행 앱 톤).
//
// 디자인 원칙:
//   · 배경 이미지는 또렷하게 (어두운 마스크 X)
//   · 카드 하단에 반투명 흰 박스 — 제목(메인) + 호기심 질문(부제)
//   · 제목은 모든 카드 2줄 고정(min-h)으로 박스 크기 통일
//   · 완료 상태는 카드 전체 톤다운 + 우상단 작은 ✓
//   · 모션 없음 — 정적 카드. tap 시 CSS active:scale 만 살짝 피드백.

import type { Mission } from "../data/missions";
import { curiosityFor } from "../data/missionCopy";

type Props = {
  mission: Mission;
  bgImage: string;
  done: boolean;
  onClick?: () => void;
  eager?: boolean;
};

export default function MissionImageCard({
  mission,
  bgImage,
  done,
  onClick,
  eager,
}: Props) {
  const curiosity = curiosityFor(mission);
  // 호기심 부제 — "—" 가 있으면 그 자리에서 줄바꿈 (— 가 아래줄 시작).
  // 없으면 한 줄 그대로. 박스 높이는 min-h 로 2줄 공간 통일.
  const emDashIdx = curiosity.indexOf("—");
  const curiosityHead =
    emDashIdx >= 0 ? curiosity.slice(0, emDashIdx).trim() : curiosity;
  const curiosityTail =
    emDashIdx >= 0 ? curiosity.slice(emDashIdx).trim() : null;

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

      {/* 완료 톤다운 */}
      {done && (
        <div
          aria-hidden
          className="absolute inset-0 bg-[#3E2C20]/50 pointer-events-none"
        />
      )}

      {/* 좌상단 — 시간대 칩 (Phase A) */}
      {mission.timeOfDay && (
        <span
          className="absolute top-3 left-3 inline-flex items-center gap-1
                     px-2 py-1 rounded-full bg-white/95 backdrop-blur
                     text-[10.5px] font-extrabold text-ink shadow-soft"
        >
          {mission.timeOfDay === "아침"
            ? "🌅"
            : mission.timeOfDay === "낮"
              ? "☀️"
              : "🌙"}{" "}
          {mission.timeOfDay}
        </span>
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

      {/* === 흰 박스 — 제목(메인) + 호기심 질문(부제) === */}
      <div
        className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/95 backdrop-blur
                   shadow-soft p-3"
      >
        {/* 제목 — 콘텐츠만큼만, 긴 제목은 line-clamp-2 로 cap. */}
        <p
          className="text-ink text-[17px] font-extrabold leading-tight line-clamp-2"
        >
          {mission.title}
        </p>
        {/* 호기심 질문 — 부제. "—" 자리에서 줄바꿈. 콘텐츠만큼만 차지. */}
        <p
          className="mt-[7px] text-ink-soft text-[11px] leading-tight"
        >
          {curiosityHead}
          {curiosityTail && (
            <>
              <br />
              {curiosityTail}
            </>
          )}
        </p>
      </div>
    </button>
  );
}
