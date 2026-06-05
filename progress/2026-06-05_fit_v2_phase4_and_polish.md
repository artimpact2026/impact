# 2026-06-05 — 적합도 v2 Phase 4 + 3단계 가중치 + 이주 리포트 AI 본문 + UI 다듬기

이전 푸시(`fit_score_v2_design.md` Phase 1-3까지) 이후 같은 날 추가로 들어간 작업.
네 묶음.

---

## 1. UI 다듬기 — 카드 자동 진행 / 떠나기 버튼 톤 / 하루 요약 제거

**커밋**: `1f253f8`

### 1-A. 온보딩 카드 자동 진행

세 화면(`BalanceScreen` × 2단계, `SceneScreen`, `HealingScreen`)은 카드를 누르는 순간
`onNext(value)` 가 호출되어 다음 단계로 넘어감 — 그런데도 하단에 "다음" CTA 가 있어 한 번
더 누르게 만드는 잉여 액션이었음.

`StepLayout` 에 `hideCta?: boolean` 추가, 세 화면이 `hideCta` 만 켜서 footer 통째 생략.

```diff
- ctaDisabled={!initial}
- ctaLabel="다음"
- onCta={() => initial && onNext(initial)}
+ hideCta
```

### 1-B. 홈 떠나기 버튼 톤 통일

`HomeScreen` 떠나기 버튼이 `!bg-[#E89274]` override 로 다른 주황을 쓰고 있어 다른 버튼들과
어긋남. override 제거 → `PrimaryButton` 기본 톤(`#FF7043`) 으로 통일.

### 1-C. DailySummaryScreen 제거

"강화도에서의 하루, 알차게 보냈어요!" 화면을 흐름·파일에서 모두 제거.

- 마지막 일차 의식 닫기 → 곧장 `handleOpenCinematic(selected)` 로 이주 리포트 시네마틱 직행
- `cheongpung.skipTo()` 데모 헬퍼 → `day-end-ceremony` 라우팅
- `tab1Route` union 에서 `"daily-summary"` 제거
- `handleSeeResidencesFromSummary` 핸들러도 미사용이라 함께 정리
- 파일 `src/screens/DailySummaryScreen.tsx` 삭제

---

## 2. 이주 리포트 3번째 슬라이드 — 미션 리스트 → AI 본문 요약

**커밋**: `37f2de1`

기존 Slide 3 (`함께한 순간들`) 은 완료 미션 카드 리스트를 일차별로 늘어놓은 형태였는데,
사용자 요청대로 **"미션하면서 얻은 정보를 글과 메시지로 요약"** 형태로 교체.

### 데이터 변경 (`data/journey.ts`)

```ts
export type MigrationReport = {
  // ... 기존 필드 유지
  // 신규 — Slide 3 본문
  narrativeBody?: string;
  narrativeBodySource?: "claude" | "template";
  // (옛) timeline 필드는 호환용으로 보존 (새 슬라이드는 사용 안 함)
  timeline: { missionId: string; day: number }[];
};
```

### 생성 흐름 (`data/migrationReport.ts`)

```ts
// 완료한 미션마다 NPC 이름 + 첫 2 turn npc 텍스트(180자)를 팩트 조각으로 발췌
function extractMissionFacts(missions, completedIds) { ... }

// Claude API 호출 — 청풍 톤 가이드 + 팩트 조각으로 4~6문장 글 생성
async function claudeNarrative(residence, facts, match): Promise<string | null> {
  // {amount}/{compare} 같은 치환 토큰은 발췌 시 제거
  // VITE_ANTHROPIC_API_KEY 없거나 실패 시 null
}

// 정적 폴백 — NPC 이름·카테고리 엮은 4문장 글
function templateNarrative(residence, facts): string { ... }

// generateMigrationReport 내부에서 두 채널(짧은 요약 + 본문 요약) 병행 호출
const narrativeBody = (await claudeNarrative(...)) ?? templateNarrative(...);
```

### UI (`screens/MigrationReportCinematic.tsx` SlideThree)

- 헤더: "함께한 시간의 이야기" / "당신이 보낸 시간"
- 본문: `narrativeBody`를 빈 줄로 단락 분리 → 단락별 staggered fade-in (180ms 간격)
- Claude 출처면 하단에 작은 `✦ Claude가 미션 기록을 읽고 엮은 글이에요`
- 기존 `missions` prop 은 더 이상 안 쓰므로 props 제거 + App.tsx 호출부에서 빼냄

### Claude 프롬프트 가이드 (요지)

```
- 청풍 비전: "이주 결정 도구"가 아니라 "지역과 관계 쌓고 미래 그려보는 시뮬레이션"
- 어휘: "쌓이다·만나다·머무르다·자리잡다·그려보다" 우선, 점수·등수 평가 금지
- 인용: 미션에서 알게 된 구체 정보(가격·거리·NPC 이름) 1~2개 자연 인용
- 형식: 1인칭("당신은…"), 마크다운 금지, 단락 구분만 빈 줄로
```

### 환경 변수

`.env.local` 에 `VITE_ANTHROPIC_API_KEY=sk-ant-...` 가 있으면 실제 Claude 호출.
없으면 정적 폴백이 자동으로 자리잡아 UI는 동일하게 노출됨.

---

## 3. Phase 4 샘플 — 공통 미션 5개에 명시 정렬 라벨

**커밋**: `d07c189`

기존 옵션의 `traits → oldToStance` 자동 derive 만으로는 신호가 단조롭고 부정확 (예:
`자연탐험형` 이 무조건 `alone_rest` 로만 매핑됨). 명시 `stanceAlign` / `envAlign` 필드를
달아 옵션별 정밀한 정렬 신호로 교체.

### 라벨링한 미션 (공통 미션 9개 중 5개)

| 미션 | 라벨 추가 옵션 | 주요 분기 의도 |
|---|---|---|
| **hospital** (병원 접근성) | 11개 | "걸어가볼게요 운동삼아" → 능동 톤 `alone_make`/`together_make`, 안전 톤 → `alone_rest`/`together_rest` |
| **market** (전통시장) | 8개 | 살림 톤 `alone_rest`+`together_rest`, 효율 톤 `alone_make`. "와 진짜 싸네요" 엔 `envAlign: village` 추가 |
| **routine** (하루 루틴) | 10개 | 산책·차 한 잔 → `alone_rest`, 어울림 → `together_rest`/`together_make`, 일 시작 → `alone_make` |
| **shop** (동네 가게) | 8개 | 단골·친밀함 → `together_rest`/`together_make`, "조용히 다닐 수 있어" → `alone_rest` |
| **neighbor** (이주민 만나기) | 9개 | "농사 참여" 옵션에 `envAlign: ["field"]` 추가 |

총 46개 옵션에 명시 라벨 추가. 다른 ~180개 옵션은 기존 traits 기반 자동 derive 그대로 동작.

### 라벨링 원칙

- 옵션의 **표면 톤**으로 stance 매칭 (단순 trait 자동 derive 보다 정확)
- 환경 단서가 명시적으로 들어간 옵션(농사·시장)만 `envAlign` 추가 (남발 금지)
- `traits` 는 그대로 유지 (호환 + 자동 derive 폴백 안전망)

---

## 4. 적합도 정렬 가중치 3단계화 (1.0 / 0.5 / 0)

**커밋**: `1f1c0df`

이전 binary 시스템(`isOptionAligned` → true/false) 은 Phase 4 라벨링 데이터(특히 `stanceAlt`,
`envAlign`)를 절반밖에 못 활용. 사용자 피드백 "완전 만족 / 그럭저럭 / 안 맞음" 의 3단계 분기
도입.

### 정렬 가중치 정책

| 가중치 | 판정 |
|---|---|
| **+1.0 완전 일치** | `stanceAlign`이 region 메인 `stance`와 일치 (또는 traits derive 결과 동일) |
| **+0.5 부분 일치** | `stanceAlign`이 region `stanceAlt` 와 일치, `envAlign`이 region `envType` 와 일치, 혹은 traits derive 로 `stanceAlt` 매칭 |
| **0 안 맞음** | 어느 매칭도 없음 (부정 답변 버튼도 그대로 0 유지) |

### 함수 교체

`isOptionAligned(): boolean` → `optionAlignWeight(): 0 | 0.5 | 1`

```ts
export function optionAlignWeight(
  option: DialogueOption | undefined,
  region: { stance: Stance; stanceAlt?: Stance[]; envType: EnvType }
): 0 | 0.5 | 1 {
  if (!option) return 0;
  if (option.stanceAlign?.includes(region.stance)) return 1;
  if (region.stanceAlt && option.stanceAlign?.some(s => region.stanceAlt!.includes(s))) {
    return 0.5;
  }
  if (option.envAlign?.includes(region.envType)) return 0.5;
  if (option.traits?.length) {
    const ss = option.traits.map(t => oldToStance[t]);
    if (ss.includes(region.stance)) return 1;
    if (region.stanceAlt && ss.some(s => region.stanceAlt!.includes(s))) return 0.5;
  }
  return 0;
}
```

### MissionExecuteScreen 누적 변경

```diff
- const aligned = isOptionAligned(opt, {...});
- pickStatsRef.current.alignedPicks += aligned ? 1 : 0;
+ const alignWeight = optionAlignWeight(opt, {...});
+ pickStatsRef.current.alignedPicks += alignWeight;  // float 누적
```

### 데이터 모델 영향

`RegionRecord.pickStats.alignedPicks` 타입은 그대로 `number` 지만 **의미가 정수에서
float** 으로 바뀜 (예: `3.5/8 답`). `calculateMatchV2` 의 정렬도 공식 `aligned / total × 100`
은 그대로 호환.

### UI 표시 (JourneyScreen 브레이크다운)

```diff
- {match.pickStats.alignedPicks}/{match.pickStats.totalPicks} 답
+ {match.pickStats.alignedPicks.toFixed(1)}/{match.pickStats.totalPicks} 답
```

부정 답변은 여전히 가중치 0 — 청풍 톤(쌓이다·머무르다)을 깨지 않고 사용자가 호기심으로
부정 답변을 눌렀다고 점수가 깎이지 않게 함.

---

## 데이터 흐름 요약 (사용자 한 명 기준)

```
온보딩 11단계
   ↓
profile { env, stance } 저장
   ↓
잠재매칭 = matchResidenceScore(profile, residence)   // 0~100
   ↓
[떠나기 카드] "잠재 적합도 78%" 표시 가능
   ↓
미션 진행 — 옵션 픽 → optionAlignWeight() 0/0.5/1
   ↓
totalPicks +1, alignedPicks += weight (float 누적)
   ↓
부정 답변 픽 → totalPicks +1, alignedPicks +0
   ↓
이주 리포트 생성 → 점수 + AI 짧은 요약 + AI 본문 요약 캐싱
   ↓
[나의 여정] 적합도 = round(잠재 × 0.4 + 정렬도 × 0.6), 브레이크다운 노출
   ↓
[이주 리포트 시네마틱]
  Slide 1 — 점수 카드
  Slide 2 — AI 짧은 요약 (2~3문장)
  Slide 3 — AI 본문 요약 (4~6문장, 미션 NPC 정보 인용)
  Slide 4 — 컨페티 + 보상 카드
```

---

## 다음 단계 후보

- **Phase 4 마저 진행** — 공통 미션 4개(cost / transit / food / shop이 아닌 신규) +
  지역 미션 28개 옵션 라벨링. 디자인 다듬을 때 점진적으로
- **만난 주민 + 동선 지도** — 이주 리포트 새 슬라이드 후보
- **RegionDescScreen AI 활용** — 자유 입력 → AI가 EnvType/Stance 추정 → 온보딩
  가중치 보정
- **`negative` 옵션에 NPC 반응 한 줄** — 부정 답변 누르면 NPC가 잠깐 "그렇구나..." 정도
  반응 후 다음 turn으로
