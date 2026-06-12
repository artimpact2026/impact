// 시간대 메인 탭 — 아침 / 점심(낮) / 저녁 3개 균등 분할
// 내부 키는 "낮"이지만 라벨은 "점심" 으로 표시 (시스템 표기 미변경)
//
// 활성 탭 위에는 작은 점 인디케이터가 부드럽게 펄스 → "지금 여기" 시각 신호.

import { motion } from "framer-motion";
import type { TimeOfDay } from "../data/missions";

const TIME_ORDER: TimeOfDay[] = ["아침", "낮", "저녁"];
const TIME_LABEL: Record<TimeOfDay, string> = {
  아침: "아침",
  낮: "점심",
  저녁: "저녁",
};

type Props = {
  active: TimeOfDay;
  counts: Record<TimeOfDay, number>;
  onSelect: (t: TimeOfDay) => void;
  // 튜토리얼 오버레이 스포트라이트용 — 시간대별 버튼 ref 외부로 노출.
  lunchTabRef?: React.RefObject<HTMLButtonElement | null>;
  eveningTabRef?: React.RefObject<HTMLButtonElement | null>;
};

export default function TimeOfDayTabs({
  active,
  counts,
  onSelect,
  lunchTabRef,
  eveningTabRef,
}: Props) {
  return (
    // pt-4: 활성 탭 위 펄스 점이 잘리지 않도록 여유 확보
    // divide-x로 탭 사이 은은한 세로 구분선 — 배경/박스 없는 텍스트 톤
    <div
      className="px-5 pt-4 pb-1.5 flex items-stretch
                 divide-x divide-cream-200/70"
    >
      {TIME_ORDER.map((t) => {
        const isActive = t === active;
        const count = counts[t];
        return (
          <button
            key={t}
            ref={
              t === "낮"
                ? lunchTabRef
                : t === "저녁"
                ? eveningTabRef
                : undefined
            }
            type="button"
            onClick={() => onSelect(t)}
            aria-pressed={isActive}
            className={`relative flex-1 py-2 text-[14px] font-extrabold
                        bg-transparent transition-colors duration-200
                        ${isActive ? "text-primary" : "text-ink-mute"}`}
          >
            {/* 활성 탭 위 펄스 점 — "지금 여기" 시그널 */}
            {isActive && (
              <motion.span
                aria-hidden
                className="absolute -top-2 left-1/2 w-1.5 h-1.5 rounded-full bg-primary"
                style={{
                  translateX: "-50%",
                  boxShadow: "0 0 8px rgba(255,112,67,0.7)",
                }}
                animate={{
                  opacity: [0.55, 1, 0.55],
                  scale: [0.85, 1.2, 0.85],
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
            {TIME_LABEL[t]}
            <span
              className={`ml-1.5 text-[11px] tabular-nums ${
                isActive ? "text-primary/70" : "text-ink-mute"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
