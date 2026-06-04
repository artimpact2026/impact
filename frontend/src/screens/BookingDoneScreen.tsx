// 레지던스 예약 — 완료 화면
// 캐릭터 2명이 축하해주는 분위기 + 요약 카드 + 목록/홈 버튼

import { motion } from "framer-motion";
import type { Residence } from "../data/residences";

type Props = {
  residence: Residence;
  draft: { startDate: string; durationMonths: number };
  onBackToList: () => void;
  onGoHome: () => void;
};

export default function BookingDoneScreen({
  residence,
  draft,
  onBackToList,
  onGoHome,
}: Props) {
  const totalCost = (residence.price ?? 0) * draft.durationMonths;

  return (
    <div className="h-screen overflow-y-auto bg-cream flex flex-col">
      <section className="flex-1 px-6 pt-12 pb-8 flex flex-col items-center text-center">
        {/* 축하 캐릭터 2명 — 통통 튀게 */}
        <div className="relative w-full flex justify-center items-end gap-0 mt-2 mb-4">
          <motion.img
            src="/character1/clay-jieum-solo.png"
            alt=""
            aria-hidden
            className="w-[120px] h-auto -mr-7 drop-shadow-[0_8px_12px_rgba(62,44,32,0.22)] relative z-[2]"
            animate={{ y: [-6, 0, -6], rotate: [-2, 2, -2] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.img
            src="/character1/clay-baram-solo.png"
            alt=""
            aria-hidden
            className="w-[104px] h-auto mb-1 drop-shadow-[0_8px_12px_rgba(62,44,32,0.22)] relative z-[1]"
            animate={{ y: [-4, 0, -4], rotate: [2, -2, 2] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.15,
            }}
          />
        </div>

        {/* 콘페티 느낌 점 몇 개 */}
        <div className="relative w-full h-6 -mt-3 mb-2" aria-hidden>
          <span className="absolute left-[18%] top-0 w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="absolute left-[40%] top-2 w-1 h-1 rounded-full bg-nature" />
          <span className="absolute right-[28%] top-1 w-1.5 h-1.5 rounded-full bg-[#FFC4DC]" />
          <span className="absolute right-[12%] top-3 w-1 h-1 rounded-full bg-[#FFE9A8]" />
        </div>

        <motion.h1
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 200 }}
          className="text-[24px] font-extrabold text-ink"
        >
          예약이 신청됐어요!
        </motion.h1>
        <p className="mt-2 text-[13px] text-ink-soft leading-relaxed">
          곧 운영팀에서 연락드릴 거예요.
          <br />
          좋은 여정 되세요 ✨
        </p>

        {/* 요약 카드 */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-6 w-full bg-white rounded-3xl shadow-soft border border-cream-200/80 px-5 py-5 text-left"
        >
          <p className="text-[10.5px] font-bold text-ink-mute tracking-widest uppercase">
            신청 요약
          </p>
          <p className="mt-2 text-[15px] font-extrabold text-ink leading-tight">
            {residence.name}
          </p>
          <p className="mt-0.5 text-[12px] text-ink-mute">
            📍 {residence.region}
          </p>

          <div className="mt-4 flex flex-col gap-2 text-[13px]">
            <Row label="입주일" value={draft.startDate} />
            <Row label="기간" value={`${draft.durationMonths}개월`} />
            <Row
              label="예상 비용"
              value={`${totalCost.toLocaleString("ko-KR")}만원`}
              emphasize
            />
          </div>

          {residence.hasSupport && (
            <p className="mt-3 text-[11px] text-nature-600 font-bold">
              🌱 정부 지원금 대상 — 운영팀이 절차를 안내드려요
            </p>
          )}
        </motion.div>
      </section>

      {/* 하단 버튼 — 안 고정, 컨텐츠 흐름 */}
      <section className="px-4 pb-[max(env(safe-area-inset-bottom),24px)] pt-2 flex flex-col gap-2">
        <button
          type="button"
          onClick={onBackToList}
          className="w-full py-3.5 rounded-2xl bg-primary text-white text-[15px] font-extrabold
                     shadow-soft active:scale-[0.99]"
        >
          예약 목록으로
        </button>
        <button
          type="button"
          onClick={onGoHome}
          className="w-full py-3.5 rounded-2xl bg-white text-ink text-[14px] font-bold
                     shadow-soft border border-cream-200 active:scale-[0.99]"
        >
          홈으로
        </button>
      </section>
    </div>
  );
}

function Row({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-mute">{label}</span>
      <span
        className={
          emphasize
            ? "text-[15px] font-extrabold text-ink"
            : "text-ink font-bold"
        }
      >
        {value}
      </span>
    </div>
  );
}
