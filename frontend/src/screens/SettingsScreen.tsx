// 설정 화면 — 프로필·본 지역 확인 + 로그아웃 / 탈퇴
//
// 옛 "나의 유형" 섹션은 내 정보 탭에서 자세히 보이므로 여기선 생략.
// 데모 리셋 버튼도 제거 — 운영 톤에 맞춰 로그아웃·탈퇴로 정리.

import type { LifeStyleType } from "./../data/residences";
import type { LifestyleProfile } from "../data/lifestyle";

type Props = {
  nickname: string;
  email?: string;
  lifestyle: LifeStyleType | null;
  profile?: LifestyleProfile;
  homeRegion: string;
  onBack: () => void;
  // 둘 다 데모에선 동일하게 전체 초기화. 운영 시점에 의미 분리.
  onLogout: () => void;
  onDeleteAccount: () => void;
  // 취향 설문 다시 — 옛 내 정보 탭의 액션을 설정 안으로 이동.
  onResetOnboarding: () => void;
};

export default function SettingsScreen({
  nickname,
  email,
  homeRegion,
  onBack,
  onLogout,
  onDeleteAccount,
  onResetOnboarding,
}: Props) {
  return (
    <div className="h-[calc(100dvh-6rem)] flex flex-col overflow-y-auto bg-cream">
      <header className="pt-12 px-5 flex items-center gap-3 shrink-0">
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

      <main className="px-5 mt-4 pb-10 space-y-3">
        {/* 프로필 카드 */}
        <section className="bg-white border border-cream-200 rounded-2xl p-4 shadow-soft">
          <p className="text-[11px] font-bold text-ink-soft uppercase tracking-widest">
            계정
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-nature-50 to-primary-50
                         border border-nature-200 flex items-center justify-center text-2xl"
              aria-hidden
            >
              🌱
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-ink text-[16px] font-extrabold">{nickname}</p>
              {email && (
                <p className="text-ink-soft text-[12px] truncate">{email}</p>
              )}
            </div>
          </div>
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

        {/* 프로필 관리 / 로그아웃 / 탈퇴 */}
        <section className="bg-white border border-cream-200 rounded-2xl overflow-hidden shadow-soft">
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "취향 설문을 다시 받으시겠어요? 다녀온 지역과 좋아요는 모두 초기화돼요."
                )
              ) {
                onResetOnboarding();
              }
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between
                       text-left border-b border-cream-100 active:bg-cream-50 transition"
          >
            <span className="flex items-center gap-2.5">
              <span aria-hidden>↻</span>
              <span className="text-ink text-[14px] font-bold">취향 설문 다시 하기</span>
            </span>
            <span aria-hidden className="text-ink-mute text-[14px]">
              ›
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("정말 로그아웃할까요?")) onLogout();
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between
                       text-left border-b border-cream-100 active:bg-cream-50 transition"
          >
            <span className="flex items-center gap-2.5">
              <span aria-hidden>↩</span>
              <span className="text-ink text-[14px] font-bold">로그아웃하기</span>
            </span>
            <span aria-hidden className="text-ink-mute text-[14px]">
              ›
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "정말 탈퇴할까요? 모든 진행 데이터와 편지·좋아요 기록이 사라져요."
                )
              ) {
                onDeleteAccount();
              }
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between
                       text-left active:bg-cream-50 transition"
          >
            <span className="flex items-center gap-2.5">
              <span aria-hidden>⊖</span>
              <span className="text-[#C04F4F] text-[14px] font-bold">탈퇴하기</span>
            </span>
            <span aria-hidden className="text-ink-mute text-[14px]">
              ›
            </span>
          </button>
        </section>

        <p className="text-center text-[11px] text-ink-mute pt-2">
          청풍 데모 v0.1
        </p>
      </main>
    </div>
  );
}
