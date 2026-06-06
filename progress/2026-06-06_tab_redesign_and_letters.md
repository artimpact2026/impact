# 2026-06-06 — 하단 탭 5칸 개편 + 발견·내정보·편지 탭 + 찐 홈

이날의 작업은 크게 다섯 묶음. 둘 다 사용자 관점의 "앱 골격" 재정비.

1. **하단 탭바 5칸 + 중앙 시뮬레이션 솟은 원형 버튼**
2. **발견 탭** — 커뮤니티 + 청년마을 통합
3. **내 정보 탭** — 정체성 + 좋아요 청년마을 + 설정
4. **찐 홈 (ResidenceHomeScreen)** — 레지던스 진입 후 일상 화면
5. **편지함 (Letter 시스템)** — NPC·시스템·커뮤니티 통합 인박스

부수: Gemini API 폴백 / 베이지 띠 제거 / 자산 추가.

---

## 1. 하단 탭바 5칸 + 솟은 시뮬레이션 버튼

**파일**: `frontend/src/components/BottomNav.tsx`

기존 4탭(홈·여정·커뮤니티·예약)을 5탭 + 가운데 강조 구조로.

```
   ◉         ← 64px 주황 원형 (탭바 위로 -mt-11 솟음)
  시뮬
─────────────────────────────────
[🧭]  [🗺]  ◉   [✉]  [👤]
 발견   여정 시뮬  편지   내 정보
```

### TabKey 재설계

```ts
export type TabKey =
  | "discover"     // 발견 — 커뮤니티 + 청년마을
  | "journey"      // 여정 — 다녀온 지역·적합도·리포트
  | "simulation"   // 시뮬레이션 — 옛 home 탭 흐름 그대로
  | "letter"       // 편지 — 인박스
  | "profile"      // 내 정보 — 프로필
  | "booking";     // 예약 — hidden, CTA로만 도달 (BottomNav 미노출)
```

`booking` 탭이 active일 땐 `visibleActive()` 가 `discover` 로 매핑해 BottomNav가 발견을
강조하도록 → "둘러보기 카테고리" 라는 의미적 연결 유지.

### 중앙 버튼

- 64px 주황 원형, 흰 테두리 3px, 그림자 `0 10px 22px -6px rgba(255,112,67,0.65)`
- 텍스트는 원 안에 "시뮬/레이션" 두 줄. 원 밖 중복 라벨 제거(접근성은 `aria-label`로 보존)
- `-mt-11`(약 44px) 위로 솟아오름 — 다른 탭 아이콘 baseline보다 위에 떠있는 느낌

### App.tsx 라우팅 영향
- 옛 `setTab("home")` → `setTab("simulation")` 일괄 rename
- 옛 `setTab("community")` → `setTab("discover")` 일괄 rename
- `Tab3Route` 값도 `"community"` → `"discover"` 로 통일

---

## 2. 발견 탭 — DiscoverScreen

**파일**: `frontend/src/screens/DiscoverScreen.tsx` (신규)

커뮤니티(`CommunityScreen`)와 청년마을(`BookingScreen`)을 한 탭으로. 상단에 부유하는
토글 pill로 서브 전환.

```
─────────────────────────
   [이야기 ●] [청년마을]    ← fixed top-3, z-50
─────────────────────────
   (CommunityScreen 또는 BookingScreen 본문이 그대로 렌더)
```

### subTab 상태

```ts
type DiscoverSubTab = "stories" | "residences";
const [discoverSubTab, setDiscoverSubTab] = useState<DiscoverSubTab>("stories");
```

### 청년마을 → 상세 → 뒤로 흐름

1. 청년마을 카드 탭 → `setTab("booking")` + `setTab4Route("booking-detail")`
2. BookingDetailScreen 노출 (탭이 booking으로 잠시 전환, 단 BottomNav는 발견 강조 유지)
3. ← 뒤로 → `setTab4Route("booking")` + `setDiscoverSubTab("residences")` + `setTab("discover")`
4. 다시 발견 탭의 청년마을 리스트로 복귀

이주 리포트 CTA(`{region} 진짜로 가보는 건 어때요? →`)도 같은 경로로 도달.

---

## 3. 내 정보 탭 — ProfileScreen

**파일**: `frontend/src/screens/ProfileScreen.tsx` (신규)

여정 탭에 있던 ProfileCard를 분리. 사용자 요청 "**1+3+5**" 구성. 누적 한눈에(2번)는
여정 탭과 역할이 겹쳐 의도적으로 뺌.

```
┌──────────────────────────────┐
│ PROFILE · 내 정보             │
│                                │
│ ① 정체성 카드 (ProfileCard)   │
│   닉네임 + 자세 + 본 지역      │
│                                │
│ 자세·환경 상세                  │
│  나의 자세: 산책자형            │
│  어울리는 환경: 산사람형         │
│                                │
│ 내가 골랐던 답                  │
│  [고요함] [회복] [성장]         │
│  풍경의 하루: 혼자 카페에서...   │
│  힐링이란: 완전한 고요...        │
│                                │
│ ③ 좋아요한 청년마을             │
│  🌿 강화도 · 청풍 · 4박 5일  › │
│  🍃 영월 · 김삿갓마을 · ...   › │
│                                │
│ ⑤ 설정 / 취향 설문 다시 하기   │
└──────────────────────────────┘
```

### 영속화 추가

- `bookingLiked` → `cheongpung.bookingLiked.v1` (옛엔 in-memory만)
- `profile.onboarding` (가치 칩·풍경·힐링 raw 답변) → 기존 PROFILE_KEY에 함께 저장. 옛
  저장값에 없으면 해당 섹션만 자연스럽게 생략

### 동작
- 좋아요한 청년마을 카드 탭 → BookingDetailScreen (발견 탭 강조 유지)
- ↻ 취향 설문 다시 → `window.confirm` 확인 후 `cheongpung.reset()` 호출
- ⚙️ 설정 → 기존 SettingsScreen (현재 journey 탭 sub-route라 살짝 어색, 다음 PR에서 이동)

---

## 4. 찐 홈 — ResidenceHomeScreen

**파일**: `frontend/src/screens/ResidenceHomeScreen.tsx` (신규)

사용자 요청: 야매 홈(서울 본가)은 그대로 두고, 레지던스에 "입장"한 직후부터의 화면을
별개로 만들기. "지금 거기 있다" 느낌의 일상 톤.

### 흐름

```
[Departure] → [Traveling] → [Arrival]
                                ↓ "레지던스 들어가기 →" (라벨 변경)
[ResidenceHomeScreen] ← NEW Tab1Route "residence-home"
                                ↓ "오늘 할 일" 카드
[MissionList → MissionExecute → …]
```

ArrivalScreen CTA `{region} 알아보기 →` → **`레지던스 들어가기 →`** 로 변경.
`onStartMissions` 가 `mission-list` 대신 `residence-home` 으로 라우팅.

### 구성

```
[풀스크린 배경 — home.png / home_yeongwol.png 등]
[하단 마스크 — 가독성 위해 그라데이션]

상단:
오후 · DAY 2 / 5
{닉네임}님, 영월의 오후, 한가운데에 있어요

(중앙 — 풍경 잘 보이게 비움)

하단:
[🗺] 오늘 할 일
     오늘 3개 더 둘러볼 수 있어요
     1/4 완료                       →

← 서울로 돌아가기 (작은 텍스트 버튼)
```

### 시간대 — `pickTimeOfDay()`

실제 시간 기준으로 헤더 카피·라벨 분기:
- 5–11시 → 아침
- 11–17시 → 오후
- 17–21시 → 저녁
- 21–5시 → 밤

각 시간대마다 환영 카피 다름 ("아침이에요" / "오후, 한가운데에 있어요" 등).

### 데이터
- `currentDay`, `dayCount` (buildDayPlan)
- 오늘 일차 미션 = `missionsByDay[currentDay - 1]`
- 완료 개수 = 그 중 `currentCompletedIds`에 포함된 것

### 자산
- `frontend/public/home.png` — 본 지역(서울) 풍경, HomeScreen 배경으로 함께 사용
- `frontend/public/home_yeongwol.png` — 영월 도착 화면
- `frontend/public/character1/home/home_ganghwa.png` — 강화도 (기존)

---

## 5. 편지함 — Letter 시스템

**파일 (3개)**:
- `frontend/src/data/letters.ts` (신규, 모델 + 팩토리 + 영속)
- `frontend/src/screens/LetterScreen.tsx` (신규, UI)
- `frontend/src/App.tsx` (트리거 연결 + BottomNav 배지)

사용자 요청: NPC 마을 주민·시스템·다른 사용자의 알림을 모두 모은 인박스.
처음 본 사용자도 잘 인지하도록 구조 설계.

### 설계 원칙

- **하나의 인박스에 시각으로만 구별** — 카테고리 별로 시각 톤 다름:
  - 🌿 NPC 편지 (warm 주황 톤) — 마을 운영자·주민
  - 🌬 시스템 알림 (cool 초록 톤) — 청풍 운영팀
  - 🌸 커뮤니티 소식 (pink 톤) — 다른 사용자
- **필터 칩**으로 카테고리 빠른 전환 (전체 / 편지 / 알림 / 소식)
- **unread 빨간 점** + BottomNav 편지 아이콘에 배지 (9+ 까지)
- 카드 탭 → 바텀시트로 본문 + "잘 읽었어요" CTA

### 데이터 모델

```ts
type Letter = {
  id: string;
  category: "npc" | "system" | "community";
  trigger:
    | "welcome" | "arrival" | "day_complete" | "next_day"
    | "report" | "booking_confirmed" | "community";
  sender: { name; role?; emoji? };
  title; preview; body;
  createdAt; read; residenceId?;
};
```

영속: `cheongpung.letters.v1`. 첫 진입자는 환영 편지 시드.

### 자동 트리거

| 시점 | 편지 제목 | 발신자 | 카테고리 |
|---|---|---|---|
| 첫 진입(시드) | 청풍에 오신 걸 환영해요 | 청풍 운영팀 (🌬) | system |
| 레지던스 들어가기 | {region}에 오신 걸 환영해요 | 지역 운영자 (민지/지호/...) | npc |
| 일차 모든 미션 완료 (advance day 시) | 오늘 하루 잘 보내셨어요 | 지역 운영자 | npc |
| 다음 일차 시작 (advance day 시) | {region}의 아침이에요 | 지역 운영자 | npc |
| 이주 리포트 처음 생성 | 그 시간이 어땠나요 | 먼저 온 이주자 (👩) | npc |
| 예약 확정 (booking-form 제출) | {region} {name} 예약이 확정됐어요 | 청풍 운영팀 | system |

지역 운영자 매핑 — `RESIDENCE_REP`:
- ganghwa → 민지 (🌿)
- yeongwol → 지호 (🍃)
- gwangyang → 수민 (🌸)
- geoje → 유진 (🌊)
- taean → 도윤 (🏝)
- yangyang → 서연 (🏄)
- jindo → 한나 (🍵)
- uiseong → 재현 (🌾)

### 톤

본문은 청풍 비전("쌓이다·머무르다·자리잡다") 어휘 우선, 1인칭, 마크다운 없음. 평가
어휘 금지. 따뜻하고 가벼운 안부 톤.

### 중복 트리거 방지

- 레지던스 환영 편지: 같은 `residenceId` + `arrival` trigger가 이미 있으면 추가 X
- 이주 리포트 편지: `migrationReport` 캐시 처음 생성될 때만 (재시청 시 추가 X)

### LetterScreen UI

```
HEADER
  Inbox · 편지함
  받은 편지              [모두 읽음]
  새 편지 N통

FILTERS
  [전체 N] [편지 N] [알림 N] [소식 N]

CARDS
  ║ avatar    sender name · role     [● unread dot]
  ║           title (bold)
  ║           preview... (1줄 truncate)
  ║           10분 전
  ↑ 좌측 굵은 컬러 줄(주황/초록/핑크) — 카테고리 시각 표시
```

탭 → 바텀시트:
```
        ●●●● 핸들
  [avatar]  sender name              [category chip]
            sender role

  title (h3)
  10분 전

  본문 본문 본문 ... (max-h-[55vh] 스크롤)

  [잘 읽었어요]
```

### BottomNav 배지

편지 아이콘 우상단에 작은 주황 원 + unread 개수 (`9+` 클램프).

```tsx
<BottomNav active={tab} onChange={handleTabChange} letterUnread={unreadCount(letters)} />
```

---

## 6. 부수 다듬기

### Gemini API 폴백 (`data/migrationReport.ts`)

이주 리포트 AI 호출이 Gemini 우선 → Claude 폴백 → 정적 템플릿 순.
- `callGemini()` 신규 — `gemini-2.0-flash` 기본, `VITE_GEMINI_MODEL` env 로 override 가능
- 에러 reason을 콘솔에 로그해서 디버깅 쉽게
- `.env.local`에 `VITE_GEMINI_API_KEY=AIzaSy...` 한 줄로 동작

> 단 Gemini API 키는 `AIzaSy` 로 시작해야 함. `AQ.` 시작 토큰은 OAuth 토큰이라 거부됨
> (이번 세션에서 직접 학습).

### 베이지 띠 / pb-24 / 시뮬레이션 원 위치

이슈: BottomNav 위에 fixed cream 띠가 보이고 스크롤 따라가지 않음.

원인 두 가지가 합쳐짐:
1. `<main>` 의 `pb-24`(96px 바닥 padding)가 BottomNav 위에 항상 cream 띠를 만듦. 각 스크린이
   이미 자체 height 잡고 있어서 중복.
2. body bg(`#f3ece2`)와 Tailwind `bg-cream`(`#FFF8F0`)이 다른 톤이라 그라데이션 끝부분
   `to-nature-50`(연두)과 body가 만나는 경계에서 띠 노출.

수정:
- `<main className="min-h-screen pb-24">` → `<main className="min-h-screen">`
- body bg `#f3ece2` → `#fff8f0` (Tailwind cream과 일치)
- 화면 wrapper의 `bg-gradient-to-b from-cream via-cream to-nature-50` → `bg-cream` 단일

시뮬레이션 원 위치는 `-mt-8`(32px) → `-mt-11`(44px). 약 1.3배 elevation.

---

## 다음 단계 후보

- **다음 일차 알람을 진짜 시간 기반으로** — 현재는 일차 진행 시 즉시 두 통(완료+다음 날)
  보냄. 실제 시간 흐름 따라 다음 날 아침에 도착하는 식으로 분리하면 더 자연스러움
- **커뮤니티 편지 mock → 실제 연결** — 백엔드/Supabase 연결 시
- **편지 답장** — "고마워요" 한 줄 회신 기능. NPC가 다시 짧게 응답
- **편지 카테고리별 사운드/햅틱** — 도착할 때 진동/소리 분리
- **편지 → 화면 직링크** — 예약 알림에서 "예약 상세 보기" 탭하면 해당 BookingDoneScreen
  으로 점프
- **SettingsScreen을 profile 탭으로 이동** — 현재 journey 탭 sub-route라 마이페이지에서
  열면 탭이 튀는 어색함 해소
