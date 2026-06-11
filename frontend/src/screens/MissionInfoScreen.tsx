// 미션 정보 화면 — 진행 화면(이동/실행/우편함) 진입 전에 보여주는 상세.
// 큰 이미지 + 제목 + 메타 3칩(카테고리·시간대·보상) + 설명 + 호기심 + NPC + "체험하기" CTA.
//
// 진행 화면 자체는 안 건드림 — onStart() 한 번 호출하면 App.tsx 가 mode 별로 분기.

import type { Mission } from "../data/missions";
import { infoCopyFor } from "../data/missionCopy";
import {
  getMissionGroup,
  missionGroupMeta,
} from "../data/missionCategories";
import {
  GANGHWA_ID,
  HANSEOL_IMAGE,
  HANSEOL_MISSION_LINES,
  HANSEOL_NAME,
} from "../data/ganghwaStory";

type Props = {
  region: string;
  residenceId: string;
  mission: Mission;
  onBack: () => void;
  onStart: () => void;
};

// "낮" 내부 키 → "점심" UI 라벨 (BottomNav/TimeOfDayTabs와 동일 규칙)
const TIME_LABEL = { 아침: "아침", 낮: "점심", 저녁: "저녁" } as const;
const TIME_EMOJI = { 아침: "🌅", 낮: "☀️", 저녁: "🌙" } as const;

export default function MissionInfoScreen({
  region,
  residenceId,
  mission,
  onBack,
  onStart,
}: Props) {
  // 한설 한마디 — 강화도 + 메인 9 미션에만 적용 (line 정의된 미션 = 메인 9)
  const hanseolLine =
    residenceId === GANGHWA_ID ? HANSEOL_MISSION_LINES[mission.id] : undefined;
  // 큰 이미지 폴백 체인: npcScene.src → 카테고리 그룹 일러스트
  const group = getMissionGroup(mission);
  const heroImage = mission.npcScene?.src ?? missionGroupMeta[group].bg;
  const groupLabel = missionGroupMeta[group].title;

  // 세 번째 칩 — 시간대 우선, 없으면 tier 폴백
  const thirdChip = mission.timeOfDay
    ? {
        label: "시간대",
        value: `${TIME_EMOJI[mission.timeOfDay]} ${TIME_LABEL[mission.timeOfDay]}`,
      }
    : mission.tier === "bonus"
      ? { label: "분류", value: "✨ 보너스" }
      : { label: "분류", value: "메인 미션" };

  const { description, curiosity } = infoCopyFor(mission);

  return (
    <div
      className="relative bg-cream overflow-y-auto"
      style={{ height: "calc(100dvh - var(--content-bottom))" }}
    >
      {/* ===== 상단 이미지 헤더 ===== */}
      <header className="relative h-[260px] w-full overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/60"
        />
        <div className="relative h-full px-5 pt-12 pb-20 flex flex-col">
          <button
            type="button"
            onClick={onBack}
            aria-label="미션 목록으로"
            className="w-9 h-9 rounded-full bg-white/25 backdrop-blur
                       flex items-center justify-center text-white shrink-0
                       transition active:scale-95"
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
          <div className="mt-auto">
            <p
              className="text-white/85 text-[12px] font-bold leading-none mb-1.5
                         [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]"
            >
              {region}
            </p>
            <h1 className="text-white text-[24px] font-extrabold leading-[1.25] drop-shadow-sm">
              <span className="mr-1.5">{mission.icon}</span>
              {mission.title}
            </h1>
          </div>
        </div>
      </header>

      {/* ===== 콘텐츠 패널 — 이미지 위로 둥근 모서리로 살짝 올라옴 ===== */}
      <div className="relative -mt-5 rounded-t-3xl bg-cream pt-5 pb-32">
        {/* 3-칩 */}
        <div className="px-5 grid grid-cols-3 gap-2">
          <InfoChip label="카테고리" value={groupLabel} />
          <InfoChip label={thirdChip.label} value={thirdChip.value} />
          <InfoChip label="보상" value={`+${mission.reward}점`} />
        </div>

        {/* 설명 */}
        {description && (
          <Section title="설명">
            <p className="text-ink text-[14px] leading-relaxed">
              {description}
            </p>
          </Section>
        )}

        {/* 호기심 */}
        <Section title="호기심">
          <p className="text-ink text-[15px] font-bold leading-relaxed">
            "{curiosity}"
          </p>
        </Section>

        {/* 한설의 한마디 — 강화 + 메인 9 미션만 */}
        {hanseolLine && (
          <Section title="한설의 한마디">
            <div className="flex items-start gap-3 rounded-2xl bg-primary-50/60 border border-primary/15 p-3">
              <span
                aria-hidden
                className="w-10 h-10 rounded-full bg-cover bg-center shrink-0
                           border border-white shadow-soft"
                style={{ backgroundImage: `url(${HANSEOL_IMAGE})` }}
              />
              <div className="min-w-0">
                <p className="text-ink-soft text-[10.5px] font-extrabold tracking-[0.14em] uppercase">
                  {HANSEOL_NAME}
                </p>
                <p className="mt-0.5 text-ink text-[13.5px] leading-relaxed">
                  {hanseolLine}
                </p>
              </div>
            </div>
          </Section>
        )}

        {/* 만날 사람 */}
        {mission.npc && (
          <Section title="만날 사람">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="w-12 h-12 rounded-full bg-white border border-cream-200
                           flex items-center justify-center text-[24px] shadow-soft"
              >
                {mission.npc.emoji}
              </span>
              <p className="text-ink text-[15px] font-extrabold">
                {mission.npc.name}
              </p>
            </div>
          </Section>
        )}
      </div>

      {/* ===== "체험하기" CTA — 뷰포트 하단(BottomNav 위) 고정 ===== */}
      <div
        className="fixed left-1/2 -translate-x-1/2 w-full max-w-[420px]
                   px-5 pointer-events-none z-30"
        style={{ bottom: "calc(var(--content-bottom) + 12px)" }}
      >
        <button
          type="button"
          onClick={onStart}
          className="pointer-events-auto w-full h-14 rounded-full bg-primary text-white
                     text-[15px] font-extrabold
                     shadow-[0_8px_20px_-4px_rgba(255,112,67,0.6)]
                     flex items-center justify-center gap-2
                     transition active:scale-[0.98]"
        >
          체험하기
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-cream-200 bg-white px-3 py-2.5 text-center">
      <p className="text-[10px] font-extrabold text-ink-mute uppercase tracking-[0.14em]">
        {label}
      </p>
      <p className="mt-1 text-ink text-[13px] font-extrabold leading-tight">
        {value}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-5 pt-6">
      <p className="text-[10px] font-extrabold text-ink-mute uppercase tracking-[0.18em]">
        {title}
      </p>
      <div className="mt-1.5">{children}</div>
    </section>
  );
}
