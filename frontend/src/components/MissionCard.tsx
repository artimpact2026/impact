// 잠시섬 미션 카드 — 말해보카 회화 UI 스타일
// 좌측 아이콘 / 제목 + 카테고리·모드 / 우측 점수 + 완료 여부

import type { Mission } from "../data/missions";

type Props = {
  mission: Mission;
  done: boolean;
  onClick?: () => void;
};

function modeLabel(mode: Mission["mode"]): string {
  switch (mode) {
    case "map-dialogue":
      return "지도 + 대화";
    case "map-info":
      return "지도 안내";
    case "dialogue":
      return "대화";
    case "numeric":
      return "대화 + 입력";
    case "mailbox":
      return "우편함";
    case "final":
      return "자동 생성";
  }
}

export default function MissionCard({ mission, done, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl
                  border text-left transition shadow-soft
                  ${
                    done
                      ? "bg-nature-50 border-nature-200"
                      : "bg-white border-cream-200 active:scale-[0.99]"
                  }`}
    >
      {/* 좌측 아이콘 */}
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0
          ${done ? "bg-white" : "bg-cream-100"}`}
        aria-hidden
      >
        {mission.icon}
      </div>

      {/* 본문 */}
      <div className="flex-1 min-w-0">
        <p className="text-ink text-[14px] font-bold leading-tight truncate">
          {mission.title}
        </p>
        <p className="mt-0.5 text-ink-mute text-[11px] truncate">
          {mission.category} · {modeLabel(mission.mode)}
        </p>
      </div>

      {/* 우측: 점수 + 상태 */}
      <div className="shrink-0 flex flex-col items-end gap-0.5">
        <span
          className={`text-[12px] font-extrabold tabular-nums
            ${done ? "text-nature-600" : "text-primary"}`}
        >
          +{mission.reward}점
        </span>
        <span
          className={`text-[10px] font-bold
            ${done ? "text-nature-600" : "text-ink-mute"}`}
        >
          {done ? "✓ 완료" : "시작 ›"}
        </span>
      </div>
    </button>
  );
}
