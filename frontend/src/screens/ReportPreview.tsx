// 데모 프리뷰 — #report 해시로 이주 리포트 카드 화면을 목 데이터로 단독 노출
// (미션을 모두 완료하지 않아도 카드 UI를 바로 확인하기 위한 개발용 진입점)
import MigrationReportScreen from "./MigrationReportScreen";
import { residences } from "../data/residences";
import { commonMissions } from "../data/missions";
import type { RegionRecord } from "../data/journey";

export default function ReportPreview() {
  // 강화도(자연탐험형)를 기준 지역으로 — 모든 공통 미션 완료 상태
  const residence = residences.find((r) => r.id === "ganghwa")!;
  const record: RegionRecord = {
    residenceId: residence.id,
    visitCount: 3,
    completedMissionIds: commonMissions.map((m) => m.id),
    score: 66,
    fitScore: 16,
  };

  // 비교 섹션 확인용 두 번째 방문 지역
  const geoje = residences.find((r) => r.id === "geoje")!;
  const allProgress: Record<string, RegionRecord> = {
    [residence.id]: record,
    [geoje.id]: {
      residenceId: geoje.id,
      visitCount: 1,
      completedMissionIds: commonMissions.slice(0, 4).map((m) => m.id),
      score: 20,
      fitScore: 4,
    },
  };

  return (
    <div className="relative w-full max-w-[420px] min-h-screen bg-cream shadow-soft overflow-hidden mx-auto">
      <MigrationReportScreen
        residence={residence}
        record={record}
        lifestyle="자연탐험형"
        allProgress={allProgress}
        onBack={() => {
          window.location.hash = "";
        }}
        onDecideMove={() => {}}
        onApplyResidence={() => {}}
      />
    </div>
  );
}
