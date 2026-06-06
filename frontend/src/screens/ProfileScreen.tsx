// 내 정보 탭 — "나를 돌아보는 공간"
//
// 멘토 피드백 + 사용자 요청에 따라 1+3+5 구성으로:
//   1) 정체성: ProfileCard + 자세·환경 상세 + 온보딩 답변 칩(가치/풍경/힐링)
//   3) 좋아요한 청년마을: bookingLiked 리스트
//   5) 설정·계정: 일반 설정 진입 + 온보딩 다시 (전체 리셋)
//
// 2) 누적 한눈에는 의도적으로 빠짐 — 여정 탭과 역할 중복

import { motion } from "framer-motion";
import ProfileCard from "../components/journey/ProfileCard";
import {
  envMeta,
  stanceMeta,
  type LifestyleProfile,
} from "../data/lifestyle";
import type { LifeStyleType, Residence } from "../data/residences";
import type { OnboardingData } from "../data/quiz";

type Props = {
  nickname: string;
  homeRegion: string;
  lifestyle: LifeStyleType | null;
  profile?: LifestyleProfile;
  onboarding?: OnboardingData;
  likedResidences: Residence[];
  onOpenSettings: () => void;
  onSelectResidence: (r: Residence) => void;
};

export default function ProfileScreen({
  nickname,
  homeRegion,
  lifestyle,
  profile,
  onboarding,
  likedResidences,
  onOpenSettings,
  onSelectResidence,
}: Props) {
  const stanceM = profile ? stanceMeta[profile.stance] : null;
  const envM = profile ? envMeta[profile.env] : null;

  return (
    <div className="relative h-[calc(100dvh-6rem)] overflow-y-auto bg-cream">
      {/* 페이지 헤더 — Travel/Booking 같은 톤 */}
      <header className="px-5 pt-5 pb-1">
        <p className="text-[10px] font-bold text-ink-mute tracking-[0.18em] uppercase">
          Profile · 내 정보
        </p>
      </header>

      {/* ① 정체성 카드 — 기존 ProfileCard */}
      <ProfileCard
        nickname={nickname}
        lifestyle={lifestyle}
        profile={profile}
        homeRegion={homeRegion}
        onOpenSettings={onOpenSettings}
      />

      <div className="px-4 pb-10 pt-4 space-y-3">
        {/* 자세·환경 상세 — 온보딩 메인 결과 */}
        {(stanceM || envM) && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-3xl bg-white border border-cream-200 shadow-soft p-4 space-y-3"
          >
            {stanceM && (
              <div>
                <p className="text-[10.5px] font-bold text-nature-600 uppercase tracking-widest">
                  나의 자세
                </p>
                <p className="mt-0.5 text-ink text-[16px] font-extrabold">
                  <span aria-hidden className="mr-1">
                    {stanceM.emoji}
                  </span>
                  {stanceM.name}
                </p>
                <p className="mt-1 text-ink-soft text-[12.5px] leading-relaxed">
                  {stanceM.tagline}
                </p>
              </div>
            )}
            {envM && (
              <div className="pt-3 border-t border-cream-100">
                <p className="text-[10.5px] font-bold text-primary uppercase tracking-widest">
                  어울리는 환경
                </p>
                <p className="mt-0.5 text-ink text-[16px] font-extrabold">
                  <span aria-hidden className="mr-1">
                    {envM.emoji}
                  </span>
                  {envM.name}
                </p>
                <p className="mt-1 text-ink-soft text-[12.5px] leading-relaxed">
                  {envM.description}
                </p>
              </div>
            )}
          </motion.section>
        )}

        {/* 온보딩 답변 — 가치 칩 / 풍경 / 힐링 */}
        {onboarding && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.35 }}
            className="rounded-3xl bg-white border border-cream-200 shadow-soft p-4 space-y-3"
          >
            <p className="text-[10.5px] font-bold text-ink-mute uppercase tracking-widest">
              내가 골랐던 답
            </p>

            {/* 가치 칩 */}
            {onboarding.values?.length > 0 && (
              <div>
                <p className="text-[11px] text-ink-soft font-bold mb-1.5">
                  소중히 여기는 가치
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {onboarding.values.map((v) => (
                    <span
                      key={v}
                      className="px-2.5 py-1 rounded-full bg-nature-50 border border-nature-200
                                 text-nature-600 text-[11.5px] font-bold"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 풍경의 하루 */}
            {onboarding.dayScene && (
              <div>
                <p className="text-[11px] text-ink-soft font-bold mb-1">
                  어떤 풍경의 하루
                </p>
                <p className="text-ink text-[13px] leading-relaxed">
                  {onboarding.dayScene}
                </p>
              </div>
            )}

            {/* 힐링 */}
            {onboarding.healing && (
              <div>
                <p className="text-[11px] text-ink-soft font-bold mb-1">
                  나에게 힐링이란
                </p>
                <p className="text-ink text-[13px] leading-relaxed">
                  {onboarding.healing}
                </p>
              </div>
            )}
          </motion.section>
        )}

        {/* ③ 좋아요한 청년마을 */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.35 }}
          className="rounded-3xl bg-white border border-cream-200 shadow-soft p-4"
        >
          <p className="text-[10.5px] font-bold text-primary uppercase tracking-widest mb-2">
            💛 좋아요한 청년마을
          </p>
          {likedResidences.length === 0 ? (
            <p className="text-ink-soft text-[12.5px] leading-relaxed">
              아직 좋아요한 청년마을이 없어요. 발견 탭에서 마음에 드는 곳을 ❤️로 표시해보세요.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {likedResidences.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onSelectResidence(r)}
                  className="w-full flex items-center gap-3 text-left
                             rounded-2xl border border-cream-200 bg-cream-50 hover:bg-cream-100
                             px-3.5 py-3 transition active:scale-[0.99]"
                >
                  <span className="text-2xl" aria-hidden>
                    {r.themeEmoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-ink text-[14px] font-extrabold leading-tight">
                      {r.region}
                    </p>
                    <p className="mt-0.5 text-ink-mute text-[11.5px] truncate">
                      {r.name} · {r.duration}
                    </p>
                  </div>
                  <span aria-hidden className="text-ink-mute text-[16px] shrink-0">
                    ›
                  </span>
                </button>
              ))}
            </div>
          )}
        </motion.section>

{/* 설정·취향 다시 하기는 ProfileCard 우상단 ⚙️ → SettingsScreen 으로 이동 */}
      </div>
    </div>
  );
}
