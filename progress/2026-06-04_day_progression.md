# 2026-06-04 — 잠시섬 일차 분기 + "나의 공간" 시각화

레지던스 체류일 컨셉을 반영해 미션을 일차별로 풀고, 매일 끝나면 "나의 공간"이 한 자리씩 자라는 흐름.

## 1. 일차 분배
- `parseDayCount("4박 5일")` → 일수 추출, 기본 4
- `chunkByDay(missions, dayCount)` — 미션을 개수 기준 균등 분배 (앞 일차가 1개씩 더 받음)
- `buildDayPlan(residence, missions)` — 결과로 `dayCount`, `missionsByDay`
- 헬퍼: `isDayComplete`, `missionIdsForDay`

신규 파일: `frontend/src/data/dayPlan.ts`

## 2. `RegionRecord`에 `currentDay`
- `currentDay?: number` 추가 (기본 1)
- `advanceDay(progress, residenceId, totalDays)` — 다음 일차로 진행 (상한 `totalDays`)

## 3. "나의 공간" 4단계 SVG
한옥 톤 SVG, 빈 자리 → 자리 잡기 → 깊어짐 → 내 자리 (`SPACE_STAGE_NAMES`).
**레지던스(실제 머무는 곳)와 의미가 겹치지 않게 "집 짓기"가 아니라 "나의 공간 만들기" 톤으로 통일.**

신규 파일: `frontend/src/components/HouseStage.tsx`

## 4. 미션 리스트 일차 분기
- 오늘 일차 미션만 표시 (다른 날은 안 보임)
- 헤더 `DAY N / Total`
- 일차 진행 도트
- 오늘 진행률 표시 (전체 X)

변경: `frontend/src/screens/MissionListScreen.tsx`
- 시그니처도 `residenceId` → `residence` + `currentDay` 로 변경

## 5. 오늘 하루 끝 — 의식 화면
- 좌상단 **X 버튼**으로 닫기 (마을 홈 복귀 + 일차 자동 진행)
- 집 SVG 단계 전환 애니메이션 (prev → new)
- 진행 도트 (4단계)
- **하단 제안 카드 2개** — "Day N+1 시작" CTA 대신:
  - 평소: 나의 여정에서 진행 보기 / 커뮤니티 가보기
  - 마지막 날: 이주 결정 리포트 보기 / 나의 여정에서 돌아보기

신규 파일: `frontend/src/screens/DayEndCeremonyScreen.tsx`

## 6. 나의 여정 — 만들고 있는 나의 공간
지역 마커 클릭 → 바텀시트 상단에 미니 공간 SVG + 단계명 + `Day N / 총 N · X일 마침`.
각 지역마다 자기 공간이 자람.

변경: `frontend/src/screens/JourneyScreen.tsx`

## 7. App.tsx 흐름
- 새 라우트 `day-end-ceremony`
- `handleMissionComplete`: 미션 완료 후 오늘 일차 완성 여부 체크 → 의식 or 미션 리스트
- `finishDayAnd(then)`: 일차 +1 후 콜백 — 의식의 X/제안 카드에서 사용
- 마지막 날 의식 닫기는 일차 진행 없이 하루 요약으로
- `skipTo()` 데모 헬퍼: 모든 미션 완료 + `currentDay = dayCount`로 셋업

## 결정 메모
- "집"이 아니라 "나의 공간" 톤으로 통일 — 레지던스(실제 머무는 곳)와 의미 분리
  ([feedback_space_metaphor 메모리](../../../.claude/projects/-Users-johyeonji-Desktop-impact/memory/feedback_space_metaphor.md))
- 5일+ 체류 시 단계는 4단계로 고정, 4일째 이후 일차는 "머무는 하루" 메시지
- 우편함 미션 자동 완료 → 일차 완료 감지 연동은 동작 확인 필요 (TODO)
