// 레지던스 바텀시트 — 마커 선택 시 하단에서 슬라이드 업
// PRD: "마커 누르면: 레지던스 이름 / 프로그램 기간 / 라이프스타일 유형 매칭 이유 툴팁 표시"
// + 화면 명세 CTA "여기로 떠나기"

import { motion, AnimatePresence } from "framer-motion";
import type { Residence } from "../data/residences";
import { envMeta, stanceMeta } from "../data/lifestyle";
import PrimaryButton from "./PrimaryButton";

type Props = {
  residence: Residence | null;
  onClose: () => void;
  onDepart: (residence: Residence) => void;
};

export default function ResidenceSheet({ residence, onClose, onDepart }: Props) {
  return (
    <AnimatePresence>
      {residence && (
        <>
          {/* 백드롭 — 빈 화면 클릭 시 닫기. z-40으로 마커(zIndex ≤ 30) 차단 */}
          <motion.button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 z-40"
          />

          {/* 시트 본체 — 백드롭보다 위 */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="absolute left-0 right-0 bottom-0 z-50
                       bg-white rounded-t-3xl shadow-soft
                       px-6 pt-3 pb-6"
            role="dialog"
            aria-label={`${residence.region} 레지던스 상세`}
          >
            {/* 핸들 */}
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-cream-200" />

            {/* 헤더 — 매칭 유형 뱃지 + 지역 */}
            <div className="flex items-center justify-between">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1
                           rounded-full bg-nature-50 text-nature-600
                           text-[11px] font-bold"
              >
                <span aria-hidden>{residence.themeEmoji}</span>
                {stanceMeta[residence.stance].name}
                <span className="text-ink-mute font-medium">
                  · {envMeta[residence.envType].emoji} {envMeta[residence.envType].blurb}
                </span>
              </span>
              <span className="text-ink-mute text-[12px]">{residence.duration}</span>
            </div>

            {/* 레지던스 이름 + 지역 */}
            <h3 className="mt-2 text-ink text-[18px] font-extrabold leading-tight">
              {residence.name}
            </h3>
            <p className="mt-0.5 text-ink-soft text-[13px]">📍 {residence.region}</p>

            {/* 매칭 이유 */}
            <div
              className="mt-4 p-3 rounded-2xl bg-cream-100
                         text-ink-soft text-[13px] leading-relaxed"
            >
              <p className="font-semibold text-ink mb-0.5">왜 추천받았나요?</p>
              {residence.matchReason}
            </div>

            {/* CTA */}
            <div className="mt-5">
              <PrimaryButton onClick={() => onDepart(residence)}>
                여기로 떠나기 ✈️
              </PrimaryButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
