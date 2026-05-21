// 설정 화면 (스텁) — 프로필/유형/본 지역 재확인 + 데모 리셋

import type { LifeStyleType } from "./../data/residences";
import { lifestyleMeta } from "../data/quiz";

type Props = {
  nickname: string;
  email?: string;
  lifestyle: LifeStyleType | null;
  homeRegion: string;
  onBack: () => void;
  onReset?: () => void;
};

export default function SettingsScreen({
  nickname,
  email,
  lifestyle,
  homeRegion,
  onBack,
  onReset,
}: Props) {
  const meta = lifestyle ? lifestyleMeta[lifestyle] : null;

  return (
    <div className="min-h-[calc(100dvh-6rem)] flex flex-col bg-cream">
      <header className="pt-12 px-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
          className="w-9 h-9 rounded-full bg-white shadow-soft
                     flex items-center justify-center text-ink"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 6 9 12l6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="text-ink text-[18px] font-extrabold">설정</h1>
      </header>

      <main className="flex-1 px-5 mt-4 pb-6 space-y-3">
        {/* 프로필 카드 */}
        <section className="bg-white border border-cream-200 rounded-2xl p-4 shadow-soft">
          <p className="text-[11px] font-bold text-ink-soft uppercase tracking-widest">
            프로필
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-nature-50 to-primary-50
                            border border-nature-200 flex items-center justify-center text-3xl">
              {meta?.emoji ?? "🌱"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-ink text-[16px] font-extrabold">{nickname}</p>
              {email && (
                <p className="text-ink-soft text-[12px] truncate">{email}</p>
              )}
            </div>
          </div>
        </section>

        {/* 라이프스타일 유형 */}
        <section className="bg-white border border-cream-200 rounded-2xl p-4 shadow-soft">
          <p className="text-[11px] font-bold text-ink-soft uppercase tracking-widest">
            나의 라이프스타일 유형
          </p>
          {meta ? (
            <>
              <p className="mt-2 text-ink text-[18px] font-extrabold">
                {meta.emoji} {lifestyle}
              </p>
              <p className="mt-0.5 text-primary text-[12px] font-bold">
                {meta.tagline}
              </p>
              <p className="mt-2 text-ink-soft text-[13px] leading-relaxed">
                {meta.description}
              </p>
            </>
          ) : (
            <p className="mt-2 text-ink-soft text-[13px]">
              아직 진단 결과가 없어요.
            </p>
          )}
        </section>

        {/* 본 지역 */}
        <section className="bg-white border border-cream-200 rounded-2xl p-4 shadow-soft">
          <p className="text-[11px] font-bold text-ink-soft uppercase tracking-widest">
            현재 본 지역
          </p>
          <p className="mt-2 text-ink text-[16px] font-extrabold">
            📍 {homeRegion}
          </p>
          <p className="mt-1 text-ink-mute text-[11px]">
            이주 결정 시 본 지역이 새로운 곳으로 바뀝니다.
          </p>
        </section>

        {/* 데모 리셋 */}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="w-full py-3 rounded-2xl bg-white border border-cream-200
                       text-ink-soft text-[13px] font-bold"
          >
            온보딩부터 다시 시작 (데모)
          </button>
        )}

        <p className="text-center text-[11px] text-ink-mute pt-2">
          청풍 데모 v0.1
        </p>
      </main>
    </div>
  );
}
