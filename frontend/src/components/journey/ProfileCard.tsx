// '나의 여정' 프로필 헤더 — 인스타 프로필 상단 톤
// 카드 박스 없이 페이지 bg에 자연 흡수. 하단 hairline으로 본문과 구분.

import { motion } from "framer-motion";
import type { LifeStyleType } from "../../data/residences";
import {
  envMeta,
  stanceMeta,
  type LifestyleProfile,
} from "../../data/lifestyle";

type Props = {
  nickname: string;
  lifestyle: LifeStyleType | null; // 호환용 (사용 안 함)
  profile?: LifestyleProfile;
  homeRegion: string;
  onOpenSettings: () => void;
};

export default function ProfileCard({
  nickname,
  profile,
  homeRegion,
  onOpenSettings,
}: Props) {
  const stanceM = profile ? stanceMeta[profile.stance] : null;
  const envM = profile ? envMeta[profile.env] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-5 pb-4 border-b border-cream-200 flex items-center gap-4"
    >
      {/* 좌측 — 큰 원형 아바타 */}
      <div
        className="w-16 h-16 rounded-full bg-gradient-to-br from-nature-50 to-primary-50
                   border border-nature-200 flex items-center justify-center text-[28px] shrink-0
                   shadow-soft"
        aria-hidden
      >
        {stanceM?.emoji ?? "🌱"}
      </div>

      {/* 중간 — 닉네임 / 자세 / 본 지역 + 환경 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h2 className="text-ink text-[20px] font-extrabold leading-tight truncate">
            {nickname}
          </h2>
          {stanceM && (
            <span
              className="px-1.5 py-0.5 rounded-full bg-nature-50 text-nature-600
                         text-[10px] font-extrabold whitespace-nowrap"
            >
              {stanceM.name}
            </span>
          )}
        </div>
        <p className="mt-1 text-ink-soft text-[12px] truncate">
          <span aria-hidden>📍</span> 본 지역{" "}
          <span className="text-ink font-bold">{homeRegion}</span>
          {envM && (
            <span className="text-ink-mute">
              {" "}· <span aria-hidden>{envM.emoji}</span> {envM.blurb}
            </span>
          )}
        </p>
      </div>

      {/* 우측 — 톱니바퀴 */}
      <button
        type="button"
        onClick={onOpenSettings}
        aria-label="설정"
        className="w-9 h-9 rounded-full text-ink-soft text-base
                   flex items-center justify-center active:scale-95 transition shrink-0
                   hover:bg-cream-100"
      >
        ⚙️
      </button>
    </motion.div>
  );
}
