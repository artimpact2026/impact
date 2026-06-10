# 2026-06-10 — 레지던스 홈 카카오톤 리뉴얼 + 로드뷰 네비게이션 + 임팩 가치관 정리

이날 작업은 크게 4묶음. 사용자 능동성과 지역 탐색 유도가 핵심.

1. **온보딩 흐름 재정렬** — 닉네임이 첫 질문, "내 귀촌 유형 보기" 가 마지막
2. **하단탭 재구성** — 예약 / 커뮤니티 / 시뮬 / 여정 / 내정보
3. **레지던스 홈 카카오 다육이 톤** — "내 집이 자라고 있어요" + 클레이 한옥
4. **로드뷰 네비게이션 UX** — 100m 떨어진 곳에서 화살표 따라 도착지로

부수: Phase A 강화 미션 시간대(아침/낮/저녁) + 9 main + 5 보너스 plan,
호기심 질문 카드 + NPC 가이드 오버레이, 디버그 헬퍼 추가.

---

## 🧭 임팩 가치관 — 모든 디자인 결정의 베이스

청풍의 임팩은 단순 정보 제공이 아니라 **"한 세대가 자신의 삶을 설계하는 선택지
자체를 넓히는 일"**. 모든 화면·문구·인터랙션은 이 세 축 위에서 결정한다.

### 1️⃣ 지역 측면 — 라이프스타일 기반 지역 탐색

기존 지역 홍보가 *관광지·지원금 중심 정보 제공* 이었다면,
청풍은 **사용자의 가치관과 라이프스타일에 맞춰 지역을 탐색** 하는 새 접근.

> 지역을 '장소' 가 아니라 **'삶의 방식'** 으로 경험할 수 있는 가능성 제시

**디자인 적용**
- 마을 정보가 "인구 / 면적 / 지원금" 이 아니라 **"어울리는 자세 / 어울리는 환경 / 하루의 풍경"** 으로 표현됨
- 미션이 *학습형* 이 아니라 **체험형** — "여기서 이렇게 산다는 게 어떤 거지?" 를 직접 느끼게
- 호기심 질문 카드 ("응급 상황엔 어디로...?") 가 *정보 전달* 보다 *호기심 자극* 우선

### 2️⃣ 사용자 측면 — 귀촌을 라이프스타일 옵션으로

귀촌에 관심 없거나 막연한 사용자도 자연스럽게 지역 라이프스타일을 경험.
**사회초년생(주 타겟)** 에게 "도시에서만 살아야 한다" 는 고정관념을 넘어,
다양한 삶의 가능성을 상상할 계기를 제공.

> 청풍에서의 짧은 체험이 *"나도 다른 곳에서 살아볼 수 있겠다"* 는 상상으로,
> 그 상상이 다시 *실제 탐색과 행동* 으로 이어지는 변화의 출발점

**디자인 적용**
- 진입 부담 낮춤 — 닉네임만 적으면 시작 (이메일은 뒤로), 카카오 다육이 톤
- "결정 도구" 가 아니라 "관계 쌓기 + 미래 그리기" — 점수보다 *조각/기념품/인용구*
- 능동성 우선 — NPC 가 먼저 말 거는 게 아니라 *내가 먼저 묻기*,
  정답을 알려주는 게 아니라 *내가 추측 → 비교*
- 의사결정 부담 → *여정* 으로 구조화. 3일 챌린지, 시간대(아침/낮/저녁) 흐름

### 3️⃣ 파트너 측면 — Digital Gateway

개별 운영되던 레지던스·체류 프로그램을 한곳에서 탐색.
지역과 잠재 이주자의 접점을 확대하는 **디지털 관문**.

> 향후 실제 방문 및 체류 프로그램 참여로 이어질 수 있는 기반 마련

**디자인 적용**
- 예약 탭 top-level 승격 — 정보 탐색이 항상 *한 탭* 안에
- 가보기 CTA 가 시뮬레이션 종착지 — 시뮬은 *예약으로 이어지는 다리*
- 실제 카카오 로드뷰 임베드 — 가상이 아닌 *진짜 그 동네* 의 풍경

---

## 1. 온보딩 흐름 재정렬

**파일**: `frontend/src/screens/onboarding/{NicknameScreen, EmailScreen, RegionDescScreen, OnboardingShell}.tsx`

### 새 순서
```
splash → intro → nickname(1) → email(2) → birth(3) → homeRegion(4) →
interests(5) → balanceB(6) → balanceC(7) → values(8) → scene(9) →
healing(10) → envChoice(11) → regionDesc(12) → result
```

- 닉네임이 **첫 질문** — 첫 입력의 정서적 부담 낮음, "내가 누군지" 부터 시작
- "바람을 짓다 시작하기" 서브카피가 NicknameScreen 으로 이동
- NicknameScreen CTA "내 귀촌 유형보기" → **"다음"** (보고는 마지막에)
- RegionDescScreen CTA **"내 귀촌 유형 보기 🍃"** — 마지막 질문 끝나면 결과 발표 톤

### 카피 다이어트
- "조용한 작업실에서 손에 흙·실 묻히기" → **"조용한 작업실에서 일하기"**
- "손으로 만들기" → **"뭔가 만들기"**
- 풍경의 하루 5번째 mix-weight 옵션 삭제 → 4지선다 (자세 4축 정확 매핑)

### 캐릭터 누끼 PNG 교체
- IntroScreen 의 `char-barami-front.webp` → **`clay-baram-solo.png`**
- `char-jieumi-front.webp` → **`clay-jieum-solo.png`**
- 캐릭터 사이즈 `w-128 → w-150` 으로 살짝 키워 풀바디 비율 맞춤

---

## 2. 하단탭 재구성 — 5탭 (4 일반 + 1 floating)

**파일**: `frontend/src/components/BottomNav.tsx`, `frontend/src/App.tsx`

### 새 순서
```
| 🏠 예약 | 💬 커뮤니티 | (notch) | 🗺 여정 | 👤 내정보 |
                    ◉ 시뮬
```

| 변경 | 이유 |
|---|---|
| `discover` 탭 **삭제** | 발견의 두 기능(이야기/예약) 이 분리되는 게 더 명확 |
| `community` 탭 **신규** | 이주민 이야기가 top-level — Digital Gateway 의 관계 축 |
| `booking` 탭 **신규(가시화)** | 예약이 최상위 — Digital Gateway 의 행동 축 |
| `letter` 탭 **삭제** | 시뮬레이션 sub-route 로 이동 (ResidenceHomeScreen ✉️ 버튼) |

### 새 아이콘
- `BookingIcon` — 집 + 문
- `CommunityIcon` — 말풍선 + 점 3개

### 편지 진입 경로 변경
- `Tab1Route` 에 `"letter"` 추가
- ResidenceHomeScreen 의 ✉️ floating 버튼이 유일 진입점
- unread 배지가 이 floating 버튼 우상단으로 이주

---

## 3. 레지던스 홈 카카오 다육이 톤 리뉴얼

**파일**: `frontend/src/screens/ResidenceHomeScreen.tsx`

레퍼런스: `character1/refe.png` (카카오톡 다육이 레벨업 화면)

### 디자인 원칙
- 본가 HomeScreen 은 **"페이크 홈"** (첫 시작, "떠나볼까요?")
- ResidenceHomeScreen 은 **"찐 홈"** — 본가로 돌아가기 전까지 시뮬의 중심지

### 화면 구조
```
┌─────────────────────────────────────┐
│ {닉네임}님의 집이                    │
│ 자라고 있어요                        │
│ 강화도에서 잠시 머무는 중            │
│                          ┌──────┐  │
│                          │ ✉️   │ ← unread 배지
│                          │ 편지 │  │
│                          └──────┘  │
│   ★ 화면 정중앙 ★                   │
│           ╔════════╗                │
│        🦋 ║ 클레이 ║                │
│           ║   집   ║                │
│           ║ (창문빛 ║                │
│           ║ +굴뚝연기)               │
│           ╚════════╝       🌸      │
│      🌼 ⌬⌬⌬흙무더기⌬⌬⌬             │
│ ┌────────────────────────────────┐ │
│ │ Day N / 3 · 강화도        N%  │ │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━     │ │
│ │ 오늘 미션 N / M               │ │
│ │ [🎯 알아보기]  [🌿 마당가꾸기] │ │
│ └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 디테일
- **클레이 한옥 SVG** — 기와 곡선 + 통창 + 노란 빛 + 굴뚝 연기 (3개 원)
- **흙무더기 platform** — 위에서 본 타원, radialGradient 잔디 + 사이드 흙 단면
- **떠다니는 데코** — 나비 2마리(좌상/우상) + 꽃잎 2개(좌하/우하), 각자 다른 모션 phase
- **floating 편지 버튼** — 캐릭터 좌하단/우측 absolute, 둥실 모션
- **하단 카드** — Day/N/M + 진행률 + 알아보기(primary CTA) + 마당가꾸기(🔒 잠금 placeholder)
- 이전에 있던 ← 본가 돌아가기 버튼 제거, 🎯 알아보기 floating 도 제거(하단 카드와 중복)

---

## 4. Phase A — 강화 미션 시간대 plan (아침/낮/저녁 × 3일)

**파일**: `frontend/src/data/{missions, regionMissions, dayPlan}.ts`,
`frontend/src/screens/MissionListScreen.tsx`,
`frontend/src/components/MissionImageCard.tsx`

### Mission 타입 확장 (옵션 3개)
```ts
timeOfDay?: "아침" | "낮" | "저녁";   // 시간대 칩
tier?: "main" | "bonus";              // 일자 plan / 추가 미션
day?: number;                          // 1~3 명시적 일차 할당
```

### 강화 9 main + 5 bonus
```ts
const GANGHWA_PLAN = {
  // Day 1 — 동네 첫인상
  shop:              { timeOfDay: "아침", tier: "main", day: 1 },
  "ganghwa-mudflat": { timeOfDay: "낮",   tier: "main", day: 1 },
  market:            { timeOfDay: "저녁", tier: "main", day: 1 },
  // Day 2 — 이웃과 연결
  "ganghwa-market":  { timeOfDay: "아침", tier: "main", day: 2 },
  "ganghwa-farm":    { timeOfDay: "낮",   tier: "main", day: 2 },
  neighbor:          { timeOfDay: "저녁", tier: "main", day: 2 },
  // Day 3 — 인프라 + 마무리
  hospital:          { timeOfDay: "아침", tier: "main", day: 3 },
  transit:           { timeOfDay: "낮",   tier: "main", day: 3 },
  "ganghwa-sunset":  { timeOfDay: "저녁", tier: "main", day: 3 },
  // 보너스 — 추가 미션 (일자 제약 X)
  "ganghwa-dolmen": { tier: "bonus" },
  food:             { tier: "bonus" },
  cost:             { tier: "bonus" },
  routine:          { tier: "bonus" },
  mailbox:          { tier: "bonus" },
};
```

### buildDayPlan 업데이트
- `tier === "bonus"` 분리 → `bonusMissionIds[]` 반환
- main 중 `day` 필드 있으면 그 일차로 배치
- 같은 일차 안에서 `timeOfDay` 순서대로 정렬 (아침→낮→저녁)
- 다른 마을(영월 등)은 백워드 호환 — 기존 chunkByDay 동작 유지

### UI
- MissionImageCard 좌상단 **시간대 칩** (🌅 아침 / ☀️ 낮 / 🌙 저녁)
- MissionListScreen 에 **✨ Bonus 추가 미션** 섹션 별도 (일자 섹션 아래)
- 헤드라인 카피: "오늘은 / {region}의 {day}일차" + "어디부터 들러볼까요?"

---

## 5. KakaoRoadview UX 강화 — 화살표 네비게이션

**파일**: `frontend/src/components/KakaoRoadview.tsx`

### 핵심: 100m 떨어진 곳에서 시작 → 도착지로 안내

```
미션 카드 탭
  ↓
🚶 도착지 주변 8방위(0/45/90/.../315도) 중 panoId 잡히는
   100m 떨어진 좌표에서 시작
  ↓
화면 위 UI:
  · 상단 호기심 질문 카드 (4.5s 자동 fade)
  · 중앙 네비게이션 칩: ↑ 회전 화살표 + "{도착지} · 85m 남음"
  · 좌하단 NPC 가이드: 클레이 캐릭터 + 말풍선
  ↓
사용자가 카카오 SDK 내장 화살표로 한 칸씩 이동
  · position_changed 리스너로 매 이동마다 거리/방위 자동 업데이트
  · 화살표 ↑ 가 도착지 방향으로 회전
  ↓
30m 이내 도달 → 🎉 도착! 오버레이 → 1.8s 후 자동 onComplete
```

### 지리 헬퍼 (inline, 외부 라이브러리 X)
- `offsetCoord(lat, lng, dist, bearing)` — N미터 N방위 떨어진 좌표
- `distanceMeters(...)` — haversine 거리
- `bearingDeg(...)` — 진행 방위각 (북=0, 시계방향)

### 그레이스풀 폴백
- 8방위 다 panoId 없으면 → 도착지에서 그대로 시작
- 30m 이내 panoId 가 없는 경우 → 사용자가 도착해도 트리거 안 됨, 수동 시작하기 버튼으로 진행 가능

### 임팩 측면
이 변경은 단순 UX 개선이 아니라 **"지역을 둘러보게 한다"** 는 임팩 1번 (지역
측면) 의 구현. 정적인 좌표 확인이 아니라 *걸어가는 행위* 가 들어가면서, 사용자가
실제 동네를 *느끼는* 경험에 한 발짝 가까워짐.

---

## 6. 보조 작업 — 콘솔 디버그 헬퍼

**파일**: `frontend/src/App.tsx`

```js
cheongpung.enter("ganghwa")  // 신규 — 미션 미완료 + 1일차로 즉시 마을 홈 진입
cheongpung.skipTo("ganghwa") // 기존 — 모든 미션 완료 + 하루 끝 의식
cheongpung.bumpDay("ganghwa")
cheongpung.setDay(2, "ganghwa")
cheongpung.reset()
cheongpung.regions()
```

`enter` 추가로 로드뷰 미션 테스트 동선 단축. 한 줄로 강화 ResidenceHomeScreen 진입.

---

## 변경 파일 (커밋 `0b9733c`, `8ba9f45`)

```
Modified
  src/App.tsx                                  (1029 → 1102)
  src/components/BottomNav.tsx                  (288 → 209)
  src/components/MissionImageCard.tsx            (+ 시간대 칩)
  src/components/KakaoRoadview.tsx              (170 → 480)
  src/data/dayPlan.ts                           (+ tier/day 분리)
  src/data/missions.ts                          (+ TimeOfDay/Tier 타입)
  src/data/quiz.ts                              (5번째 dayScene 옵션 삭제)
  src/data/regionMissions.ts                   (+ GANGHWA_PLAN)
  src/screens/BookingScreen.tsx                  (헤더 정렬)
  src/screens/CommunityScreen.tsx                (헤더 정렬)
  src/screens/DepartureScreen.tsx               (전체 → 근처)
  src/screens/LetterScreen.tsx                  (✕ back 버튼)
  src/screens/MissionListScreen.tsx             (보너스 섹션 + 새 헤드라인)
  src/screens/ResidenceHomeScreen.tsx           (완전 재작성)
  src/screens/onboarding/EmailScreen.tsx        (서브카피 제거)
  src/screens/onboarding/IntroScreen.tsx        (clay PNG 교체)
  src/screens/onboarding/NicknameScreen.tsx     (서브카피 추가 + CTA)
  src/screens/onboarding/OnboardingShell.tsx    (닉네임 첫 질문)
  src/screens/onboarding/RegionDescScreen.tsx   (마지막 CTA)
```

---

## 다음 작업 메모

- **마당 가꾸기** 🔒 — 현재 placeholder. cliffhanger 풀어내는 다음 phase
- **로드뷰 view-relative 화살표** — 현재 북 기준 회전. SDK `getViewpoint()` 로
  사용자 시점 기준 회전하면 더 직관적
- **MiniRoadview / MissionTravelingScreen 동일 오버레이 이식** — 폴백 경로에서도
  같은 톤 유지
- **다른 마을 plan** — 영월/무주/세종/의성/홍성/대전/영덕 도 9 main + 보너스 매핑
- **시간대 흐름의 실제 체감** — 카드 정렬을 시간대 순으로 한 줄에 펼치는 timeline
  레이아웃 검토 (현재는 카테고리별 캐러셀)
