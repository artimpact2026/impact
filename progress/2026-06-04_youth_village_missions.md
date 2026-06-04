# 2026-06-04 — 새 청년마을 7곳 지역 미션 + villageConfig

## 한 줄
새로 들어온 청년마을 7곳(영덕·영월·무주·세종·의성·홍성·대전)에 각 4개씩 시그니처 지역 미션 추가 + 마을 홈 텍스트 설정.

## 청년마을별 미션 (28개)

### 🌊 영덕 뚜벅이마을 (sea / alone_rest)
출처: https://localro.co.kr/village/40
1. **블루로드 첫 구간 걷기** — 64km 동해안 도보 코스, 천천히 걷기 (map-info)
2. **차 없는 하루 살아보기** — 도보 일상, 자전거 없이 살기 (dialogue)
3. **강구항에서 대게 한 마리** — 단골 식당, 대게철 (map-dialogue)
4. **해맞이공원에서 멍 때리기** — 풍력단지 풍경 (map-info)

### 🏔 영월 밭멍 (mountain / alone_rest)
출처: https://localro.co.kr/village/7
1. **하늘에서 보이는 나뭇잎밭** — 옛 공장 자리 퍼머컬처 디자인 (map-info)
2. **퍼머컬처 첫 수업** — 경운 없는 농법 (dialogue)
3. **사회적 밭 함께 만들기** — 식용→약용·꽃 변환 (dialogue)
4. **밭에서 진짜 멍 때리기** — 비움의 시간 (dialogue)

### 🏔 무주 산타지 (mountain / alone_make)
출처: https://localro.co.kr/village/56
1. **비워진 폐교에 발걸음** — 무풍면 폐교 (map-info)
2. **정착 요정의 이야기** — 서선아 대표 (dialogue)
3. **무풍면 산골 한 바퀴** — 덕유산 자락 (map-dialogue)
4. **폐교 안에 내 자리 만들기** — 완성형이 아닌 공간 (dialogue)

### 🌾 세종 농땡이월드 (field / together_rest)
출처: https://localro.co.kr/village/16
1. **키친가든에서 농땡이** — 호주식 농사 셰프 (map-info)
2. **달빛레시피 함께 먹기** — 농킴과 땡초버거 (dialogue)
3. **농부의 달력 한 페이지** — 월별 문화농사 (dialogue)
4. **고복저수지 메기매운탕** — 동네 단골집 (map-dialogue)

### 🌾 의성 나만의-성 (field / together_make)
출처: https://localro.co.kr/village/13
1. **옛 여관 금강장 도착** — 황금 화장실 (map-info)
2. **로컬러닝랩 첫 모임** — 노인 낙상·버스정류소 더위 해결 프로젝트 (dialogue)
3. **근의 공식 — 별 관측 모임** — "별 볼 일밖에 없는" 의성의 반전 (dialogue)
4. **용주밥상 단골 되기** — 의성=마늘 (map-dialogue)

### 🏘 홍성 집단지성 (village / together_make)
출처: https://localro.co.kr/village/20
1. **베이스 캠프 입장** — 로컬 워커의 골목 (map-info)
2. **로컬워커 한 명 만나기** — 서울에서 온 디자이너 (dialogue)
3. **골목 마켓 함께 준비** — 골목 자체가 브랜드 (dialogue)
4. **단단한 성취란** — 과정을 함께 버텨내는 힘 (dialogue)

### 🏘 대전 weave on 중촌 (village / alone_make)
출처: https://localro.co.kr/village/58
1. **중촌동 맞춤패션 거리** — 60년대부터 양복점 골목 (map-info)
2. **맞춤복 장인과의 대화** — 40년 손기술 (dialogue)
3. **내 아이디어가 옷이 되기** — 패션메이킹 + AI (dialogue)
4. **콜라보 쇼케이스 참가** — 의상·예술·콘텐츠 페스티벌 (dialogue)

## 미션 옵션 traits 매핑

옛 LifeStyleType 그대로 사용 (oldToStance 매핑으로 새 시스템과 호환):
- 자세 `alone_rest` → 자연탐험형 / 집돌이형
- 자세 `alone_make` → 디지털노마드형 / 자연탐험형
- 자세 `together_rest` → 집돌이형 / 레저형 mix
- 자세 `together_make` → 레저형

## villageConfig (마을 홈 텍스트)
7개 청년마을 모두 추가. 각 마을마다 헤더 타이틀, 도착 메시지, 부제, 말풍선, 미션 안내 커스텀.

## 옛 미션 데이터 보존
이번 카탈로그에서 빠진 지역 미션 배열들은 `export const`로 보존 (필요 시 재활용):
- `gwangyangMissions`, `geojeMissions`, `taeanMissions`, `yangyangMissions`, `jindoMissions`, `jeongseonMissions`
- 옛 영월 별마로 천문대 미션 → `yeongwolMissionsOld`로 별도 보존

## 청년마을 1곳당 미션 분배
- 공통 9개 + 지역 4개 = **13개 미션**
- duration에 따라 일차별 균등 분배 (dayPlan.ts)
- 4박 5일(5일) → 약 2~3개/일
- 5박 6일(6일) → 약 2개/일

## 참고 자료 (사용자 제공)
- `https://localro.co.kr/village/N` 형식의 청년마을 공식 페이지에서 컨셉·시그니처·인물·활동·먹거리 추출
- 각 청년마을의 실제 인물명·장소명·프로그램명 반영 (서선아, 농킴, 프러너 '근', 용주밥상, 금강장, G타운, 근의 공식 등)
- 일부 정보가 빈약한 곳(영덕)은 일반 영덕 정보(블루로드, 강구항, 해맞이공원, 풍력단지)로 보강

## 알아둘 점
- 미션 톤은 기존 강화 미션과 일관 유지 (3-5턴 대화, 단순 옵션, traits 포함)
- 각 미션 reward 8~12점 범위
- 모드 분배: map-info(시그니처 장소), map-dialogue(이동+사람), dialogue(인물 중심)
- 일부 미션 dialogue는 2턴(시간 절약)에서 향후 3턴으로 확장 가능
