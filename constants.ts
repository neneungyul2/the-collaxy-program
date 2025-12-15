import { GraphNode, NodeStatus, NodeType } from './types';

export const INITIAL_NODES: GraphNode[] = [
  {
    id: 'root',
    label: 'Idea',
    status: NodeStatus.ROOT,
    type: NodeType.ROOT,
    mastery: 100,
    x: 0,
    y: 0
  }
];

export const TUTORIAL_LOGS = [
  "System Online.",
  "Root Node 'Idea' detected.",
  "Objective: Expand territory by discovering connections.",
  "Click 'Idea' to scan for connections."
];

export const UI_TEXT = {
  EN: {
    APP_TITLE: "THE COLLAXY",
    APP_SUBTITLE: "PROGRAM",
    APP_TAGLINE: "Galactic Linguistics Initiative",
    STATS_DISCOVERED: "Planets Found",
    STATS_TERRAFORMED: "Terraformed",
    STATS_CONNECTIONS: "Elevators",
    SCANNER_CONFIG: "Scanner Configuration",
    MODE_HINT: "Hint",
    MODE_BLIND: "Blind",
    LANG_SETTING: "Interface Language",
    MISSION_LOG: "Mission Log",
    LOG_WAITING: "Awaiting telemetry...",
    
    // Legend
    LEGEND_TITLE: "Planetary Classification",
    LEGEND_MASTERED: "Mastered / Core",
    LEGEND_NOUN: "Noun",
    LEGEND_VERB: "Verb",
    LEGEND_ADJ: "Adjective",
    LEGEND_UNKNOWN: "Unexplored Signal",

    // Tutorial
    TUTORIAL_STEP1_TITLE: "1. Scout",
    TUTORIAL_STEP1_DESC: "Click on colored planets (Mastered or Known) to scan the sector and discover new related words.",
    TUTORIAL_STEP2_TITLE: "2. Dock",
    TUTORIAL_STEP2_DESC: "Click on gray Satellite nodes (Unknown) to initiate a Docking Sequence. You must guess the word from context.",
    TUTORIAL_STEP3_TITLE: "3. Expand",
    TUTORIAL_STEP3_DESC: "Successfully docking terraforms the planet, adding it to your empire and allowing further exploration.",
    BTN_NEXT: "Next",
    BTN_START_GAME: "Engage",

    // Onboarding
    ONBOARD_TITLE: "Galactic Expansion Protocol",
    ONBOARD_SCOUT_TITLE: "Scout",
    ONBOARD_SCOUT_DESC: "Discover new vocabulary planets in the unknown void.",
    ONBOARD_DOCK_TITLE: "Dock & Terraform",
    ONBOARD_DOCK_DESC: "Connect words via neural links to build your empire.",
    TAB_MANUAL: "Manual Coordinates",
    TAB_AUTO: "Auto-Navigation",
    SELECT_DIFFICULTY: "Select Difficulty Sector",
    PLANET_NAME_LABEL: "Initial Planet Name",
    PLANET_PLACEHOLDER: "e.g. Dream, Business, Time...",
    AUTO_DESC: "The ship's AI will calculate an optimal entry point into the galaxy based on your selected difficulty sector.",
    BTN_LAUNCH: "LAUNCH MISSION",

    // Battle
    DOCKING_SEQ: "DOCKING SEQUENCE",
    SIGNAL_LOCKED: "Signal Locked",
    AI_NAV: "AI Navigator",
    NAV_MSG_START: "Captain, we are approaching the satellite orbit of",
    NAV_MSG_END: "To initiate the docking sequence, please complete the transmission code.",
    BTN_DECRYPT: "DECRYPT HINT",
    PLACEHOLDER_LOCKED: "SYSTEM LOCKED",
    PLACEHOLDER_HINT: "Starts with...",
    PLACEHOLDER_DEFAULT: "Enter docking code...",
    BTN_VERIFYING: "VERIFYING CODE...",
    BTN_SUCCESS: "DOCKING SUCCESSFUL",
    BTN_BROKEN: "CONNECTION BROKEN",
    BTN_INITIATE: "INITIATE DOCKING",
    MSG_LOST: "SIGNAL LOST",
    MSG_LOST_SUB: "Connection terminated by host.",

    // Dynamic Logs
    LOG_INIT: "The Collaxy Program initialized.",
    LOG_SECTOR_CLEARANCE: "Sector Clearance",
    LOG_PRIMARY_DETECTED: "Primary Planet Detected",
    LOG_CLICK_TO_SCAN: "Click the Primary Planet to activate Radar Scan.",
    LOG_ALREADY_CHARTED: "Sector already charted.",
    LOG_SCANNING: "Scanning sector for satellite signals...",
    LOG_NO_SIGNALS: "No signals detected in this sector.",
    LOG_SATELLITES_DETECTED: "satellites detected. Establishing Radar contact.",
    LOG_MAPPED: "Sector already fully mapped.",
    LOG_DOCKING_SEQ: "Attempting docking sequence",
    LOG_DOCKING_CONFIRMED: "Docking confirmed. Terraforming initiated.",
    LOG_DOCKING_FAILED: "Docking failed. Connection severed.",
    LOG_ORPHAN: "Orphan node detected. Unable to bridge."
  },
  KO: {
    APP_TITLE: "콜랙시",
    APP_SUBTITLE: "프로그램",
    APP_TAGLINE: "은하계 언어 확장 프로젝트",
    STATS_DISCOVERED: "행성 발견",
    STATS_TERRAFORMED: "테라포밍",
    STATS_CONNECTIONS: "연결 통로",
    SCANNER_CONFIG: "스캐너 설정",
    MODE_HINT: "힌트 모드",
    MODE_BLIND: "블라인드",
    LANG_SETTING: "언어 설정",
    MISSION_LOG: "미션 로그",
    LOG_WAITING: "원격 측정 대기 중...",

    // Legend
    LEGEND_TITLE: "행성 분류",
    LEGEND_MASTERED: "마스터됨 / 코어",
    LEGEND_NOUN: "명사 (Noun)",
    LEGEND_VERB: "동사 (Verb)",
    LEGEND_ADJ: "형용사 (Adjective)",
    LEGEND_UNKNOWN: "미확인 신호",

    // Tutorial
    TUTORIAL_STEP1_TITLE: "1. 정찰 (Scout)",
    TUTORIAL_STEP1_DESC: "색상이 있는 행성(마스터 또는 알려짐)을 클릭하여 레이더를 스캔하고 연관된 새로운 단어를 발견하십시오.",
    TUTORIAL_STEP2_TITLE: "2. 도킹 (Dock)",
    TUTORIAL_STEP2_DESC: "회색 위성 노드(미확인)를 클릭하여 도킹 시퀀스를 시작하십시오. 문맥을 보고 단어를 맞춰야 합니다.",
    TUTORIAL_STEP3_TITLE: "3. 확장 (Expand)",
    TUTORIAL_STEP3_DESC: "도킹에 성공하면 행성이 테라포밍되어 제국에 추가되며, 그곳에서 더 먼 곳으로 탐험할 수 있습니다.",
    BTN_NEXT: "다음",
    BTN_START_GAME: "항해 시작",

    // Onboarding
    ONBOARD_TITLE: "은하계 확장 프로토콜",
    ONBOARD_SCOUT_TITLE: "정찰",
    ONBOARD_SCOUT_DESC: "미지의 공허 속에서 새로운 어휘 행성을 발견하십시오.",
    ONBOARD_DOCK_TITLE: "도킹 및 테라포밍",
    ONBOARD_DOCK_DESC: "신경 연결을 통해 단어들을 연결하고 제국을 건설하십시오.",
    TAB_MANUAL: "수동 좌표 설정",
    TAB_AUTO: "자동 항법",
    SELECT_DIFFICULTY: "난이도 구역 설정",
    PLANET_NAME_LABEL: "초기 행성 이름",
    PLANET_PLACEHOLDER: "예: Dream, Business, Time...",
    AUTO_DESC: "함선 AI가 선택한 난이도에 맞춰 최적의 진입 지점을 계산합니다.",
    BTN_LAUNCH: "미션 시작",

    // Battle
    DOCKING_SEQ: "도킹 시퀀스",
    SIGNAL_LOCKED: "신호 고정됨",
    AI_NAV: "AI 내비게이터",
    NAV_MSG_START: "선장님, 현재 위성 궤도에 접근 중입니다:",
    NAV_MSG_END: " 도킹 시퀀스를 시작하려면 전송 코드를 완성하십시오.",
    BTN_DECRYPT: "힌트 해독",
    PLACEHOLDER_LOCKED: "시스템 잠김",
    PLACEHOLDER_HINT: "다음으로 시작...",
    PLACEHOLDER_DEFAULT: "도킹 코드 입력...",
    BTN_VERIFYING: "코드 확인 중...",
    BTN_SUCCESS: "도킹 성공",
    BTN_BROKEN: "연결 끊김",
    BTN_INITIATE: "도킹 시작",
    MSG_LOST: "신호 소실",
    MSG_LOST_SUB: "호스트에 의해 연결이 종료되었습니다.",

    // Dynamic Logs
    LOG_INIT: "콜랙시 프로그램 초기화됨.",
    LOG_SECTOR_CLEARANCE: "구역 보안 등급",
    LOG_PRIMARY_DETECTED: "주 행성 감지됨",
    LOG_CLICK_TO_SCAN: "레이더 스캔을 활성화하려면 주 행성을 클릭하십시오.",
    LOG_ALREADY_CHARTED: "이미 지도에 표시된 구역입니다.",
    LOG_SCANNING: "위성 신호를 찾기 위해 구역을 스캔 중입니다...",
    LOG_NO_SIGNALS: "이 구역에서 신호가 감지되지 않았습니다.",
    LOG_SATELLITES_DETECTED: "개의 위성이 감지되었습니다. 레이더 접촉을 시도합니다.",
    LOG_MAPPED: "구역이 이미 완전히 매핑되었습니다.",
    LOG_DOCKING_SEQ: "도킹 시퀀스 시도 중",
    LOG_DOCKING_CONFIRMED: "도킹 확인됨. 테라포밍이 시작되었습니다.",
    LOG_DOCKING_FAILED: "도킹 실패. 연결이 끊어졌습니다.",
    LOG_ORPHAN: "고립된 노드 감지됨. 연결할 수 없습니다."
  }
};