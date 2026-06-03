# 2026-06-04 — UI 리프레시 & 마을 체류 구조

이번 작업은 크게 네 갈래로 묶여요.

## 1. 온보딩 결과 화면 — 시작 초대 문구
- `시작하기 🍃` 버튼 위에 한 줄 초대 카피 추가
  - **"잠시, 다른 지역의 바람을 짓고 와볼래요?"**
  - "살아보기 전에 먼저 살아봐요"
- 변경 파일: `frontend/src/screens/onboarding/ResultScreen.tsx`

## 2. 마을 체류 구조 도입 — "도착 = 새 홈"
도착 후 사용자가 강화도(마을) 컨텍스트에 머무를 수 있게 흐름 재구성.

| 동작 | 결과 |
|---|---|
| 도착 → 미션/하루요약 진입 후 하단 **home 탭** 탭 | 서울 홈이 아니라 **마을 홈(ArrivalScreen)**으로 |
| 마을 홈의 **"서울로 돌아가기"** 버튼 | 역방향 이동 애니메이션 → 서울 홈 |
| 본 지역 복귀 후에도 미션/점수 진행 상태 | `regionProgress`에 유지, 재방문 시 이어서 |

구조 변경:
- 새 라우트 `traveling-back` 추가
- `TravelingScreen` 일반화 — `destination`을 `RegionPos & { region }`으로 받아 양방향 재사용 (`caption` prop)
- `ArrivalScreen` props: `onBack` → `onReturnHome`, `homeRegion` 추가
- `BottomNav` "home" 탭: `selected` 존재 시 마을 홈으로 분기

변경 파일: `App.tsx`, `screens/TravelingScreen.tsx`, `screens/ArrivalScreen.tsx`, `components/arrival/RegionHeader.tsx`

## 3. 풀배경 이미지 적용
서울 홈과 강화도 마을 홈을 일러스트 풀배경으로 전환.

### 서울 홈 (HomeScreen)
- `baram_jieum.jpg` — 바람이·지음이 함께 있는 일러스트
- `object-contain object-bottom`로 자연스럽게 배치, 위는 크림 톤 그라데이션
- 말풍선 "오늘도 어디론가 떠나볼까?"를 캐릭터 머리 위로
- "떠나기 🎒" 버튼 채도 다운 (`#FF7043` → `#E89274`)

### 강화도 마을 홈 (ArrivalScreen)
- `home_ganghwa.png` 풀배경
- 기존 `RegionHeroScene`(카툰 마을 씬) 제거 — 배경 일러스트 단독
- 헤더 뒤로가기 버튼도 제거 (작은 "서울로 돌아가기" 알약 버튼만 남김)
- 지역별 배경 매핑 로직: `HOME_BG_IMAGE[residence.id]`

신규 에셋:
- `frontend/public/baram_jieum.jpg`
- `frontend/public/home_ganghwa.png`

## 4. 미션 리스트 — 가로 스와이프 카드뉴스
세로 카테고리 리스트 → **가로 스와이프 카드 덱**으로 전환.

각 카드 구성:
- 카테고리 라벨 + 점수
- 큰 아이콘
- 미션명(작게)
- **흥미 질문 한 줄** (예: "급할 때, 병원까지 얼마나 걸릴까?")
- 짧은 티저 (예: "도시에선 1시간. 여기선?")
- 배울 점 미리보기 3개 (정답은 숨김)
- "체험 시작 →" CTA

신규 파일:
- `frontend/src/data/missionHooks.ts` — 미션별 훅(질문 + 티저 + 배울 점)
- `frontend/src/data/missionInsights.ts` — 미션 발견 정보 (리포트용)
- `frontend/src/components/MissionStoryCard.tsx` — 카드 컴포넌트

최종 미션은 덱의 마지막 카드로 통합(전체 완료 시에만 활성).

---

## 남은 검토 포인트
- [ ] 레지던스 추천 구조 "추천/전체" → "추천/근처" (보류 중)
- [ ] 미션 카드뉴스: 카테고리 칩 필터 추가 여부
- [ ] 다른 지역(`gwangyang`, `geoje` 등)도 `home_xxx.png` 풀배경 일러스트 필요
- [ ] 우편함 진입 동선 재배치 (마을 카툰 씬 제거로 진입점이 사라진 상태)
