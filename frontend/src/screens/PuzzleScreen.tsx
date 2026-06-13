// 주간 퍼즐 — 체류 중 하루를 마칠 때마다 조각 하나가 채워짐.
//
// 의도:
//   · 전체 조각 수 = totalPieces (체류 일수). 강화 3박 4일이면 4조각.
//   · 마지막 조각이 채워지면 "바람이지음이 보낸 강화도 사진" 한 장이 완성.
//   · 경품/추첨 아님 — 정서적 추억의 매개.
//
// 입력 prop:
//   prev — 이 화면 진입 직전까지 채워져 있던 조각 수 (애니메이션 시작 상태)
//   next — 이 화면 진입과 함께 채워진 조각 수 (애니메이션 종료 상태)
//   prev < next 면 "새 조각이 끼어드는" 애니메이션이 보임.
//
// 시퀀스:
//   바람이지음 마무리 모달 → "좋아" → 이 화면으로 전환 (App.tsx 가 처리).
//   화면 진입 → prev 까지의 조각이 즉시 보임 → 700ms 뒤 next 번째 조각이 spring 등장.
//   카피는 next 값에 따라 동적.
//
// TODO(final-day): next === totalPieces 일 때 "후속 화면(이주 리포트 / 마당)" 으로의
//   진입점 콜백을 비워둠. 지금은 onContinue 가 일괄적으로 day-end-ceremony 로 보냄.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Props = {
  region: string;
  totalPieces: number;
  prev: number;
  next: number;
  /** 완성될 전체 사진 (cover 로 백그라운드 사용) */
  imageSrc: string;
  /** 다음 화면으로 이어주는 콜백 — 일반 일차: day-end-ceremony / 마지막 일차: 후속(TODO) */
  onContinue: () => void;
};

export default function PuzzleScreen({
  region,
  totalPieces,
  prev,
  next,
  imageSrc,
  onContinue,
}: Props) {
  // 새 조각 spring 등장 직전까지는 prev 까지만 채워진 상태로 보여줌.
  const [animatedFilled, setAnimatedFilled] = useState(prev);
  useEffect(() => {
    if (next <= prev) {
      setAnimatedFilled(next);
      return;
    }
    const t = setTimeout(() => setAnimatedFilled(next), 700);
    return () => clearTimeout(t);
  }, [prev, next]);

  // 그리드 배열 — totalPieces 가 4 면 2x2, 6 이면 2x3 ... 적당히.
  // 강화 3박 4일 → 2x2 가 기본. cols 는 √totalPieces 올림.
  const cols = Math.ceil(Math.sqrt(totalPieces));
  const rows = Math.ceil(totalPieces / cols);

  // 카피 — next 기준
  const isComplete = next >= totalPieces;
  const isLastBefore = !isComplete && next === totalPieces - 1;
  const caption = isComplete
    ? "바람이지음이가 너한테 보내는 강화도예요"
    : isLastBefore
    ? "마지막 한 조각, 끼워볼까?"
    : "오늘 조각 하나 더! 그림이 거의 다 보여요";

  const ctaLabel = isComplete ? "잘 봤어요" : "좋아";

  return (
    <div
      className="relative min-h-[calc(100dvh-6rem)] flex flex-col
                 bg-gradient-to-b from-cream via-cream to-nature-50 overflow-hidden"
    >
      {/* 상단 라벨 */}
      <header className="pt-12 px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-[10.5px] font-extrabold tracking-[0.18em] uppercase text-primary"
        >
          {region} · 주간 퍼즐
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mt-1.5 text-ink text-[22px] font-extrabold leading-tight"
        >
          {isComplete ? "그림이 완성됐어요" : "오늘의 조각"}
        </motion.h1>
      </header>

      {/* 퍼즐 그리드 — 중앙 큼직하게 */}
      <section className="flex-1 flex items-center justify-center px-5">
        <div
          className="bg-white rounded-3xl shadow-soft border border-cream-200 p-4"
          style={{
            width: "min(80vw, 320px)",
          }}
        >
          <div
            className="grid w-full overflow-hidden rounded-2xl"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              aspectRatio: "1 / 1",
              gap: 4,
              backgroundColor: "#EFE7D5",
            }}
            aria-label={`퍼즐 ${animatedFilled} / ${totalPieces}`}
          >
            {Array.from({ length: totalPieces }, (_, idx) => (
              <PuzzlePiece
                key={idx}
                index={idx}
                cols={cols}
                rows={rows}
                imageSrc={imageSrc}
                filled={idx < animatedFilled}
                /** 새로 채워지는 조각만 spring 등장. 이미 채워져 있던 건 즉시 표시. */
                isNew={idx === next - 1 && next > prev}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 하단 카피 + CTA */}
      <footer className="px-6 pb-8 pt-4">
        <motion.p
          key={caption}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: animatedFilled === next ? 0.6 : 0,
            duration: 0.4,
          }}
          className="text-center text-ink-soft text-[14px] leading-relaxed mb-5"
        >
          {caption}
        </motion.p>
        <motion.button
          type="button"
          onClick={onContinue}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: animatedFilled === next ? 0.9 : 0.2, duration: 0.4 }}
          className="w-full h-12 rounded-full bg-primary text-white text-[14.5px] font-extrabold
                     shadow-[0_6px_16px_-4px_rgba(255,112,67,0.5)]
                     active:scale-[0.98] transition"
        >
          {ctaLabel}
        </motion.button>
      </footer>
    </div>
  );
}

// =====================================================================
// PuzzlePiece — 전체 사진을 cols × rows 로 등분해 자기 자리에 해당하는 부분만 노출.
//   · backgroundImage = imageSrc
//   · backgroundSize = (cols * 100%) × (rows * 100%) — 자기 셀이 전체의 1/cols × 1/rows
//   · backgroundPosition = (col / (cols - 1)) % × (row / (rows - 1)) % — 자기 셀 위치
//   · filled === false → 회색 placeholder
//   · isNew === true → spring scale 등장
// =====================================================================
function PuzzlePiece({
  index,
  cols,
  rows,
  imageSrc,
  filled,
  isNew,
}: {
  index: number;
  cols: number;
  rows: number;
  imageSrc: string;
  filled: boolean;
  isNew: boolean;
}) {
  const col = index % cols;
  const row = Math.floor(index / cols);
  const posX = cols > 1 ? (col / (cols - 1)) * 100 : 50;
  const posY = rows > 1 ? (row / (rows - 1)) * 100 : 50;

  if (!filled) {
    return (
      <div
        aria-hidden
        className="relative"
        style={{
          backgroundColor: "#E5DBC2",
        }}
      >
        {/* 가운데 작은 ? — 미수집 표식 */}
        <span
          className="absolute inset-0 flex items-center justify-center
                     text-[#B8A98A] text-[24px] font-extrabold"
        >
          ?
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={isNew ? { opacity: 0, scale: 0.7, rotate: -8 } : false}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={
        isNew
          ? { type: "spring", damping: 14, stiffness: 220, delay: 0.05 }
          : { duration: 0 }
      }
      style={{
        backgroundImage: `url(${imageSrc})`,
        backgroundSize: `${cols * 100}% ${rows * 100}%`,
        backgroundPosition: `${posX}% ${posY}%`,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
