// 레지던스 상세 — 사진 갤러리(placeholder), 프로그램 상세, 미니맵, 매칭 이유, 주변 인프라, CTA
// 실제 결제/예약 없음 — 신청/문의는 외부 링크로만 처리

import { motion } from "framer-motion";
import KoreaMap from "../components/KoreaMap";
import {
  matchScore,
  type LifeStyleType,
  type Residence,
} from "../data/residences";
import { lifestyleMeta } from "../data/quiz";
import type { RegionRecord } from "../data/journey";

type Props = {
  residence: Residence;
  lifestyle: LifeStyleType | null;
  // 해당 지역에서 사용자가 확인한 인프라 데이터 (옵션)
  record?: RegionRecord;
  onBack: () => void;
};

export default function ResidenceDetailScreen({
  residence,
  lifestyle,
  record,
  onBack,
}: Props) {
  const match = matchScore(lifestyle, residence);
  const meta = lifestyle ? lifestyleMeta[lifestyle] : null;
  // 미션 기반 인프라 인사이트
  const completedIds = new Set(record?.completedMissionIds ?? []);
  const hasHospital = completedIds.has("hospital");
  const hasTransit = completedIds.has("transit");
  const hasMarket = completedIds.has("market") || completedIds.has("cost");

  return (
    <div className="min-h-[calc(100dvh-6rem)] flex flex-col bg-cream">
      <header className="absolute top-0 left-0 right-0 z-20 pt-12 px-5 flex items-center gap-3
                         bg-gradient-to-b from-black/30 to-transparent">
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
        <h1 className="text-white text-[15px] font-extrabold truncate drop-shadow">
          {residence.name}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-32">
        {/* 사진 갤러리 (placeholder — 그라데이션 + 큰 이모지) */}
        <section>
          <PhotoGallery emoji={residence.themeEmoji} />
        </section>

        {/* 핵심 정보 */}
        <section className="px-5 mt-4">
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-full bg-primary-50 text-primary
                         text-[11px] font-extrabold"
            >
              {lifestyle ? `${lifestyle}과 ${match}%` : `매칭 ${match}%`}
            </span>
            {residence.hasSupport && (
              <span className="px-2 py-0.5 rounded-full bg-nature-500 text-white
                               text-[10px] font-extrabold">
                정부 지원금
              </span>
            )}
            <span className="ml-auto text-ink-mute text-[11px] font-bold">
              📍 {residence.region}
            </span>
          </div>
          <h2 className="mt-2 text-ink text-[20px] font-extrabold leading-tight">
            {residence.name}
          </h2>
          {residence.blurb && (
            <p className="mt-1 text-ink-soft text-[13px] leading-relaxed">
              {residence.blurb}
            </p>
          )}
        </section>

        {/* 프로그램 상세 */}
        <section className="px-5 mt-4">
          <div className="bg-white border border-cream-200 rounded-2xl p-3.5 shadow-soft">
            <p className="text-[11px] font-bold text-ink-soft uppercase tracking-widest mb-2">
              프로그램 상세
            </p>
            <dl className="space-y-1.5 text-[13px]">
              <Row label="기간">{residence.duration}</Row>
              <Row label="정원">{residence.capacity ?? "—"}명</Row>
              <Row label="비용">
                {residence.price !== undefined
                  ? `월 ${residence.price}만원~`
                  : "—"}
              </Row>
              <Row label="지원금">
                {residence.hasSupport ? "정부 지원금 대상" : "해당 없음"}
              </Row>
              {residence.provides && residence.provides.length > 0 && (
                <Row label="제공">
                  <span className="flex flex-wrap gap-1 justify-end">
                    {residence.provides.map((p) => (
                      <span
                        key={p}
                        className="px-1.5 py-0.5 rounded-md bg-cream-100 text-ink text-[10px] font-bold"
                      >
                        {p}
                      </span>
                    ))}
                  </span>
                </Row>
              )}
            </dl>
          </div>
        </section>

        {/* 위치 미니맵 */}
        <section className="px-5 mt-4">
          <p className="text-[11px] font-bold text-ink-soft uppercase tracking-widest mb-2">
            위치
          </p>
          <div className="bg-white border border-cream-200 rounded-2xl p-3 shadow-soft">
            <div className="mx-auto w-[200px]">
              <KoreaMap>
                <div
                  className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center"
                  style={{
                    left: `${residence.xPct}%`,
                    top: `${residence.yPct}%`,
                  }}
                >
                  <span className="px-2 py-0.5 rounded-md bg-primary text-white text-[10px] font-extrabold shadow-soft">
                    {residence.region}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow-soft mt-0.5" />
                </div>
              </KoreaMap>
            </div>
          </div>
        </section>

        {/* 매칭 이유 */}
        <section className="px-5 mt-4">
          <p className="text-[11px] font-bold text-ink-soft uppercase tracking-widest mb-2">
            왜 추천받았나요?
          </p>
          <div className="bg-gradient-to-br from-primary-50 to-nature-50
                          border border-primary-200 rounded-2xl p-3.5">
            <p className="text-ink text-[14px] leading-relaxed">
              {residence.matchReason}
            </p>
            {meta && (
              <p className="mt-2 text-ink-soft text-[12px]">
                <span className="text-primary font-bold">{lifestyle}</span> ·{" "}
                {meta.tagline}
              </p>
            )}
          </div>
        </section>

        {/* 주변 인프라 — 미션에서 확인한 데이터 반영 */}
        <section className="px-5 mt-4">
          <p className="text-[11px] font-bold text-ink-soft uppercase tracking-widest mb-2">
            주변 인프라
          </p>
          <div className="bg-white border border-cream-200 rounded-2xl p-3.5 shadow-soft space-y-1.5">
            <Infra
              icon="🏥"
              label="병원"
              detail={hasHospital ? "직접 걸어가 확인 완료" : "도보 12분 거리 종합병원"}
              checked={hasHospital}
            />
            <Infra
              icon="🚌"
              label="교통"
              detail={hasTransit ? "버스 배차 직접 확인" : "버스 평균 배차 35분"}
              checked={hasTransit}
            />
            <Infra
              icon="🛒"
              label="마트·시장"
              detail={hasMarket ? "물가 직접 체험" : "도보 10분 내 마트와 전통시장"}
              checked={hasMarket}
            />
          </div>
        </section>
      </main>

      {/* 하단 고정 CTA */}
      <footer
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px]
                   px-5 pb-6 pt-3 bg-white/95 backdrop-blur border-t border-cream-200"
      >
        <motion.a
          whileTap={{ scale: 0.99 }}
          href={residence.contactUrl ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-4 rounded-2xl bg-primary text-white text-[15px] font-extrabold
                     shadow-soft transition"
        >
          신청·문의하기 ↗
        </motion.a>
        <p className="mt-1.5 text-center text-[10px] text-ink-mute">
          실제 결제·예약은 외부 사이트에서 진행돼요.
        </p>
      </footer>
    </div>
  );
}

// =====================================================================
// 서브 컴포넌트
// =====================================================================

function PhotoGallery({ emoji }: { emoji: string }) {
  // 데모: 가로 스크롤 컨테이너에 3장 placeholder
  const tones = [
    "linear-gradient(135deg,#A8C8DE 0%,#B8D4E8 60%,#F4E5C0 100%)",
    "linear-gradient(135deg,#FFE0CC 0%,#FFF6E8 100%)",
    "linear-gradient(135deg,#A8D5A8 0%,#DDEBC8 100%)",
  ];
  return (
    <div className="flex gap-1 overflow-x-auto snap-x snap-mandatory
                    [-ms-overflow-style:none] [scrollbar-width:none]
                    [&::-webkit-scrollbar]:hidden">
      {tones.map((bg, i) => (
        <div
          key={i}
          className="shrink-0 w-full snap-center h-56 flex items-center justify-center"
          style={{ background: bg, minWidth: "100%" }}
        >
          <span className="text-7xl drop-shadow-lg" aria-hidden>
            {emoji}
          </span>
        </div>
      ))}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-ink font-bold">{children}</dd>
    </div>
  );
}

function Infra({
  icon,
  label,
  detail,
  checked,
}: {
  icon: string;
  label: string;
  detail: string;
  checked: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-base" aria-hidden>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-ink text-[13px] font-bold">{label}</p>
        <p className="text-ink-mute text-[11px]">{detail}</p>
      </div>
      {checked && (
        <span className="text-nature-600 text-[11px] font-extrabold">
          ✓ 확인됨
        </span>
      )}
    </div>
  );
}
