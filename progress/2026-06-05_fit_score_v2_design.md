# 2026-06-05 — 적합도 점수 v2 설계 (재설계 명세)

## 왜 다시 만드나

청풍의 핵심 가치는 "이 지역이 나에게 맞는지 정확히 가늠해보기". 현재 적합도(`calculateMatch`)는
세 가지 문제가 있음.

1. **미션 완료 수가 곧 적합도 상승**. `base + fitScore + min(8, completedMissions)` 공식에서
   세 번째 항은 답 내용 무관 — 그냥 많이 풀면 오름. "정렬되지 않은 답"을 해도 적합도가 떨어지지
   않고 오히려 보너스 받음.
2. **온보딩 결과 활용도가 낮음**. base는 옛 `LifeStyleType` 한 축만 보고 +20 차이(70 vs 50)만 줌.
   새 Env+Stance 시스템의 정밀한 매칭을 못 씀.
3. **지역 간 비교 불공정**. 미션이 많은 지역이 누적치에서 유리 — 가로 비교 무리.

청풍의 종착지가 "8지역 중 내게 맞는 곳을 비교" 라는 점에서 ②③이 결정적.

---

## 새 공식

```
적합도 = round( 잠재매칭 × 0.4  +  미션정렬도 × 0.6 )

잠재매칭     = matchResidenceScore(profile, residence)               // 0~100
미션정렬도   = (정렬 답변 / 답한 옵션 총 개수) × 100                  // 0~100, 답 없으면 = 잠재매칭

하한 안전판: 적합도 ≥ round(잠재매칭 × 0.4)
```

### 비중 근거
- **잠재매칭 0.4** — 온보딩이 사용자의 평소 자아라 베이스 가중치는 있어야 하지만, 살아보지
  않고 결정 못 하는 게 청풍 비전이라 절반 미만.
- **미션정렬도 0.6** — 실제 그 지역에서 한 선택이 더 무거움. 시뮬레이션 가치의 핵심.

### 답 없을 때
미션 한 개도 안 한 상태에선 미션정렬도가 정의 안 되므로 잠재매칭을 그대로 사용.
"잠재 적합도 75%" 같은 표시가 가능 (떠나기 카드).

### 하한 안전판
첫 답이 정렬 안 됐다고 적합도가 잠재매칭의 절반으로 폭락하면 사용자가 좌절. `잠재매칭 × 0.4`
하한이 있으면 최악이라도 베이스의 40%는 유지.

---

## 데이터 모델 변경

### 1) `DialogueOption` — 정렬 신호를 명시적으로

```ts
export type DialogueOption = {
  label: string;
  next?: number;

  // 옛 호환 — 자동 derive로 fallback 처리됨
  traits?: LifeStyleType[];

  // 신규 — 명시적 정렬 힌트 (없으면 traits에서 자동 derive)
  envAlign?: EnvType[];     // ["sea"] 면 sea 지역과 정렬
  stanceAlign?: Stance[];   // ["alone_make"] 면 alone_make 지역과 정렬
};
```

기존 traits만 있어도 `oldToStance[]`로 자동 변환되어 동작. **새 옵션·다듬을 옵션만** 명시 필드 사용.
미션 28개 × ~5옵션 = ~230개를 한 번에 backfill 강요하지 않음. 점진 마이그레이션.

### 2) `RegionRecord` — 답변 통계 추가

```ts
type RegionRecord = {
  // 기존
  residenceId: string;
  visitCount: number;
  completedMissionIds: string[];
  score: number;             // 축적 — 그대로 ↑
  fitScore: number;          // 옛 누적치 — 백업용으로 남김 (deprecated)
  currentDay?: number;
  migrationReport?: MigrationReport;

  // 신규 — 옵션 단위 정렬 통계
  pickStats?: {
    totalPicks: number;      // 답한 옵션 총 개수
    alignedPicks: number;    // 그 중 정렬된 개수
  };
};
```

미션 완료마다 `+totalPicks`, `+alignedPicks` 가산. 비율이 곧 미션정렬도(%).

### 3) 정렬 판정 — `isOptionAligned()`

```ts
function isOptionAligned(
  option: DialogueOption,
  region: { stance: Stance; stanceAlt?: Stance[]; envType: EnvType }
): boolean {
  // 1) 명시 stanceAlign 우선
  if (option.stanceAlign?.includes(region.stance)) return true;
  if (option.stanceAlign?.some(s => region.stanceAlt?.includes(s))) return true;

  // 2) 명시 envAlign
  if (option.envAlign?.includes(region.envType)) return true;

  // 3) Fallback — 옛 traits에서 derive
  if (option.traits?.length) {
    const ss = option.traits.map(t => oldToStance[t]);
    if (ss.includes(region.stance)) return true;
    if (region.stanceAlt && ss.some(s => region.stanceAlt!.includes(s))) return true;
  }

  return false;
}
```

### 4) 점수 계산 — `calculateMatchV2()`

```ts
export type MatchBreakdown = {
  potential: number;        // 잠재매칭 0~100
  alignment: number;        // 미션정렬도 0~100 (답 없으면 = potential)
  total: number;            // 최종 적합도 0~100
  pickStats: {
    totalPicks: number;
    alignedPicks: number;
  };
};

export function calculateMatchV2(
  profile: LifestyleProfile | null,
  residence: RecommendableResidence,
  record?: RegionRecord
): MatchBreakdown {
  const potential = profile
    ? matchResidenceScore(profile, residence)
    : 50;

  const total = record?.pickStats?.totalPicks ?? 0;
  const aligned = record?.pickStats?.alignedPicks ?? 0;

  const alignment = total === 0
    ? potential
    : Math.round((aligned / total) * 100);

  const weighted = Math.round(potential * 0.4 + alignment * 0.6);
  const floor = Math.round(potential * 0.4);
  const final = Math.max(weighted, floor);

  return {
    potential,
    alignment,
    total: final,
    pickStats: { totalPicks: total, alignedPicks: aligned },
  };
}

// 호환 — 0~100 숫자만 필요한 곳
export function calculateMatch(
  profile: LifestyleProfile | null,
  residence: Residence,
  record?: RegionRecord
): number {
  return calculateMatchV2(profile, residence, record).total;
}
```

---

## 실행 흐름

```
온보딩 끝
   ↓
프로필 {env, stance} 저장
   ↓
떠나기 지도 카드 — 잠재 적합도 표시 (matchResidenceScore)
   ↓
지역 도착 → 미션 진행
   ↓
미션 한 옵션 픽 → totalPicks +1
   isOptionAligned() == true 면 alignedPicks +1
   ↓
미션 완료 → record.pickStats 갱신, completedMissionIds 갱신
   ↓
나의 여정 탭 — calculateMatchV2 로 적합도 = 잠재 × 0.4 + 정렬도 × 0.6
   ↓
8지역 가로 비교 (모두 0~100 동일 스케일)
```

---

## 비교 가능성 — 지역 간

| 지역 | 잠재 | 답한 옵션 | 정렬 옵션 | 정렬도 | 최종 적합도 |
|---|---|---|---|---|---|
| 강화도 | 78 | 12 | 9 | 75% | round(78×0.4 + 75×0.6) = **76** |
| 영월 | 65 | 12 | 11 | 92% | round(65×0.4 + 92×0.6) = **81** |
| 무주 | 82 | 0 | 0 | (=82) | round(82×0.4 + 82×0.6) = **82** |

→ 영월은 잠재는 낮았지만 실제 답에서 정렬 잘 됐기 때문에 81. 무주는 아직 안 가본 잠재만의 82.
사용자가 8지역을 가로 비교하면 답한 만큼 보정된 점수가 나옴.

---

## UI 표현 (제안)

리포트/여정 카드에 풀어 보여줄 수 있음:

```
적합도 76%
└ 잠재 매칭 78%       ─ 온보딩 결과로 본 어울림
└ 미션 정렬도 75%      ─ 12번 답 중 9번이 이 지역 톤
```

브레이크다운을 보이면 사용자가 "왜 이 점수인가" 이해 가능. 이주 리포트 시네마틱의 점수 슬라이드도
이걸로 채울 수 있음.

---

## 구현 단계

### Phase 1 — 핵심 데이터/함수 (코드 변경 최소)
- `DialogueOption`에 `envAlign?`, `stanceAlign?` 필드 추가 (Optional, 호환)
- `RegionRecord`에 `pickStats?` 추가 (Optional)
- `isOptionAligned()` helper
- `calculateMatchV2()` + 기존 `calculateMatch()`를 V2 위임으로 교체
- `completeMissionFor()` 시그니처 확장 — `pickStats` 가산 받기

### Phase 2 — 미션 화면 연동
- MissionExecuteScreen에서 옵션 픽마다 (total, aligned) 집계
- onComplete에 fitDelta 대신 pickStats 전달
- App.tsx에서 completeMissionFor 호출 시 pickStats 인자 전달

### Phase 3 — UI 표현
- 여정 탭 RegionBottomSheet의 "적합도" 바를 브레이크다운으로 (잠재 / 정렬도)
- 떠나기 카드에 "잠재 적합도" 라벨로 노출 가능

### Phase 4 — 옵션 메타데이터 다듬기 (옵션, 점진)
- 표현이 모호한 옵션부터 `stanceAlign`/`envAlign` 명시
- 강한 정렬 신호를 보내야 할 답(예: "조용히 바닷가에서 멍") 우선

---

## 마이그레이션 호환성

- `fitScore`(옛 필드): 새 코드에서 안 쓰지만 RegionRecord 타입에서 제거 X — 기존
  localStorage 저장값 보존. 신규 진행은 `pickStats` 가산.
- `calculateMatch()` 시그니처 동일 — 내부만 V2 위임. 다른 화면 import 그대로.
- 미션 옵션 `traits`: 그대로 유지, fallback에서 `oldToStance` 변환.

→ **기존 화면·기존 데이터 그대로 동작**, 새 답안부터 정렬도 누적되며 점진적으로 정확해짐.

---

## 다음 단계

위 Phase 1 + Phase 2 까지 한 PR로 묶고, Phase 3 UI는 후속. Phase 4(옵션 다듬기)는 미션을
디자인하는 흐름 안에서 점진적으로.
