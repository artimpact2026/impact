# DESIGN SYSTEM

> '바람을 짓다' v2.1 디자인 토큰 & 컴포넌트 가이드
>
> 📌 코드 예시의 주석은 모두 영문입니다 (CLAUDE.md 가이드 참조).
> 🆕 v2.1: **앱 전체는 그린이 메인 컬러**(배경·맵·UI), **블루와 주황은 캐릭터 전용 컬러**로 역할을 분리했습니다.
> 홈 화면은 **진행 맵(Journey Map)** 컨셉으로 바꿨습니다 (토스뱅크 만보기 초록 배경 · 당근마켓 캐릭터 톤 참고).

---

## 1. 디자인 철학

| 키워드 | 의미 |
|--------|------|
| **고요함** | 시각적 노이즈 최소화, 여백 풍부, 부드러운 그라데이션 배경 |
| **따뜻함** | 파스텔 그린 배경 위에 블루·주황 캐릭터가 살아나는 색감 |
| **친근함** | 둥근 원 안의 캐릭터, 토스/당근처럼 말 거는 듯한 카피 |
| **유희** | 캐릭터 표정, 진행 맵을 따라 걷는 모션, 리워드 연출 |

> ❌ 피해야 할 톤: 차가운 기업형, 정보 과밀, 형광 컬러, 메탈릭, 베이지/우드 위주의 무거운 톤

---

## 2. 컬러 시스템

> **v2.1 핵심 변경:** **그린을 앱의 메인 컬러**로 삼습니다 (배경·맵·UI·CTA). **블루와 주황은 캐릭터 전용 컬러**로,
> 그린 배경 위에서 캐릭터(바람이=블루, 지음이=주황)가 또렷하게 도드라지도록 설계합니다.
> 채도는 토스뱅크·당근마켓 캐릭터 수준의 "부드럽지만 또렷한" 파스텔을 기준으로 합니다.

### 2.1. 컬러 토큰 (CSS Variables)

```css
/* tokens/colors.css */

:root {
  /* === Primary (Green) - App main: backgrounds, map, UI, CTA === */
  --color-primary-50:  #EFF7EF;
  --color-primary-100: #D8ECD7;
  --color-primary-200: #B2D9AF;
  --color-primary-300: #88C285;
  --color-primary-400: #62AC60;  /* Brand primary (app main) */
  --color-primary-500: #468C46;  /* Hover state */
  --color-primary-600: #336A35;  /* Pressed state */

  /* === Character: Blue (바람이) === */
  --color-baram-50:  #EEF6FB;
  --color-baram-100: #D6EAF5;
  --color-baram-200: #AED6EC;
  --color-baram-300: #82BEDD;
  --color-baram-400: #5BA6CE;  /* Baram main (costume / theme) */
  --color-baram-500: #3E89B3;
  --color-baram-600: #2C6A8F;

  /* === Character: Orange (지음이) === */
  --color-jieum-50:  #FFF3E9;
  --color-jieum-100: #FFE0C6;
  --color-jieum-200: #FFC089;
  --color-jieum-300: #FFA255;
  --color-jieum-400: #FF8A30;  /* Jieum main (costume / theme, Daangn-like) */
  --color-jieum-500: #ED7113;
  --color-jieum-600: #C75A06;

  /* === Neutral === */
  --color-bg:          #F1F7F0;  /* Base page background (soft green tint) */
  --color-surface:     #FFFFFF;  /* Card / elevated surface */
  --color-border:      #E0E8DD;
  --color-text:        #232A2E;  /* Primary text */
  --color-text-sub:    #5B6770;  /* Secondary text */
  --color-text-muted:  #9AA6AD;  /* Disabled / placeholder */

  /* === Map gradient (home journey map background) === */
  --map-sky-top:    #C8E8D8;  /* Soft mint sky (top) */
  --map-mid:        #9FD6A8;  /* Mid green */
  --map-green-near: #7FC98C;  /* Foreground green hills */
  --map-path:       #FFFFFF;  /* Journey path stroke */

  /* === Region Colors (ArtMap painting) === */
  --region-ganghwa:    #7FC98C;
  --region-geoje:      #88C285;
  --region-gwangyang:  #B2D9AF;
  /* Extend per region as needed */

  /* === Semantic === */
  --color-success: #62AC60;
  --color-warning: #FF8A30;
  --color-error:   #E06A5A;
  --color-info:    #5BA6CE;
}
```

### 2.1.1. 캐릭터 컬러 별칭 (편의)

```css
:root {
  /* Semantic aliases so component code reads clearly */
  --color-character-baram: var(--color-baram-400);   /* Blue */
  --color-character-jieum: var(--color-jieum-400);   /* Orange */
}
```

### 2.2. 컬러 사용 원칙
- **메인 액션 / 주요 UI / CTA:** `--color-primary-400` (그린)
- **호버:** `--color-primary-500` / **비활성:** `--color-primary-100` + 텍스트 `--color-text-muted`
- **배경 · 맵 · 진행 · 게이지:** 그린 계열 (`--color-bg`, `--map-*`, `--color-primary-*`)
- **블루(`--color-baram-*`) · 주황(`--color-jieum-*`)은 원칙적으로 캐릭터 영역 전용**: 캐릭터 의상·아바타 테마·말풍선·캐릭터가 주도하는 요소(예: 바람이 추천 카드 = 블루 톤, 지음이 = 주황 톤)
- **배경:** 항상 `--color-bg` (순백 사용 금지, 카드만 `--color-surface`)
- **역할 분리 원칙:** 그린 = 앱(면·구조·동작), 블루/주황 = 캐릭터(정체성). UI 버튼이나 일반 배지에 캐릭터 색을 쓰지 않습니다 — 캐릭터 색이 보이면 "여기에 캐릭터가 관여한다"는 신호가 되도록 유지.
- **예외 — 의미색(semantic):** 경고/에러 등은 `--color-warning`(주황 계열)·`--color-error`를 그대로 사용. 단, 캐릭터 주황 토큰(`--color-jieum-*`)과는 구분해서 의도를 명확히.

### 2.3. 캐릭터 컬러 가이드 🆕
> 토스뱅크 · 당근마켓 캐릭터처럼 "채도 높은 파스텔 + 둥근 원형 프레임" 톤.
> 그린 배경 위에서 블루/주황 캐릭터가 또렷하게 도드라지는 것이 핵심.

- **바람이 (블루):** `--color-baram-400` 베이스 의상, 흰 원형 프레임. 호기심 많은 탐험가형
- **지음이 (주황):** `--color-jieum-400` 베이스 의상, 흰 원형 프레임. 따뜻한 관찰자형
- **원형 프레임:** 흰색 링(`--map-path`) + 부드러운 그림자 (`--shadow-md`). 맵 노드/아바타 공통
- **표정:** 눈·볼 위주의 단순화된 표정, 라인 최소화 (수채화풍 면 채색)
- **배경 대비:** 캐릭터는 항상 그린 계열 면 위에 놓여 보색에 가까운 대비로 시선을 끌게 함

---

## 3. 타이포그래피

### 3.1. 폰트 패밀리

```css
:root {
  /* Body font: clean, neutral, optimized for Korean + Latin */
  --font-sans: 'Pretendard Variable', 'Pretendard',
               -apple-system, BlinkMacSystemFont, system-ui, sans-serif;

  /* Display/serif font: emotional copy accent (e.g. tagline, results) */
  --font-serif: 'RIDIBatang', 'Nanum Myeongjo', serif;
}
```

- **본문 / 숫자 강조(걸음 수 등):** Pretendard
- **감성 카피 / 결과 메시지:** RIDIBatang (세리프)

### 3.2. 타입 스케일

```css
:root {
  /* Format: size / line-height / weight */
  --text-display: 28px / 1.3 / 700;   /* App tagline "바람을 짓다." */
  --text-metric:  40px / 1.1 / 800;   /* 🆕 Big number on map (e.g. "3,674걸음") */
  --text-h1:      24px / 1.35 / 700;  /* Page main title */
  --text-h2:      20px / 1.4 / 600;
  --text-h3:      18px / 1.4 / 600;
  --text-body:    15px / 1.6 / 400;   /* Default body */
  --text-sub:     13px / 1.5 / 400;   /* Secondary description */
  --text-caption: 12px / 1.4 / 400;   /* Caption / label / node label */
  --text-button:  15px / 1 / 600;
}
```

### 3.3. 사용 예

```tsx
// User-facing copy stays in Korean; class names are English (Tailwind)
<h1 className="text-h1 font-serif">조용히 영글어가는 당신의 세계</h1>
<p className="text-body text-sub">설명 텍스트입니다.</p>

// Big metric on the journey map
<span className="text-metric">3,674</span>
<span className="text-sub">걸음</span>
```

---

## 4. 간격 & 레이아웃

### 4.1. Spacing 토큰

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;   /* Default */
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

### 4.2. 화면 여백
- **모바일 좌우 여백:** `--space-5` (20px)
- **섹션 간 여백:** `--space-8` (32px)
- **카드 내부 패딩:** `--space-4` (16px)

### 4.3. Radius

```css
:root {
  --radius-sm:   6px;
  --radius-md:   12px;   /* Default card */
  --radius-lg:   20px;   /* Large card, modal */
  --radius-xl:   28px;   /* 🆕 Pill node label, big metric card */
  --radius-full: 9999px; /* Chip, round button, character frame */
}
```

### 4.4. Elevation (Shadow)

```css
:root {
  --shadow-sm: 0 1px 2px rgba(35, 42, 46, 0.04);
  --shadow-md: 0 4px 12px rgba(35, 42, 46, 0.06);
  --shadow-lg: 0 12px 32px rgba(35, 42, 46, 0.08);
  /* 🆕 Soft glow for orange reward elements */
  --glow-reward: 0 0 20px rgba(255, 138, 48, 0.35);
}
```

---

## 5. 모션 가이드

### 5.1. 기본 Easing

```css
:root {
  /* Default easing for most UI transitions */
  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  /* Spring-like easing for emphasis (e.g. score reveal, reward pop) */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 5.2. Duration
- **마이크로:** 150ms (탭 피드백)
- **일반:** 300ms (페이드, 슬라이드)
- **강조:** 500ms (스탯 카운트업, 걸음 수 카운트업, 결과 컷)
- **장면 전환:** 700ms (Scene → Scene)
- **🆕 맵 캐릭터 이동:** 800~1200ms (path 따라 노드로 이동, `--ease-in-out`)

### 5.3. Framer Motion 예시

```tsx
// Character moving along the journey map path
<motion.g
  initial={{ offsetDistance: '0%' }}
  animate={{ offsetDistance: '100%' }}
  transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
  style={{ offsetPath: `path('${pathD}')` }}
>
  {/* Character avatar node */}
</motion.g>

// Reward (orange) pop
<motion.div
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
>
  {/* Reward ticket / badge */}
</motion.div>
```

---

## 6. 컴포넌트 라이브러리

### 6.1. Button

```typescript
type ButtonProps = {
  variant: 'solid' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
};
```

**Variants:**
- **Solid:** `--color-primary-400` background + white text
- **Outline:** Transparent background + `--color-primary-400` border
- **Ghost:** Transparent, `--color-primary-50` on hover
- **🆕 Reward(solid):** 리워드 받기 CTA. 기본은 그린 `--color-primary-400`. 캐릭터가 직접 권하는 맥락이면 해당 캐릭터 색(`--color-jieum-400` 등) + `--glow-reward` 허용

**Sizes:**
- sm: 36px height, `--text-sub`
- md: 44px height, `--text-button` (default)
- lg: 52px height, `--text-button` (primary CTA)

---

### 6.2. Card

```typescript
type CardProps = {
  variant: 'default' | 'highlighted' | 'image' | 'metric';
  padding?: 'sm' | 'md' | 'lg';
  selected?: boolean;
};
```

- Default radius `--radius-md`
- When selected: blue border + subtle shadow
- 🆕 `metric`: 큰 숫자(걸음/포인트) 표시용. 좌측 라벨 + 우측 chevron, 흰 배경 + `--shadow-md`

---

### 6.3. Chip

```typescript
type ChipProps = {
  selected?: boolean;
  removable?: boolean;
  onClick?: () => void;
};
```

- Height 32px, radius `--radius-full`
- Selected: `--color-primary-100` bg + `--color-primary-600` text
- Unselected: `--color-bg` + border

---

### 6.4. ChoiceCard 🆕 (시뮬레이션 전용)

```typescript
/** A single choice presented in a simulation scene. */
type ChoiceCardProps = {
  emoji?: string;        // '😊', '🤔', '😣'
  text: string;          // The choice text (Korean, user-facing)
  onSelect: () => void;
  disabled?: boolean;
};
```

- Full width, height `auto` (minimum 64px)
- Left: emoji (24px), middle: text, right: chevron
- On tap: blue highlight → fade out (300ms)

---

### 6.5. CharacterAvatar 🆕

```typescript
/** Renders the selected character (Baram or Jieum) in a round frame. */
type CharacterAvatarProps = {
  character: 'baram' | 'jieum';
  size: 'sm' | 'md' | 'lg' | 'xl';
  pose?: 'default' | 'wave' | 'happy' | 'thinking';
  framed?: boolean;   // 🆕 white circular ring frame (map node style)
};
```

**Size:**
- sm: 32px (status bar, card label)
- md: 64px (recall card, map node)
- lg: 128px (greeting screen)
- xl: 256px (character select, result screen)

- 🆕 `framed`: 흰색 원형 링 + `--shadow-md`. 진행 맵 위 캐릭터/노드에 사용 (토스·당근 캐릭터 프레임 톤)

---

### 6.6. Gauge 🆕

```typescript
/** Visual progress bar for stats and scores. */
type GaugeProps = {
  value: number;       // 0-100
  max?: number;
  label?: string;
  color?: 'primary' | 'baram' | 'jieum';
  showNumber?: boolean;
  animate?: boolean;   // Count-up animation on mount
};
```

- Horizontal gauge: 8px height, rounded
- 진행/성장 게이지는 기본 `primary`(그린). 캐릭터별 스탯을 표시할 때만 `baram`(블루)/`jieum`(주황) 사용

---

### 6.7. Stepper

```typescript
type StepperProps = {
  steps: string[];   // e.g. ['Basic Info', 'Values', 'Future']
  current: number;   // 0-based
};
```

- Active: filled `--color-primary-400` + emphasized label
- Completed: `--color-primary-200` + check icon
- Pending: `--color-border`

---

### 6.8. Modal

```typescript
type ModalProps = {
  open: boolean;
  onClose: () => void;
  size: 'sm' | 'md' | 'fullscreen';
  blurBackdrop?: boolean;
};
```

- Fullscreen modal used for residency proposal / recall
- Radius `--radius-lg`
- Close button fixed at top-right

---

### 6.9. Toast

```typescript
type ToastProps = {
  message: string;
  /** 'reward' triggers a sparkle motion for stat-change feedback. */
  type?: 'info' | 'success' | 'reward';
  duration?: number;  // Default 2000ms
};
```

- 'reward' type: subtle sparkle motion. 기본 그린(`--color-primary-400`), 스탯 변동을 캐릭터가 알릴 땐 해당 캐릭터 색

---

### 6.10. JourneyMap 🆕⭐ (홈 메인 — 기존 ArtMap 대체/통합)

```typescript
/** The main journey map on the home screen.
 *  Pastel blue→green gradient hills with a winding path and milestone nodes. */
type JourneyMapProps = {
  nodes: MapNode[];
  currentProgress: number;       // e.g. steps or completion %
  character: 'baram' | 'jieum';
  onNodeTap: (nodeId: string) => void;
};

type MapNode = {
  id: string;
  label: string;                 // e.g. '6,000걸음'
  position: number;              // 0-1 along the path
  status: 'locked' | 'reachable' | 'reached';
  dotColor?: 'green' | 'baram' | 'jieum';  // green=default milestone, baram/jieum=character node
  avatarUrl?: string;            // friend/teammate avatar in a circle node
};
```

- **배경:** `--map-sky-top` → `--map-mid` → `--map-green-near` 세로 그라데이션 (그린 톤 언덕)
- **경로(path):** 흰색(`--map-path`) 부드러운 곡선, 살짝 그림자/글로우
- **노드:** path 위 마일스톤. 기본 닷은 그린(`green`), 캐릭터가 놓인 노드만 블루(`baram`)/주황(`jieum`)
- **현재 위치:** 선택한 캐릭터 아바타가 path 끝(현재 진행점)에 `framed`로 표시 — 그린 배경 위 블루/주황 캐릭터가 자연스럽게 시선 집중
- **노드 라벨:** pill 형태(`--radius-xl`), 반투명 다크 또는 화이트 배경
- **인터랙션:** 노드 탭 → 상세/회고 모달, 진행 시 캐릭터가 path 따라 이동 (5.2 참고), 핀치 줌/팬 지원

---

### 6.11. MapNodeLabel 🆕

```typescript
/** Pill label attached to a journey map node. */
type MapNodeLabelProps = {
  text: string;
  emphasis?: boolean;            // milestone (e.g. '200,000 steps') gets white bg
};
```

- 기본: 반투명 다크(`rgba(35,42,46,0.6)`) + 화이트 텍스트
- emphasis: 흰 배경 + `--color-text` + `--shadow-sm` (큰 마일스톤 강조)

---

### 6.12. StampPin 🆕

```typescript
/** A pin placed on the map at residency / milestone locations. */
type StampPinProps = {
  character: 'baram' | 'jieum';
  variant: 'empty' | 'basic' | 'gold';
  position: { x: number; y: number };  // SVG coordinate
};
```

- empty: dashed outline circle
- basic: character face + outline
- gold: + warm glow(`--glow-reward`) + star mark

---

### 6.13. RewardTicket 🆕 (포인트/복권 리워드)

```typescript
/** Tap-to-claim reward shown on the map (e.g. lottery ticket, point badge). */
type RewardTicketProps = {
  kind: 'lottery' | 'point' | 'badge';
  claimable: boolean;
  onClaim: () => void;
};
```

- 티켓/뱃지 베이스는 그린(`--color-primary-400`) 또는 따뜻한 골드 글로우(`--glow-reward`)로 강조. 캐릭터가 직접 건네는 연출이면 해당 캐릭터 색 허용
- 등장: spring pop (5.3), claim 시 sparkle + 포인트 카운트업
- 보조 말풍선 예: `눌러서 복권 받기`, `오늘이 지나면 사라져요`

---

### 6.14. SceneIllustration 🆕

```typescript
/** Fullscreen illustration shown during a simulation scene. */
type SceneIllustrationProps = {
  sceneId: string;                                // Scenario scene ID
  timeOfDay: 'morning' | 'noon' | 'evening';
  character: 'baram' | 'jieum';
  characterPose?: string;
};
```

- Fullscreen illustration (640x960 recommended ratio)
- Slight color overlay per time of day

---

## 7. 아이콘 시스템

- **라이브러리:** Lucide React (라인 아이콘)
- **사이즈:** 16 / 20 / 24 / 32px
- **색상:** 컨텍스트에 따라 `currentColor`
- **이모지 사용 가이드:** 감정 표현(선택지)에만 사용. UI 라벨에는 사용 자제.

---

## 8. 일러스트 에셋 가이드

### 8.1. 캐릭터
> 토스뱅크 · 당근마켓 캐릭터 톤: 채도 높은 파스텔 + 둥근 면 채색 + 단순 표정 + 원형 프레임.

- **바람이 (블루):** 짧은 머리 + 모자, 밝은 표정. **파스텔 블루**(`--color-baram-*`) 톤 의상. 호기심 많은 탐험가형
- **지음이 (주황):** 단발머리, 가디건, 차분한 표정. **따뜻한 주황**(`--color-jieum-*`) 톤 의상. 따뜻한 관찰자형
- **포즈 변형:** default / wave / happy / thinking / surprised / sad (최소 6종)
- **프레임:** 맵·아바타 노출 시 흰색 원형 링 + 그림자 기본
- **배경 분리:** 캐릭터는 그린 앱 배경 위에 놓이므로, 의상은 그린과 충분히 대비되는 블루/주황 채도를 유지 (그린 의상은 배경에 묻히므로 지양)

### 8.2. 씬 일러스트
- 비율: 2:3 (640x960)
- 스타일: 수채화풍, 라인 강조 없음, 파스텔 그린 톤 배경 친화
- 캐릭터 슬롯: 일러스트 내 자연스러운 위치에 배치 가능 (블루/주황 캐릭터가 그린 씬 위에서 도드라지게)

### 8.3. 진행 맵(JourneyMap) 에셋 🆕
- 배경 언덕: 파스텔 그린 세로 그라데이션 (밝은 민트 하늘 → 진한 그린 전경 언덕)
- path: 흰색 곡선 1개, 부드러운 그림자
- 나무/구름 등 오브제: 저채도 그린/화이트, 면 채색, 라인 없음
- 노드 닷: 기본 그린, 캐릭터 노드만 블루/주황

### 8.4. 파일 명명 규칙

```
assets/
├── characters/
│   ├── baram_default.svg
│   ├── baram_wave.svg
│   └── jieum_happy.svg
├── map/
│   ├── journey_bg_gradient.svg
│   ├── journey_path.svg
│   └── tree_soft.svg
└── scenes/
    ├── ganghwa_minbak_morning.svg
    └── ganghwa_market_noon.svg
```

---

## 9. 다크모드

> v2.1에서는 **라이트모드만 지원**. 다크모드는 v2.2+ 검토.

---

## 10. 접근성

- 모든 버튼: 최소 터치 영역 44x44px
- 컬러 대비: WCAG AA (4.5:1 이상) — 특히 파스텔 그린 배경 위 텍스트는 `--color-text` 또는 다크 pill 배경 사용
- 캐릭터 색(블루/주황)은 색만으로 정보 전달 금지 (아이콘/텍스트 병기)
- 포커스 링: `--color-primary-400` 2px outline
- 이미지 alt 속성 필수

---

## 11. Tailwind 설정 매핑 (참고)

`tailwind.config.js`에서 CSS 변수를 매핑:

```js
// tailwind.config.js
// Map CSS variables to Tailwind utility classes
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50:  'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
        },
        baram: {
          50:  'var(--color-baram-50)',
          100: 'var(--color-baram-100)',
          200: 'var(--color-baram-200)',
          300: 'var(--color-baram-300)',
          400: 'var(--color-baram-400)',
          500: 'var(--color-baram-500)',
          600: 'var(--color-baram-600)',
        },
        jieum: {
          50:  'var(--color-jieum-50)',
          100: 'var(--color-jieum-100)',
          200: 'var(--color-jieum-200)',
          300: 'var(--color-jieum-300)',
          400: 'var(--color-jieum-400)',
          500: 'var(--color-jieum-500)',
          600: 'var(--color-jieum-600)',
        },
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        text: {
          DEFAULT: 'var(--color-text)',
          sub: 'var(--color-text-sub)',
          muted: 'var(--color-text-muted)',
        },
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        serif: 'var(--font-serif)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
};
```

---

## 12. v2.0 → v2.1 변경 요약 🆕

| 항목 | v2.0 | v2.1 |
|------|------|------|
| 메인 컬러 | 파스텔 그린 | **파스텔 그린 유지** (앱 전체: 배경·맵·UI·CTA) |
| 캐릭터 컬러 | 그린/우드톤 | **블루=바람이, 주황=지음이** (캐릭터 전용으로 분리) |
| 색 역할 | 그린 단일 | **그린=앱 / 블루·주황=캐릭터** 도메인 분리 |
| 배경 | 베이지(`#FAF8F4`) | 소프트 그린(`#F1F7F0`) + 그린 맵 그라데이션 |
| 포인트/리워드 | 골드 옐로 | 그린 베이스 + 따뜻한 골드 글로우(`--glow-reward`) |
| 홈 메인 | 흑백 한국 지도 ArtMap | **JourneyMap**(그린 언덕 + path + 노드) |
| 캐릭터 프레임 | — | 흰색 원형 링 + 그림자 (토스·당근 톤) |
| 토큰 | `green`/`orange` | `baram`(블루)/`jieum`(주황) 캐릭터 토큰 |
| 신규 컴포넌트 | — | `JourneyMap`, `MapNodeLabel`, `RewardTicket` |

---

문서 버전: DESIGN_SYSTEM v2.1 (프로젝트 v2.0 기준, 브랜드 리컬러)
최종 수정일: 2026-05-25
