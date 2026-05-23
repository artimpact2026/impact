# 🎬 로드뷰 자산 수집 가이드 — 팀원용

> **목적**: 미션 이동 화면(MissionTravelingScreen)에서 사용자가 화살표를 눌러 한 칸씩 걸어가는 **"우리만의 로드뷰"** 를 만들기 위한 자산을 수집합니다. (네이버 로드뷰 캡처가 베이스)

## 한 줄 요약

1. **미니 로드뷰 사진** — 각 미션 **5~6장** (실제 동선 따라 출발→회전 지점→도착)
2. **도착지 로드뷰 공유링크** — 각 미션 1개 (네이버 또는 카카오)

이동 화면을 거치는 미션은 모드가 **`map-info`** 또는 **`map-dialogue`** 인 미션만 해당합니다.

## 미니 로드뷰란?

기존 4슬라이드 카드(좌우 스와이프) 대신, 사용자가 **▲ 직진 / ▶ 우회전 / ◀ 좌회전** 화살표를 눌러 한 지점씩 전진하는 방식입니다. 화살표 방향은 실제 동선의 좌·우·직진을 따라 자동으로 회전해서, 사용자가 진짜 길을 따라 걷는 느낌을 받게 됩니다.

---

## 자산 1: 미니 로드뷰 사진 (`roadviewSteps`)

### 무엇

각 미션의 **5~6 지점** 풀스크린 사진. 사용자는 화살표를 눌러 한 칸씩 걸어갑니다.

### 사진 컨셉 — 동선을 따라가며 캡처

도시 풍경을 일렬로 잡는 게 아니라, **실제 도보 경로를 따라가며** 다음 4가지 타입의 컷을 섞어 잡습니다:

| 타입 | 언제 잡나 | 예시 |
|---|---|---|
| **출발** | 시작점 (보통 레지던스 앞) | 순무민박 골목 입구 |
| **직선 풍경** | 직진 구간 중간 | 좁은 골목 한복판 |
| **회전 직전** | 갈림길 / 모퉁이가 보일 때 | 갈림길 안내 표지가 보이는 시점 |
| **회전 직후** | 방향 틀어진 뒤 첫 컷 | 우회전 후 새 길의 첫 풍경 |
| **다가옴** | 도착지가 시야에 들어옴 | 시장 간판이 멀리 보임 |
| **도착** | 도착지 정면 | 시장 입구·내부 |

> 💡 **핵심**: 회전이 일어나는 지점은 **회전 직전·직후 두 컷**을 잡아야 사용자가 "여기서 우회전이구나" 인지하게 됩니다. 회전 한 번에 두 컷이 필요한 거예요.

### 권장 구성 (5~6장)

**짧은 직선 코스 (회전 0~1번)**: 5장
```
1. 출발  →  2. 직선  →  3. 직선  →  4. 다가옴  →  5. 도착
```

**보통 코스 (회전 1번)**: 6장
```
1. 출발  →  2. 직선  →  3. 회전 직전  →  4. 회전 직후  →  5. 다가옴  →  6. 도착
```

**복잡한 코스 (회전 2번)**: 6장 — 강화풍물시장 같은 옛 골목길 케이스
```
1. 출발 (▶ 우회전)  →  2. 우회전 직후  →  3. 직선 + 좌회전 안내  →
4. 좌회전 직후  →  5. 다가옴  →  6. 도착
```

### 이렇게 적혀있긴하나, 회전 상관없이 그냥 간단하게만 해도 될듯! 정확한 방향이나 길이 중요한 게 아니라, 이 마을이 어떤지 알아보는게 중점이기때문에** 

### 어떻게 수집

1. 네이버지도에서 도보 경로 미리 확인
2. **로드뷰 진입** → 출발지부터 한 지점씩 이동하며 적절한 시점·각도 찾기
3. **각 지점에서 진행 방향이 보이게** 캡처 (다음 칸 어디로 가는지 보여야 함)
4. **스크린샷** → 워터마크·UI 잘라내기

### 사진 사양

- **포맷**: `.jpg` / `.webp` / `.png` (권장: `.webp` 또는 `.jpg`)
- **해상도**: 가로 1200px 이상 (풀스크린 모바일 기준 — 약 1200×1600 권장)
- **비율** : 가로로 할까요 세로로 할까요.? ㅠㅠ
- **저장 위치**: `frontend/public/roadview/`
- **파일명**: `{mission-id}-{1|2|3|4|5|6}.{ext}`

예시:
```
public/roadview/
  ganghwa-market-1.jpg  ← 1번 (순무민박 앞 / ▶ 우회전 안내)
  ganghwa-market-2.jpg  ← 2번 (우회전 직후 / 직진)
  ganghwa-market-3.jpg  ← 3번 (골목 안쪽 / ◀ 좌회전 안내)
  ganghwa-market-4.jpg  ← 4번 (좌회전 직후 / 직진)
  ganghwa-market-5.jpg  ← 5번 (시장 간판 보임 / 직진)
  ganghwa-market-6.jpg  ← 6번 (도착 — 시장 안)
```

### 함께 정리해야 할 메타데이터

각 사진마다 다음 세 가지를 같이 정리해서 개발팀에 넘겨주세요:

| 필드 | 설명 | 예 |
|---|---|---|
| `caption` | 짧은 위치 라벨 | "강화 읍내 진입" |
| `story` | 이 지점에서 자동으로 뜨는 NPC 한 줄 (선택, 1~2개 지점만) | "강화는 옛 도읍지라 길이 좁고 휘어요" |
| `forwardDirection` | 다음 칸으로 가는 방향: `straight` / `left` / `right` | `right` |

### 코드 반영 (개발팀이 작업)

```ts
// frontend/src/data/regionMissions.ts
roadviewSteps: [
  {
    photo: "/roadview/ganghwa-market-1.jpg",
    caption: "아삭아삭 순무민박 앞",
    story: "민박 골목 입구에서 출발해요. 우측 길로 빠지면 읍내예요.",
    forwardDirection: "right",
  },
  {
    photo: "/roadview/ganghwa-market-2.jpg",
    caption: "우회전 후 읍내 진입",
    forwardDirection: "straight",
  },
  // ...
],
```

---

## 자산 2: 도착지 로드뷰 공유링크 (`arrivalRoadviewUrl`)

### 무엇

도착 슬라이드에 떠 있는 **"🗺️ 실제 로드뷰로 확인해보기"** 버튼이 새 탭으로 여는 외부링크. 사용자는 거기서 360° 회전·확대를 하며 실제 거리뷰를 둘러봅니다.

### 네이버 vs 카카오 — 둘 다 OK

| 출처 | 링크 형식 | 장단점 |
|------|---------|--------|
| **네이버지도** | `https://naver.me/XXXXXXXX` | 거리뷰 커버리지·해상도가 더 좋음. **권장.** |
| **카카오맵** | `https://kko.to/XXXXXXXX` | 일부 지역 커버리지 우수 (제주·도서) |

코드 입장에서는 둘 다 그냥 `href`로 새 탭에 여는 거라 똑같이 작동해요. **현장 디테일 좋은 쪽을 그때그때 선택**하세요.

### 어떻게 링크 따는지

#### 네이버지도 (모바일 앱)
1. 네이버지도 앱에서 해당 장소 검색
2. **거리뷰** 아이콘 탭 → 원하는 지점·각도 잡기
3. 우상단 **공유** 버튼 → **주소 복사**
4. `https://naver.me/XXXXXXXX` 형식

#### 카카오맵 (모바일 앱)
1. 카카오맵 앱에서 해당 장소 검색
2. **로드뷰** 아이콘 탭 → 원하는 지점·각도 잡기
3. 우상단 **공유** 버튼 → **링크 복사**
4. `https://kko.to/XXXXXXXX` 형식

> 💡 **TIP**: 가능하면 도착지 정면이 잘 보이는 각도·확대 상태에서 공유하기. 사용자가 링크 열자마자 보이는 첫 화면이 그대로 거리뷰의 시작점이 됩니다.

### 코드 반영

```ts
// frontend/src/data/regionMissions.ts
arrivalRoadviewUrl: "https://naver.me/FYrqnXtu",   // 네이버
// 또는
arrivalRoadviewUrl: "https://kko.to/R4HFdMJL2_",   // 카카오
```

---

## ✅ 자산 필요한 미션 목록

이동 화면을 거치는 미션만. (모드: `map-info` / `map-dialogue`)

### 강화도 (4 중 3개)

| ID | 미션명 | 모드 | 도착지 |
|---|---|---|---|
| `ganghwa-mudflat` | 갯벌 걸어가보기 | 🗺️ map-info | 강화 갯벌 |
| `ganghwa-market` | 강화풍물시장 둘러보기 | 🗣️ map-dialogue | 강화풍물시장 |
| `ganghwa-dolmen` | 강화 고인돌 탐방 | 🗺️ map-info | 고인돌 군락 |
| `ganghwa-sunset` | 일몰 보러 가기 | 🗺️ map-info | 동막해변 |
| ~~`ganghwa-farm`~~ | 농사 체험 | 💬 dialogue | ❌ 불필요 |

### 광양 (4 중 2개)

| ID | 미션명 | 모드 | 도착지 |
|---|---|---|---|
| `gwangyang-walk` | 매화마을 산책 | 🗺️ map-info | 매화마을 산책로 |
| `gwangyang-coworking` | 코워킹 스페이스 찾기 | 🗣️ map-dialogue | 광양 코워킹 |
| ~~`gwangyang-cafework`~~ | 카페에서 일해보기 | 🔢 numeric | ❌ 불필요 |
| ~~`gwangyang-creator`~~ | 로컬 크리에이터 만나기 | 💬 dialogue | ❌ 불필요 |

### 거제도 (4 중 3개)

| ID | 미션명 | 모드 | 도착지 |
|---|---|---|---|
| `geoje-walk-sea` | 바다까지 걸어가기 | 🗺️ map-info | 거제 해변 |
| `geoje-beach` | 해수욕장 환경 체험 | 🗺️ map-info | 해수욕장 입구 |
| `geoje-fishing` | 낚시 포인트 찾기 | 🗣️ map-dialogue | 갯바위 |
| ~~`geoje-leisure`~~ | 레저 커뮤니티 만나기 | 💬 dialogue | ❌ 불필요 |

### 태안 (4 중 3개)

| ID | 미션명 | 모드 | 도착지 |
|---|---|---|---|
| `taean-sunset` | 만리포 노을 산책 | 🗺️ map-info | 만리포 해변 |
| `taean-bike` | 안면도 자전거 일주 | 🗺️ map-info | 안면도 자전거길 |
| `taean-surf` | 만리포 서핑 강습 | 🗣️ map-dialogue | 서핑 스쿨 |
| ~~`taean-community`~~ | 해변 라이프 커뮤니티 | 💬 dialogue | ❌ 불필요 |

### 영월 (4 중 3개)

| ID | 미션명 | 모드 | 도착지 |
|---|---|---|---|
| `yeongwol-stars` | 별마로 천문대 관측 | 🗺️ map-info | 별마로 천문대 |
| `yeongwol-river` | 동강 따라 걷기 | 🗺️ map-info | 동강 산책로 |
| `yeongwol-trek` | 한반도 지형 트레킹 | 🗺️ map-info | 선암마을 전망대 |
| ~~`yeongwol-elder`~~ | 산골 어르신 만나기 | 💬 dialogue | ❌ 불필요 |

### 양양 (4 중 2개)

| ID | 미션명 | 모드 | 도착지 |
|---|---|---|---|
| `yangyang-coworking` | 인구해변 코워킹 입주 | 🗣️ map-dialogue | 인구해변 코워킹 |
| `yangyang-surf-dawn` | 새벽 서핑 한 시간 | 🗺️ map-info | 새벽 서핑 포인트 |
| ~~`yangyang-cafe-work`~~ | 해변 카페 작업 | 🔢 numeric | ❌ 불필요 |
| ~~`yangyang-nomad`~~ | 양양 노마드 모임 | 💬 dialogue | ❌ 불필요 |

### 진도 (4 중 3개)

| ID | 미션명 | 모드 | 도착지 |
|---|---|---|---|
| `jindo-art` | 운림산방 한국화 감상 | 🗺️ map-info | 운림산방 |
| `jindo-market` | 진도 5일장 둘러보기 | 🗣️ map-dialogue | 진도 5일장 |
| `jindo-dog` | 진돗개 보러 가기 | 🗺️ map-info | 진돗개 시험연구소 |
| ~~`jindo-tea`~~ | 진도 다도 한 잔 | 💬 dialogue | ❌ 불필요 |

### 정선 (4 중 2개)

| ID | 미션명 | 모드 | 도착지 |
|---|---|---|---|
| `jeongseon-market` | 정선 5일장 체험 | 🗣️ map-dialogue | 정선 5일장 |
| `jeongseon-cave` | 화암동굴 탐방 | 🗺️ map-info | 화암동굴 입구 |
| ~~`jeongseon-quiet`~~ | 산속 한 시간 명상 | 💬 dialogue | ❌ 불필요 |
| ~~`jeongseon-hanok-tea`~~ | 한옥 다도 체험 | 💬 dialogue | ❌ 불필요 |

---

## ❌ 자산 불필요한 미션 (총 16개)

이동 화면을 거치지 않으므로 사진·링크 모두 필요 없어요.

| 미션 | 사유 |
|---|---|
| `cost` 생활비 시뮬레이션 | 💬 |
| `routine` 하루 루틴 체험 | 💬 |
| `neighbor` 이주민 만나기 | 💬 |
| `food` 하루 식비 기록 | 🔢 |
| `mailbox` 우편함 | 📮 |
| `final-report` 이주 결정 리포트 | 자동 |
| `ganghwa-farm` 농사 체험 | 💬 |
| `gwangyang-cafework` 카페에서 일해보기 | 🔢 |
| `gwangyang-creator` 로컬 크리에이터 | 💬 |
| `geoje-leisure` 레저 커뮤니티 | 💬 |
| `taean-community` 해변 라이프 커뮤니티 | 💬 |
| `yeongwol-elder` 산골 어르신 | 💬 |
| `yangyang-cafe-work` 해변 카페 작업 | 🔢 |
| `yangyang-nomad` 양양 노마드 모임 | 💬 |
| `jindo-tea` 진도 다도 한 잔 | 💬 |
| `jeongseon-quiet` 산속 한 시간 명상 | 💬 |
| `jeongseon-hanok-tea` 한옥 다도 체험 | 💬 |

---

## 📊 작업 수요 요약

| 타입 | 미션당 | 총 미션 수 | 합계 |
|---|---|---|---|
| 미니 로드뷰 사진 | 5~6장 | 19개 | **약 100~115장** |
| 도착 로드뷰 링크 | 1개 | 19개 | **19개** |

> 공통 미션(`hospital` / `market` / `transit` / `shop`)을 지역마다 다른 길로 보여주려면 4 × 8 = 32 미션이 추가로 들어와 사진은 약 200장 추가됩니다. **데모 단계는 위의 19개 지역 미션부터 작업**하면 충분합니다.

---

## 🚀 우선순위

### Phase 1 — 데모 시연 (5개 미션)

지금 placeholder가 박혀 있어 **가장 먼저 교체하기 좋은 미션들**:

1. `ganghwa-market` 강화풍물시장 ✅ **미니 로드뷰 데이터 골격 박힘** — 사진 6장 교체 + 회전 지점 검증만 하면 시연 가능
2. `ganghwa-mudflat` 강화 갯벌
3. `yeongwol-stars` 영월 별마로
4. `taean-sunset` 태안 만리포 노을
5. `jindo-art` 진도 운림산방

→ 사진 약 30장 + 링크 4개 (1개는 이미 있음)

### Phase 2 — 19개 지역 미션 풀 커버

→ 사진 약 100~115장 + 링크 19개

### Phase 3 — 공통 미션 지역별

각 지역별로 다른 동네 병원·시장·정류장·가게 보여주려면 추가 작업.

---

## 📦 작업 후 개발팀에 전달

1. `frontend/public/roadview/` 폴더에 사진 업로드 (또는 zip 공유)
2. **각 사진 메타데이터를 스프레드시트 한 장으로 정리**:
   ```
   mission_id        | step | photo_file                  | caption              | forward_direction | story
   ganghwa-market    | 1    | ganghwa-market-1.jpg        | 아삭아삭 순무민박 앞   | right             | 민박 골목 입구에서 출발해요.
   ganghwa-market    | 2    | ganghwa-market-2.jpg        | 우회전 후 읍내 진입    | straight          |
   ganghwa-market    | 3    | ganghwa-market-3.jpg        | 읍내 골목 갈림길      | left              | 강화는 옛 도읍지라 길이 좁고 휘어요
   ...
   ```
3. 미션별 도착지 외부 링크는 별도 시트:
   ```
   mission_id              | arrivalRoadviewUrl
   ganghwa-market          | https://naver.me/FYrqnXtu
   ganghwa-mudflat         | https://naver.me/XXXXXXX
   ...
   ```
4. 개발팀이 `frontend/src/data/regionMissions.ts`의 각 미션에 `roadviewSteps`(사진+메타 배열)와 `arrivalRoadviewUrl`(외부링크) 채워 넣음

---

## 💡 작업 시 체크리스트

### 사진 자체
- [ ] 5~6장이 **실제 동선**을 따라 자연스럽게 이어지나?
- [ ] **회전 지점은 직전·직후 두 컷**으로 잡았나?
- [ ] 각 사진에서 다음 칸 방향이 시각적으로 보이나? (모퉁이·간판 등)
- [ ] 도착 사진(마지막)에 도착지 간판·풍경이 분명히 드러나나?
- [ ] 워터마크·UI 잘 잘렸나?
- [ ] 가로 1200px 이상인가? (모바일 풀스크린이라 작으면 흐려보임)
- [ ] 파일명이 `{mission-id}-{번호}.확장자` 형식인가?

### 메타데이터
- [ ] 각 사진에 짧고 분명한 `caption` 달았나? (예 "강화 읍내 진입")
- [ ] `forwardDirection` 이 실제 동선의 회전과 일치하나?
- [ ] `story`는 1~2개 지점에만 (모든 지점에 달면 산만함). 출발지 + 인상적인 분기점에 추천

### 외부 링크
- [ ] 네이버/카카오 공유링크가 **첫 화면에 도착지가 잘 보이는 각도**로 공유됐나?
