# 2026-06-06 — 이주 리포트 v3 (말해보카 톤 평가 + 실용 정보 슬라이드)

## 무엇이 바뀌나

이전 이주 리포트(v2)는 4슬라이드 — 점수 / AI 짧은 요약 / AI 본문 / 보상.
AI 텍스트는 "완료한 미션 제목" 만 알고 있어서 추상적이고 일반적인 회상에 머묾.

v3는 **사용자가 실제로 고른 답변 라벨**을 끌어다가 Claude에 인용시켜 말해보카 톤의
개인화 평가를 만들고, 실용 정보 슬라이드를 새로 추가. 슬라이드 5장.

```
v2                              v3
─────────────────────           ─────────────────────
1. 점수 카드                    1. 점수 카드 (그대로)
2. AI 짧은 요약(추상)           2. 개인화 평가 (말해보카 톤, 픽 인용)
3. AI 본문 요약(NPC 정보)       3. 본문 회상 (픽 + NPC 인용)
4. 보상 + CTA                   4. 실용 정보 (만난 사람·준비·주의) ← NEW
                                5. 보상 + CTA
```

---

## 1) 픽 로깅 인프라

미션 화면이 사용자가 고른 옵션 라벨을 저장해야 AI가 인용할 수 있음. 데이터 흐름:

```
MissionExecuteScreen (handlePick)
  → pickedLabelsRef.current = [...prev, opt.label]
  → finish 시 onComplete(fitDelta, pickStats, pickedLabels)

App.handleMissionComplete(fitDelta, pickStats, pickedLabels)
  → completeMissionFor(progress, id, mission, fitDelta, pickStats, pickedLabels)
  → RegionRecord.pickedLabels[missionId] = pickedLabels
```

부정 답변(`"음… 솔직히 나랑은 안 맞는 것 같아요"`)도 라벨 시퀀스에 `"(부정 답변)"`
으로 남김. AI 프롬프트에선 부정 답변을 인용 후보에서 제외.

### 데이터 모델 변경 (`data/journey.ts`)

```ts
type RegionRecord = {
  ...
  pickStats?: { totalPicks: number; alignedPicks: number };
  // v3 — 신규
  pickedLabels?: Record<string /* missionId */, string[]>;
};
```

`completeMissionFor()` 시그니처에 `pickedLabels?: string[]` 인자 추가.

### MissionExecuteScreen 변경

```ts
const pickedLabelsRef = useRef<string[]>([]);

// handlePick
pickedLabelsRef.current = [...pickedLabelsRef.current, opt.label];

// handleNegativePick
pickedLabelsRef.current = [...pickedLabelsRef.current, "(부정 답변)"];

// finish
onComplete(total, stats, [...pickedLabelsRef.current]);
```

---

## 2) Claude 프롬프트 v3

### Slide 2 — `claudePersonalReview` (말해보카 톤)

```
사용자가 ${region}(${name})에서 가상 이주 시뮬레이션을 마쳤습니다.

== 사용자의 실제 답변 기록 ==
- 병원 접근성 확인 (생활현실형, NPC: 동네 어르신)
  → "병원이 어디 있는지 좀 알아두려고요"
  → "걸어가볼게요. 운동 삼아 좋잖아요"
- 동네 밥집 물가 체험 (생활현실형, NPC: 식당 아주머니)
  → "와, 진짜 싸네요"
  → "매일 사 먹어도 부담 없겠네요"
...

== 점수 ==
- 적합도: 76/100점
- 정렬된 답: 5.5/8

위 답변 기록을 바탕으로, 말해보카 회화 피드백 톤으로 사용자의 ${region}
시뮬레이션을 2~3문장으로 평가해주세요.

요구사항:
- 사용자가 실제로 고른 답 중 **1개를 직접 인용**하여
  "당신은 *X* 라고 답하셨네요" 형태로 자연 인용
- 어떤 답이 이 지역의 리듬과 잘 정렬됐는지, 혹은 어떤 답에서 도시 습관/거리감이
  드러났는지 짚어주세요
- "당신은 ___ 한 사람이에요" 처럼 짧고 또렷한 캐릭터 평가 1줄 포함
- 청풍 톤: "쌓이다·머무르다·자리잡다" 어휘 우선. 점수·등수 평가 어휘 금지
- 1인칭("당신은…"), 마크다운/제목 금지
```

### Slide 3 — `claudeNarrative` (본문, 픽 인용 강화)

기존 본문 프롬프트에 *"사용자가 고른 답 중 인상적인 것"* 블록(부정 답변 제외, 최대 5개)
을 추가. 다음 지시 추가:

> **사용자가 고른 답 중 1~2개를 직접 인용**("당신은 *X* 라고 답했고…") 해서
> 회상에 녹여주세요

### Slide 4 — `claudePracticalNotes` (실용 정보, JSON 응답)

```
다음 JSON 형식 그대로 (다른 설명·코드블록 없이) 출력해주세요:

{
  "preparation": [
    "첫 한 달 준비 항목 1 (한 문장, 실용 정보)",
    "준비 항목 2",
    "준비 항목 3"
  ],
  "cautions": [
    "주의/어색했던 부분 1 (사용자 답변에서 드러난 부분 인용)",
    "주의 항목 2"
  ]
}
```

응답에서 JSON 블록(`/\{[\s\S]*\}/`)을 정규식으로 추출 후 파싱. 실패 시 정적 폴백.

### 정적 폴백 강화

- `templatePersonalReview` — 적합도 3구간(>80 / 60-80 / <60)별 톤 다른 평가
- `templatePracticalNotes` — 미션 카테고리·만난 NPC·match 기반 4~5 bullet 자동 생성

API 키 없거나 호출 실패 시에도 슬라이드 UI는 항상 채워짐.

### 공통 헬퍼

```ts
function getApiKey(): string | undefined { ... }
async function callClaude(prompt: string, maxTokens: number): Promise<string | null> { ... }

// 모든 미션과 사용자 픽 라벨을 정렬해서 프롬프트 블록으로
function pickedBlock(missions, completedIds, pickedLabels): string { ... }
```

기존 `claudeSummary` 함수는 제거(역할이 `claudePersonalReview` 로 흡수).

---

## 3) 새 슬라이드 — Slide 4 실용 정보

`MigrationReportCinematic.tsx` 에 `SlidePractical` 컴포넌트 추가. 섹션 3개:

| 섹션 | 색 톤 | 형식 |
|---|---|---|
| 만난 사람들 | nature(초록) | NPC 이름 칩 (`bg-nature-50` 라운드 풀) |
| 챙겨갈 것 | primary(주황) | ✦ + bullet, 3개 |
| 주의할 점 | ink-mute(회색) | · + bullet, 2개 |

각 섹션은 staggered fade-in. Claude 출처면 하단에 작은 `✦ Claude가 당신의 답변을 읽고
정리한 항목이에요`. 옛 리포트(`practicalNotes` 미존재) 호환 — 안내문만 노출.

`SLIDE_COUNT` 4 → 5로 늘리고 SlideFour는 `idx === 4` 로 이동(보상 슬라이드).

---

## 4) API 키 설정

데모에서 실제 Claude 호출하려면:

1. https://console.anthropic.com 에서 API 키 발급
2. `frontend/.env.local` 생성:
   ```
   VITE_ANTHROPIC_API_KEY=sk-ant-...
   ```
3. dev 서버 재시작 (`npm run dev`)

키 없거나 비어있어도 동작 — 모든 슬라이드가 정적 폴백으로 채워짐. 단지 정형화된 톤만
나오고 픽 인용은 없음.

> **주의**: `.env.local` 은 `.gitignore` 에 들어가 있어야 함. 키를 깃에 올리지 말 것.

---

## 한 줄 요약

> 사용자의 미션 답변 라벨을 모아 Claude에 보내고 — *"당신은 *걸어가볼게요* 라고
> 답한 순간부터 이미 이 동네 리듬을 받아들이고 있었어요"* 같이 인용하면서
> 평가하고, 실용 정보(만난 사람·준비·주의)까지 채우는 5슬라이드 리포트. API 키
> 한 줄로 즉시 활성화, 없어도 폴백으로 동작.

---

## 다음 단계 후보

- **부정 답변 NPC 반응** — 부정 답변 누르면 NPC가 짧게 "그렇구나..." 정도 반응 후 진행
- **만난 주민 + 동선 지도** — Slide 4에 작은 지도로 NPC 위치 표시
- **Phase 4 마저 진행** — 지역 미션 28개 옵션에도 envAlign/stanceAlign 라벨링
- **리포트 캐싱 정책** — 이미 생성된 리포트 재호출 안 함(현재도 안 함, 명시적 invalidate
  헬퍼 추가 검토)
