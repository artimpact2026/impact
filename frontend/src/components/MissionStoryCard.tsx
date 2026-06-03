// 미션 — 카드뉴스 형태의 큰 카드
// 흥미를 끌도록 질문/티저/배울 점을 함께 노출

import type { Mission } from "../data/missions";
import type { MissionHook } from "../data/missionHooks";

type Props = {
  mission: Mission;
  hook?: MissionHook;
  done: boolean;
  onClick?: () => void;
};

export default function MissionStoryCard({ mission, hook, done, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full h-full flex flex-col p-5 rounded-3xl
                  border text-left shadow-soft transition
                  ${
                    done
                      ? "bg-nature-50 border-nature-200"
                      : "bg-white border-cream-200 active:scale-[0.99]"
                  }`}
    >
      {/* 상단 — 카테고리 + 점수 */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold tracking-widest uppercase text-primary">
          {mission.category}
        </span>
        <span
          className={`text-[12px] font-extrabold tabular-nums
            ${done ? "text-nature-600" : "text-primary"}`}
        >
          +{mission.reward}점
        </span>
      </div>

      {/* 큰 아이콘 */}
      <div className="mt-4 text-[56px] leading-none" aria-hidden>
        {mission.icon}
      </div>

      {/* 미션명(작게) */}
      <p className="mt-3 text-ink-mute text-[11px] font-bold tracking-wide">
        {mission.title}
      </p>

      {/* 큰 훅 질문 */}
      <h3 className="mt-1 text-ink text-[19px] font-extrabold leading-snug">
        {hook?.question ?? mission.title}
      </h3>

      {/* 부연 — 한 줄 티저 */}
      {hook?.tease && (
        <p className="mt-2 text-ink-soft text-[13px] leading-relaxed">
          {hook.tease}
        </p>
      )}

      {/* 배울 점 미리보기 */}
      {hook?.learn && hook.learn.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {hook.learn.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-ink-soft text-[12px]"
            >
              <span className="w-1 h-1 rounded-full bg-ink-soft" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      )}

      {/* 하단 — 시작/완료 표시 */}
      <div
        className={`mt-auto pt-5 flex items-center justify-between text-[12px] font-extrabold
          ${done ? "text-nature-600" : "text-primary"}`}
      >
        <span>{done ? "✓ 완료" : "체험 시작"}</span>
        {!done && <span aria-hidden>→</span>}
      </div>
    </button>
  );
}
