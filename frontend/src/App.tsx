// 청풍 앱 shell — 온보딩 게이트 + 탭/서브 라우트 관리
import { useEffect, useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import DepartureScreen from "./screens/DepartureScreen";
import TravelingScreen from "./screens/TravelingScreen";
import ArrivalScreen from "./screens/ArrivalScreen";
import MissionListScreen from "./screens/MissionListScreen";
import MissionTravelingScreen from "./screens/MissionTravelingScreen";
import MissionExecuteScreen from "./screens/MissionExecuteScreen";
import DailySummaryScreen from "./screens/DailySummaryScreen";
import JourneyScreen from "./screens/JourneyScreen";
import MigrationReportScreen from "./screens/MigrationReportScreen";
import MoveInScreen from "./screens/MoveInScreen";
import ResidenceListScreen from "./screens/ResidenceListScreen";
import ResidenceDetailScreen from "./screens/ResidenceDetailScreen";
import SettingsScreen from "./screens/SettingsScreen";
import MailboxModal from "./components/MailboxModal";
import { storiesByResidenceId } from "./data/stories";
import HospitalMissionScreen from "./screens/mission/HospitalMissionScreen";
import OnboardingShell, {
  type OnboardingResult,
} from "./screens/onboarding/OnboardingShell";
import BottomNav, { type TabKey } from "./components/BottomNav";
import {
  residences,
  type Residence,
  type LifeStyleType,
} from "./data/residences";
import { HOME_POSITIONS, type RegionPos } from "./data/regions";
import { baseMissions, type Mission } from "./data/missions";
import {
  bumpVisit,
  calculateMatch,
  completeMissionFor,
  type RegionRecord,
} from "./data/journey";

// hash 라우팅 — #hospital 해시로 단독 프리뷰
function useHashRoute() {
  const [hash, setHash] = useState(
    typeof window !== "undefined" ? window.location.hash : ""
  );
  useEffect(() => {
    const handler = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  return hash;
}

// 탭1 화면 흐름
type Tab1Route =
  | "home"
  | "departure"
  | "traveling"
  | "arrival"
  | "mission-list"
  | "mission-traveling"
  | "mission-execute"
  | "daily-summary";

// 탭2 화면 흐름
type Tab2Route =
  | "journey"
  | "report"
  | "move-in"
  | "settings"
  | "residence-list"
  | "residence-detail";

// localStorage 키
const PROFILE_KEY = "cheongpung.onboarding.v1";
const PROGRESS_KEY = "cheongpung.progress.v1";

type SavedProfile = {
  homeRegionName: string;
  lifestyle: LifeStyleType;
  email?: string;
  nickname?: string;
};

function loadProfile(): SavedProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedProfile;
  } catch {
    return null;
  }
}

function loadProgress(): Record<string, RegionRecord> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, RegionRecord>;
  } catch {
    return {};
  }
}

function saveProgress(p: Record<string, RegionRecord>) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export default function App() {
  // 훅은 모두 조건부 리턴보다 먼저
  const hash = useHashRoute();
  const [profile, setProfile] = useState<SavedProfile | null>(() => loadProfile());
  const [tab, setTab] = useState<TabKey>("home");
  const [tab1Route, setTab1Route] = useState<Tab1Route>("home");
  const [tab2Route, setTab2Route] = useState<Tab2Route>("journey");
  const [selected, setSelected] = useState<Residence | null>(null);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [regionProgress, setRegionProgress] = useState<
    Record<string, RegionRecord>
  >(() => loadProgress());
  const [reportResidenceId, setReportResidenceId] = useState<string | null>(null);
  const [moveInResidenceId, setMoveInResidenceId] = useState<string | null>(null);
  // 레지던스 상세 화면용
  const [viewingResidenceId, setViewingResidenceId] = useState<string | null>(null);
  // 레지던스 리스트 진입 시 필터(지역)
  const [residenceListRegion, setResidenceListRegion] = useState<string | null>(null);
  // 상세에서 뒤로 갈 때 list로 갈지 report로 갈지 추적
  const [detailEntry, setDetailEntry] = useState<"list" | "report">("list");
  // 미션 리스트에서 우편함 미션을 누른 경우 (모달로 노출)
  const [mailboxFromMission, setMailboxFromMission] = useState(false);

  // 진행 상태 localStorage 영속
  useEffect(() => {
    saveProgress(regionProgress);
  }, [regionProgress]);

  // 데모 리셋
  useEffect(() => {
    (window as unknown as { cheongpung?: { reset: () => void } }).cheongpung = {
      reset: () => {
        localStorage.removeItem(PROFILE_KEY);
        localStorage.removeItem(PROGRESS_KEY);
        setProfile(null);
        setSelected(null);
        setTab1Route("home");
        setTab2Route("journey");
        setTab("home");
        setActiveMission(null);
        setRegionProgress({});
        setReportResidenceId(null);
        setMoveInResidenceId(null);
        setViewingResidenceId(null);
        setResidenceListRegion(null);
      },
    };
  }, []);

  if (hash === "#hospital") return <HospitalMissionScreen />;

  const handleOnboardingComplete = (r: OnboardingResult) => {
    const email = r.data.email || "";
    const nickname = email.split("@")[0] || "여행자";
    const next: SavedProfile = {
      homeRegionName: r.data.homeRegion || "서울",
      lifestyle: r.lifestyle,
      email,
      nickname,
    };
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setProfile(next);
  };

  if (!profile) {
    return <OnboardingShell onComplete={handleOnboardingComplete} />;
  }

  const homeRegion = profile.homeRegionName;
  const nickname = profile.nickname ?? "여행자";
  const matchedResidence = residences.find((r) => r.region === homeRegion);
  const homePos: RegionPos =
    HOME_POSITIONS[homeRegion] ??
    (matchedResidence
      ? { xPct: matchedResidence.xPct, yPct: matchedResidence.yPct }
      : HOME_POSITIONS["서울"]);

  // 현재 지역 진행 데이터
  const currentRecord = selected ? regionProgress[selected.id] : undefined;
  const currentCompletedIds = new Set(currentRecord?.completedMissionIds ?? []);
  const currentScore = currentRecord?.score ?? 0;

  const handleTabChange = (next: TabKey) => {
    if (next === "home" && tab1Route !== "traveling") setTab1Route("home");
    if (next === "journey") setTab2Route("journey");
    setTab(next);
  };

  const handleTravelComplete = () => {
    if (selected) setRegionProgress((p) => bumpVisit(p, selected.id));
    setTab1Route("arrival");
  };

  const handleMissionComplete = (fitDelta = 0) => {
    if (!activeMission || !selected) return;
    const newProgress = completeMissionFor(
      regionProgress,
      selected.id,
      activeMission,
      fitDelta
    );
    setRegionProgress(newProgress);
    setActiveMission(null);

    const updatedRecord = newProgress[selected.id];
    const allDone = baseMissions.every((m) =>
      updatedRecord?.completedMissionIds.includes(m.id)
    );
    setTab1Route(allDone ? "daily-summary" : "mission-list");
  };

  // 미션 선택 시 mode에 따라 라우팅 분기
  const handleSelectMission = (m: Mission) => {
    setActiveMission(m);
    if (m.mode === "mailbox") {
      // 우편함은 별도 — 도착 화면의 모달 흐름과 동일하게 모달 노출
      setMailboxFromMission(true);
      return;
    }
    if (m.mode === "map-dialogue" || m.mode === "map-info") {
      setTab1Route("mission-traveling");
    } else {
      // dialogue / numeric — 바로 수행 화면
      setTab1Route("mission-execute");
    }
  };

  // 우편함 모달 닫힐 때 — 미션 완료 처리
  const handleMailboxMissionClose = () => {
    if (activeMission) {
      // 우편함 미션: 보상 +3 고정, fitDelta 0
      handleMissionComplete(0);
    }
    setMailboxFromMission(false);
  };

  const handleOpenReport = (residence: Residence) => {
    setReportResidenceId(residence.id);
    setTab2Route("report");
  };

  const handleDecideMove = () => {
    if (!reportResidenceId) return;
    setMoveInResidenceId(reportResidenceId);
    setTab2Route("move-in");
  };

  const handleMoveInDone = () => {
    if (!moveInResidenceId) return;
    const res = residences.find((r) => r.id === moveInResidenceId);
    if (!res) return;
    const next: SavedProfile = { ...profile, homeRegionName: res.region };
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setProfile(next);
    setMoveInResidenceId(null);
    setReportResidenceId(null);
    setSelected(null);
    setTab1Route("home");
    setTab("home");
    setTab2Route("journey");
  };

  // 하루 요약 → "이 지역 레지던스 보기" → tab2 residence-list
  const handleSeeResidencesFromSummary = () => {
    if (!selected) return;
    setResidenceListRegion(selected.region);
    setTab("journey");
    setTab2Route("residence-list");
  };

  // 리스트에서 카드 탭 → 상세
  const handleSelectResidenceFromList = (r: Residence) => {
    setViewingResidenceId(r.id);
    setDetailEntry("list");
    setTab("journey");
    setTab2Route("residence-detail");
  };

  // 리포트에서 "신청하기" → 상세 (back은 report로)
  const handleApplyFromReport = (r: Residence) => {
    setViewingResidenceId(r.id);
    setDetailEntry("report");
    setTab2Route("residence-detail");
  };

  // 설정 화면 진입
  const handleOpenSettings = () => {
    setTab("journey");
    setTab2Route("settings");
  };

  const reportResidence = reportResidenceId
    ? residences.find((r) => r.id === reportResidenceId)
    : null;
  const moveInResidence = moveInResidenceId
    ? residences.find((r) => r.id === moveInResidenceId)
    : null;
  const viewingResidence = viewingResidenceId
    ? residences.find((r) => r.id === viewingResidenceId)
    : null;

  return (
    <div className="relative w-full max-w-[420px] min-h-screen bg-cream shadow-soft overflow-hidden">
      <main className="min-h-screen pb-24">
        {/* ===== 탭1 ===== */}
        {tab === "home" && tab1Route === "home" && (
          <HomeScreen
            homeRegion={homeRegion}
            onDepart={() => setTab1Route("departure")}
          />
        )}

        {tab === "home" && tab1Route === "departure" && (
          <DepartureScreen
            homeRegion={homeRegion}
            lifestyle={profile.lifestyle}
            onBack={() => setTab1Route("home")}
            onDepart={(r: Residence) => {
              setSelected(r);
              setTab1Route("traveling");
            }}
          />
        )}

        {tab === "home" && tab1Route === "traveling" && selected && (
          <TravelingScreen
            origin={{ ...homePos, region: homeRegion }}
            destination={selected}
            onComplete={handleTravelComplete}
          />
        )}

        {tab === "home" && tab1Route === "arrival" && selected && (
          <ArrivalScreen
            residence={selected}
            onBack={() => {
              setSelected(null);
              setTab1Route("home");
            }}
            onStartMissions={() => setTab1Route("mission-list")}
          />
        )}

        {tab === "home" && tab1Route === "mission-list" && selected && (
          <MissionListScreen
            region={selected.region}
            residenceId={selected.id}
            completedIds={currentCompletedIds}
            totalScore={currentScore}
            fitScore={currentRecord?.fitScore ?? 0}
            onBack={() => setTab1Route("arrival")}
            onSelectMission={handleSelectMission}
            onSelectFinal={() => setTab1Route("daily-summary")}
          />
        )}

        {tab === "home" && tab1Route === "mission-traveling" && activeMission && (
          <MissionTravelingScreen
            mission={activeMission}
            onBack={() => {
              // 이동 화면 닫고 미션 리스트로 복귀
              setActiveMission(null);
              setTab1Route("mission-list");
            }}
            onComplete={() => {
              // 지도 안내 미션은 도착 후 바로 완료 처리(짧은 정보 카드만 짚고)
              if (activeMission.mode === "map-info") {
                setTab1Route("mission-execute");
              } else {
                setTab1Route("mission-execute");
              }
            }}
          />
        )}

        {tab === "home" && tab1Route === "mission-execute" && activeMission && selected && (
          <MissionExecuteScreen
            mission={activeMission}
            residenceMatchType={selected.matchType}
            onClose={() => {
              setActiveMission(null);
              setTab1Route("mission-list");
            }}
            onComplete={handleMissionComplete}
          />
        )}

        {tab === "home" && tab1Route === "daily-summary" && selected && (
          <DailySummaryScreen
            region={selected.region}
            completedIds={currentCompletedIds}
            totalScore={currentScore}
            todayScore={currentScore}
            prevMatch={Math.max(
              0,
              calculateMatch(profile.lifestyle, selected, currentRecord) - 7
            )}
            newMatch={calculateMatch(
              profile.lifestyle,
              selected,
              currentRecord
            )}
            onSeeResidences={handleSeeResidencesFromSummary}
            onSeeJourney={() => {
              setTab("journey");
              setTab2Route("journey");
            }}
            onClose={() => setTab1Route("mission-list")}
          />
        )}

        {/* ===== 탭2 ===== */}
        {tab === "journey" && tab2Route === "journey" && (
          <JourneyScreen
            regionProgress={regionProgress}
            lifestyle={profile.lifestyle}
            nickname={nickname}
            homeRegion={homeRegion}
            onOpenSettings={handleOpenSettings}
            onOpenReport={handleOpenReport}
          />
        )}

        {tab === "journey" && tab2Route === "settings" && (
          <SettingsScreen
            nickname={nickname}
            email={profile.email}
            lifestyle={profile.lifestyle}
            homeRegion={homeRegion}
            onBack={() => setTab2Route("journey")}
            onReset={() => {
              (window as unknown as { cheongpung?: { reset: () => void } })
                .cheongpung?.reset();
            }}
          />
        )}

        {tab === "journey" &&
          tab2Route === "report" &&
          reportResidence &&
          regionProgress[reportResidence.id] && (
            <MigrationReportScreen
              residence={reportResidence}
              record={regionProgress[reportResidence.id]}
              lifestyle={profile.lifestyle}
              allProgress={regionProgress}
              onBack={() => {
                setReportResidenceId(null);
                setTab2Route("journey");
              }}
              onDecideMove={handleDecideMove}
              onApplyResidence={handleApplyFromReport}
            />
          )}

        {tab === "journey" && tab2Route === "move-in" && moveInResidence && (
          <MoveInScreen
            residence={moveInResidence}
            onGoHome={handleMoveInDone}
          />
        )}

        {tab === "journey" && tab2Route === "residence-list" && (
          <ResidenceListScreen
            filterRegion={residenceListRegion ?? undefined}
            lifestyle={profile.lifestyle}
            onBack={() => {
              setResidenceListRegion(null);
              setTab2Route("journey");
            }}
            onSelectResidence={handleSelectResidenceFromList}
          />
        )}

        {tab === "journey" && tab2Route === "residence-detail" && viewingResidence && (
          <ResidenceDetailScreen
            residence={viewingResidence}
            lifestyle={profile.lifestyle}
            record={regionProgress[viewingResidence.id]}
            onBack={() => {
              setViewingResidenceId(null);
              setTab2Route(detailEntry === "report" ? "report" : "residence-list");
            }}
          />
        )}
      </main>

      <BottomNav active={tab} onChange={handleTabChange} />

      {/* 우편함 미션 모달 — 미션 리스트에서 우편함 카드 누른 경우 */}
      <MailboxModal
        open={mailboxFromMission}
        story={selected ? storiesByResidenceId[selected.id] ?? null : null}
        onClose={handleMailboxMissionClose}
      />
    </div>
  );
}
