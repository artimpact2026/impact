// 내 정보 (마이페이지) — 정보 계층 v2
//
// 멘토 피드백 톤 정리:
//   1) HERO (존재) — 닉네임 + 페르소나 + 본 지역, 시각 punch
//   2) 가치 (누구인가) — 자세·환경·가치·풍경·힐링을 한 카드로 묶어 row UI
//   3) 활동 (흔적) — 좋아요한 청년마을 grid (다른 섹션과 시각 분리)
//
// 디자인 시스템:
//   · 섹션 사이 space-y-5
//   · 섹션 타이틀: 10px ink-mute uppercase tracking-wide
//   · 카드: bg-white rounded-2xl border-cream-200 shadow-soft
//   · 카드 안 row: divide-y divide-cream-100 + p-4

import { motion } from "framer-motion";
import {
  envMeta,
  stanceMeta,
  type LifestyleProfile,
} from "../data/lifestyle";
import type { LifeStyleType, Residence } from "../data/residences";
import type { OnboardingData } from "../data/quiz";
import { pickResidenceImage, ratings } from "../data/bookingExtras";
import type { Item } from "../data/items";
import type { SavedQuote } from "../data/quotes";
import TabLayout from "../components/TabLayout";

type Props = {
  nickname: string;
  homeRegion: string;
  lifestyle: LifeStyleType | null;
  profile?: LifestyleProfile;
  onboarding?: OnboardingData;
  likedResidences: Residence[];
  // 수집한 기념품 — 미션 완료 시 획득
  acquiredItems?: Item[];
  // 기억한 말들 — 사용자가 직접 저장한 NPC 인용구
  savedQuotes?: SavedQuote[];
  onOpenSettings: () => void;
  onSelectResidence: (r: Residence) => void;
};

export default function ProfileScreen({
  nickname,
  homeRegion,
  profile,
  onboarding,
  likedResidences,
  acquiredItems = [],
  savedQuotes = [],
  onOpenSettings,
  onSelectResidence,
}: Props) {
  const stanceM = profile ? stanceMeta[profile.stance] : null;
  const envM = profile ? envMeta[profile.env] : null;

  return (
    <TabLayout
      preLabel="Profile"
      title="내 정보"
      rightActions={
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="설정"
          className="w-9 h-9 rounded-full bg-white border border-cream-200
                     flex items-center justify-center text-[16px] shadow-soft
                     active:scale-95 transition"
        >
          ⚙️
        </button>
      }
    >
      <div className="px-4 pb-10 space-y-5">
        {/* ① HERO — 존재 */}
        <HeroSection
          nickname={nickname}
          homeRegion={homeRegion}
          stance={stanceM}
          env={envM}
        />

        {/* ② 가치 — 누구인가 */}
        {(stanceM || envM || onboarding) && (
          <section>
            <div className="px-1 mb-2">
              <p className="text-[10.5px] font-extrabold text-ink-mute uppercase tracking-[0.16em]">
                Values
              </p>
              <h2 className="mt-0.5 text-ink text-[15px] font-extrabold leading-tight">
                나의 가치
              </h2>
            </div>
            <ValuesCard
              stance={stanceM}
              env={envM}
              onboarding={onboarding}
            />
          </section>
        )}

        {/* ③ 찜한 마을 — 사용자 취향의 직접 표현. '나의 가치' 바로 아래에 배치. */}
        <section>
          <div className="flex items-end justify-between px-1 mb-2">
            <div>
              <p className="text-[10.5px] font-extrabold text-ink-mute uppercase tracking-[0.16em]">
                Wishlist
              </p>
              <h2 className="mt-0.5 text-ink text-[15px] font-extrabold leading-tight">
                내가 찜한 청년마을
              </h2>
            </div>
            {likedResidences.length > 0 && (
              <span className="text-[11px] font-extrabold text-primary tabular-nums">
                ❤️ {likedResidences.length}
              </span>
            )}
          </div>
          <LikedResidencesRail
            residences={likedResidences}
            onSelect={onSelectResidence}
          />
        </section>

        {/* ④ 수집한 기념품 — 미션 완료로 모은 작은 흔적들 */}
        <section>
          <div className="flex items-end justify-between px-1 mb-2">
            <div>
              <p className="text-[10.5px] font-extrabold text-ink-mute uppercase tracking-[0.16em]">
                Souvenirs
              </p>
              <h2 className="mt-0.5 text-ink text-[15px] font-extrabold leading-tight">
                수집한 기념품
              </h2>
            </div>
            <span className="text-[11px] font-extrabold text-primary tabular-nums">
              ✨ {acquiredItems.length}
            </span>
          </div>
          <SouvenirGrid items={acquiredItems} />
        </section>

        {/* ⑤ 기억한 말들 — 사용자가 직접 고른 인용구 */}
        <section>
          <div className="flex items-end justify-between px-1 mb-2">
            <div>
              <p className="text-[10.5px] font-extrabold text-ink-mute uppercase tracking-[0.16em]">
                Memorized
              </p>
              <h2 className="mt-0.5 text-ink text-[15px] font-extrabold leading-tight">
                기억한 말들
              </h2>
            </div>
            <span className="text-[11px] font-extrabold text-primary tabular-nums">
              🔖 {savedQuotes.length}
            </span>
          </div>
          <QuoteList quotes={savedQuotes} />
        </section>
      </div>
    </TabLayout>
  );
}

// =====================================================================
// HeroSection — 시각 punch
// =====================================================================

function HeroSection({
  nickname,
  homeRegion,
  stance,
  env,
}: {
  nickname: string;
  homeRegion: string;
  stance: ReturnType<typeof getStanceM> | null;
  env: ReturnType<typeof getEnvM> | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-3xl overflow-hidden p-5 pt-6
                 bg-gradient-to-br from-[#F4EADC] via-[#FBF6EC] to-[#EDF2EA]
                 border border-cream-200"
    >
      {/* 우상단 큰 이모지 — 옅게 배경 장식 */}
      <div
        aria-hidden
        className="absolute -top-4 -right-3 text-[120px] leading-none select-none pointer-events-none"
        style={{ opacity: 0.18 }}
      >
        {stance?.emoji ?? "🌱"}
      </div>

      <div className="relative">
        {/* 큰 이모지 */}
        <p className="text-[56px] leading-none" aria-hidden>
          {stance?.emoji ?? "🌱"}
        </p>
        {/* 닉네임 */}
        <h2 className="mt-3 text-ink text-[26px] font-extrabold leading-tight">
          {nickname}
        </h2>
        {/* 페르소나 칩 2개 */}
        {(stance || env) && (
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {stance && (
              <span className="px-2.5 py-1 rounded-full bg-primary text-white text-[12px] font-extrabold shadow-soft">
                {stance.name}
              </span>
            )}
            {env && (
              <span className="px-2.5 py-1 rounded-full bg-white border border-cream-200 text-ink-soft text-[12px] font-bold">
                <span aria-hidden className="mr-0.5">
                  {env.emoji}
                </span>
                {env.name}
              </span>
            )}
          </div>
        )}
        {/* 본 지역 */}
        <p className="mt-3 text-ink-soft text-[12.5px]">
          <span aria-hidden>📍</span> 본 지역{" "}
          <span className="text-ink font-bold">{homeRegion}</span>
        </p>
      </div>
    </motion.div>
  );
}

// =====================================================================
// ValuesCard — 자세 / 환경 / 가치 / 풍경 / 힐링 통합 row UI
// =====================================================================

type StanceM = ReturnType<typeof getStanceM>;
type EnvM = ReturnType<typeof getEnvM>;

// 헬퍼 — lifestyle.ts 의 stanceMeta/envMeta 값을 타입으로 추출
function getStanceM() {
  return stanceMeta.alone_make; // 임의 사용 (타입 유추용)
}
function getEnvM() {
  return envMeta.mountain;
}

function ValuesCard({
  stance,
  env,
  onboarding,
}: {
  stance: StanceM | null;
  env: EnvM | null;
  onboarding?: OnboardingData;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="bg-white rounded-2xl border border-cream-200 shadow-soft
                 divide-y divide-cream-100"
    >
      {stance && (
        <ValueRow
          icon={stance.emoji}
          label="자세"
          value={stance.name}
          description={stance.tagline}
        />
      )}
      {env && (
        <ValueRow
          icon={env.emoji}
          label="어울리는 환경"
          value={env.name}
          description={env.description}
        />
      )}
      {onboarding?.values && onboarding.values.length > 0 && (
        <ValueRow icon="💎" label="소중한 가치" chips={onboarding.values} />
      )}
      {onboarding?.dayScene && (
        <ValueRow
          icon="🌅"
          label="풍경의 하루"
          description={onboarding.dayScene}
        />
      )}
      {onboarding?.healing && (
        <ValueRow icon="🌙" label="힐링" description={onboarding.healing} />
      )}
    </motion.div>
  );
}

// =====================================================================
// ValueRow — 통일된 row 컴포넌트
// =====================================================================

function ValueRow({
  icon,
  label,
  value,
  description,
  chips,
}: {
  icon: string;
  label: string;
  value?: string;
  description?: string;
  chips?: string[];
}) {
  return (
    <div className="p-4 flex items-start gap-3">
      <div
        className="w-9 h-9 rounded-xl bg-cream-50 border border-cream-200
                   flex items-center justify-center text-[18px] shrink-0"
        aria-hidden
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-ink-mute uppercase tracking-[0.14em]">
          {label}
        </p>
        {value && (
          <p className="mt-0.5 text-ink text-[15px] font-extrabold">{value}</p>
        )}
        {description && (
          <p className="mt-1 text-ink-soft text-[13px] leading-relaxed">
            {description}
          </p>
        )}
        {chips && chips.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <span
                key={c}
                className="px-2.5 py-1 rounded-full bg-nature-50 border border-nature-200
                           text-nature-600 text-[11.5px] font-bold"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// LikedResidencesRail — 가로 스크롤 카드 (앨범 넘기듯 훑어보기)
// =====================================================================
//
// 디자인:
//   · 카드 너비 168px, 4:5 사진 + 정보 영역
//   · 좌측 가장자리(px-4)에서 시작, 우측 가장자리 너머로도 카드가 보이도록 트레일 -mr-4
//   · 빨간 하트는 카드 상단 우측에 시각적 punch — bg-white + 빨강 ❤️
//   · 사진 아래 그라데이션으로 지역명 가독성 보장

function LikedResidencesRail({
  residences,
  onSelect,
}: {
  residences: Residence[];
  onSelect: (r: Residence) => void;
}) {
  if (residences.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-cream-200 shadow-soft
                   p-6 text-center"
      >
        <p className="text-3xl" aria-hidden>
          💛
        </p>
        <p className="mt-2 text-ink-soft text-[12.5px] leading-relaxed">
          아직 찜한 청년마을이 없어요.
          <br />
          발견 탭에서 마음에 드는 곳에 ❤️ 를 눌러보세요.
        </p>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      // -mx-4 + px-4 → 부모 px-4 의 가장자리 효과 무효화 + 카드가 가장자리 끝까지 닿게
      className="-mx-4 px-4 pb-1 flex gap-3 overflow-x-auto no-scrollbar
                 snap-x snap-mandatory"
      role="list"
      aria-label="찜한 청년마을 가로 목록"
    >
      {residences.map((r, i) => {
        const rating = ratings[r.id];
        return (
          <motion.button
            key={r.id}
            type="button"
            role="listitem"
            onClick={() => onSelect(r)}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
            whileTap={{ scale: 0.98 }}
            className="shrink-0 w-[168px] snap-start
                       bg-white rounded-3xl border border-cream-200 shadow-soft
                       overflow-hidden text-left
                       active:bg-cream-50 transition"
          >
            {/* === 사진 영역 (4:5) — 하단 그라데이션 + 좌하단 지역명 === */}
            <div className="relative aspect-[4/5] bg-cream-200">
              <img
                src={pickResidenceImage(r)}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
              {/* 어둠 그라데이션 — 하단 텍스트 가독성 */}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[55%]
                           bg-gradient-to-t from-black/65 via-black/20 to-transparent
                           pointer-events-none"
              />

              {/* 우상단 하트 — 시각적 punch (bg-white + 빨강 이모지) */}
              <span
                aria-label="찜한 마을"
                className="absolute top-2.5 right-2.5
                           w-9 h-9 rounded-full bg-white
                           flex items-center justify-center text-[16px]
                           shadow-[0_4px_12px_-2px_rgba(220,40,60,0.35)]
                           ring-2 ring-white/80"
              >
                ❤️
              </span>

              {/* 좌하단 지역명 — 사진 위 흰 글씨 */}
              <div className="absolute left-3 right-3 bottom-2.5 text-white">
                <p
                  className="text-[15px] font-extrabold leading-tight truncate
                             drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
                >
                  <span aria-hidden className="mr-1">
                    {r.themeEmoji}
                  </span>
                  {r.region}
                </p>
              </div>
            </div>

            {/* === 정보 영역 === */}
            <div className="px-3 py-2.5">
              <p className="text-ink-soft text-[11.5px] font-bold truncate">
                {r.name}
              </p>
              <div className="mt-1 flex items-center justify-between">
                {rating ? (
                  <p className="text-ink text-[11px] font-extrabold">
                    ⭐ {rating.toFixed(1)}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-primary text-[11px] font-extrabold">
                  보기 →
                </span>
              </div>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

// =====================================================================
// SouvenirGrid — 수집한 기념품 그리드
//   · 미수집 시: "아직 모은 기념품이 없어요" 빈 상태
//   · 수집 시: 3열 grid, 이모지 + 짧은 이름 + 어디서
//   · 폴라로이드 톤 — 작은 카드들
// =====================================================================

// =====================================================================
// QuoteList — 사용자가 직접 저장한 NPC 발언 컬렉션
//   · 미저장 시: 안내 빈 상태
//   · 저장 시: 인용 카드 세로 리스트 — 발언자 + 큰 따옴표 + 어디 미션인지 작은 메타
// =====================================================================

function QuoteList({ quotes }: { quotes: SavedQuote[] }) {
  if (quotes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-cream-200 shadow-soft
                   p-6 text-center"
      >
        <p className="text-3xl" aria-hidden>
          🔖
        </p>
        <p className="mt-2 text-ink-soft text-[12.5px] leading-relaxed">
          마음에 닿는 말을 만나면
          <br />
          말풍선 옆 🔖 를 눌러 기억해 보세요.
        </p>
      </motion.div>
    );
  }
  return (
    <div className="space-y-2">
      {quotes.map((q, i) => (
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 + i * 0.04 }}
          className="bg-white rounded-2xl border border-cream-200 shadow-soft
                     px-4 py-3.5 relative overflow-hidden"
        >
          {/* 좌측 컬러 줄 — 카테고리 시각 표시 */}
          <span
            aria-hidden
            className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
          />
          {/* 인용구 큰따옴표 + 본문 */}
          <p className="text-ink-soft text-[13px] leading-relaxed italic pl-2">
            <span aria-hidden className="text-primary text-[18px] font-serif mr-0.5">
              "
            </span>
            {q.text}
            <span aria-hidden className="text-primary text-[18px] font-serif ml-0.5">
              "
            </span>
          </p>
          {/* 메타 — 발언자 + 마을 */}
          <p className="mt-2 text-ink-mute text-[10.5px] pl-2">
            <span aria-hidden className="mr-1">
              {q.speakerEmoji}
            </span>
            <span className="font-bold">{q.speaker}</span>
            <span className="opacity-50 mx-1.5">·</span>
            <span>{q.residenceRegion}</span>
            <span className="opacity-50 mx-1.5">·</span>
            <span>{q.missionTitle}</span>
          </p>
        </motion.div>
      ))}
    </div>
  );
}

function SouvenirGrid({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-cream-200 shadow-soft
                   p-6 text-center"
      >
        <p className="text-3xl" aria-hidden>
          📦
        </p>
        <p className="mt-2 text-ink-soft text-[12.5px] leading-relaxed">
          아직 모은 기념품이 없어요.
          <br />
          미션을 마치면 작은 흔적이 하나씩 쌓여요.
        </p>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="grid grid-cols-3 gap-2"
    >
      {items.map((it, i) => (
        <motion.div
          key={it.id}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.15 + i * 0.04 }}
          className="bg-white rounded-2xl border border-cream-200 shadow-soft
                     overflow-hidden"
        >
          {/* 이모지 영역 */}
          <div
            className="h-[80px] flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, #FFF5E6 0%, #FFE7D1 100%)",
            }}
          >
            <span className="text-[40px] leading-none select-none" aria-hidden>
              {it.emoji}
            </span>
          </div>
          {/* 이름 */}
          <div className="px-2 py-2">
            <p className="text-ink text-[11.5px] font-extrabold leading-tight truncate">
              {it.name}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
