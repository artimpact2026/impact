// 우편함 오브젝트 — 화면 속 작은 오브젝트로 보이게 (카드 아님)
// 알림 뱃지가 있고 누르면 살짝 튀는 인터랙션

import { motion } from "framer-motion";

type Props = {
  unreadCount: number;
  onClick: () => void;
};

export default function MailboxObject({ unreadCount, onClick }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      whileHover={{ y: -2 }}
      aria-label={`우편함 (편지 ${unreadCount}통)`}
      className="relative inline-flex items-end focus:outline-none"
    >
      {/* SVG 우편함 */}
      <svg width="56" height="68" viewBox="0 0 56 68" aria-hidden>
        {/* 그림자 */}
        <ellipse cx="28" cy="64" rx="22" ry="3" fill="#000" opacity="0.18" />
        {/* 우편함 다리 */}
        <rect x="25" y="34" width="6" height="28" fill="#7A6254" />
        <rect x="22" y="60" width="12" height="3" rx="1.5" fill="#5A4630" />
        {/* 우편함 본체 (둥근 윗부분) */}
        <path
          d="M 10 28 Q 10 14 28 14 Q 46 14 46 28 L 46 38 L 10 38 Z"
          fill="#FF7043"
        />
        {/* 본체 측면 그림자 */}
        <path
          d="M 38 14 Q 46 14 46 28 L 46 38 L 38 38 Z"
          fill="#E55A30"
          opacity="0.6"
        />
        {/* 우편함 슬릿 */}
        <rect x="16" y="22" width="24" height="3" rx="1" fill="#5A4630" />
        {/* 손잡이/문 */}
        <rect x="20" y="30" width="16" height="4" rx="1" fill="#FFFFFF" />
        {/* 깃발 */}
        <rect x="44" y="20" width="2" height="14" fill="#5A4630" />
        <path d="M 46 20 L 53 22 L 46 26 Z" fill="#E55A30" />
      </svg>

      {/* 알림 뱃지 — 미확인 편지가 있을 때만 */}
      {unreadCount > 0 && (
        <motion.span
          className="absolute -top-1 -right-1 min-w-[24px] h-6 px-1.5
                     rounded-full bg-[#3B82F6] border-2 border-white
                     flex items-center justify-center
                     text-white text-[11px] font-extrabold tabular-nums shadow-md"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          ✉️ {unreadCount}
        </motion.span>
      )}
    </motion.button>
  );
}
