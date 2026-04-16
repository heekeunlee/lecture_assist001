import json

def generate_terminology_100_final():
    data = [
        # 디스플레이 공정 (14)
        {"term": "Array", "full": "TFT Array Process", "desc": "유리 기판 위에 박막 트랜지스터 패턴을 형성하여 각 화소를 제어할 수 있게 만드는 전공정.", "category": "디스플레이"},
        {"term": "Cell", "full": "Cell Process", "desc": "TFT 기판과 CF 기판을 합착하고 액정을 주입하거나 유기물을 보호하기 위해 봉지하는 공정.", "category": "디스플레이"},
        {"term": "Module", "full": "Module Assembly", "desc": "패널에 구동 IC, FPCB, 백라이트 등을 조립하여 완제품 직전의 상태로 만드는 후공정.", "category": "디스플레이"},
        {"term": "EV", "full": "Evaporation", "desc": "진공 상태에서 유기물을 가열하여 기판 위에 정밀하게 쌓아 올리는 증착 방식.", "category": "디스플레이"},
        {"term": "Photo", "full": "Photolithography", "desc": "빛에 반응하는 감광액을 이용해 기판 위에 미세한 회로 설계도를 찍어내는 공정.", "category": "디스플레이"},
        {"term": "Etch", "full": "Etching", "desc": "불필요한 부분을 화학물질이나 가스를 사용해 깎아내어 원하는 회로만 남기는 식각 공정.", "category": "디스플레이"},
        {"term": "Clean", "full": "Cleaning", "desc": "공정 사이사이에 발생하는 미세 파티클이나 화학 잔류물을 제거하여 수율을 높이는 세정 과정.", "category": "디스플레이"},
        {"term": "Depo", "full": "Deposition", "desc": "기판 위에 금속이나 절연체 막을 얇게 입히는 과정으로, 증착법에 따라 CVD, PVD 등으로 나뉨.", "category": "디스플레이"},
        {"term": "Strip", "full": "PR Stripping", "desc": "노광과 식각이 끝난 후, 역할이 종료된 감광액(Photo Resist)을 깨끗이 씻어내는 공정.", "category": "디스플레이"},
        {"term": "Sputter", "full": "Sputtering", "desc": "플라즈마 이온을 타겟에 충돌시켜 튀어나온 입자들이 기판에 달라붙게 하는 물리적 증착법.", "category": "디스플레이"},
        {"term": "LTPS", "full": "Low Temp Poly-Silicon", "desc": "비결정질 실리콘을 레이저로 결정화하여 전자 이동도를 획기적으로 높인 고성능 기판 기술.", "category": "디스플레이"},
        {"term": "Oxide", "full": "Oxide TFT", "desc": "금속 산화물을 반도체 층으로 사용하여 소비 전력을 낮추고 대형화에 유리한 차세대 기판 기술.", "category": "디스플레이"},
        {"term": "Pol-Cut", "full": "Polarizer Cutting", "desc": "빛의 방향을 조절하는 편광판을 패널 사이즈에 맞게 정밀하게 절단하는 과정.", "category": "디스플레이"},
        {"term": "Bonding", "full": "COG/FOG Bonding", "desc": "구동 칩(IC)이나 연성회로기판(FPCB)을 패널의 단자에 전기적으로 연결하는 부착 공정.", "category": "디스플레이"},
        
        # 불량 분석 (14)
        {"term": "Mura", "full": "Brightness Non-uniformity", "desc": "화면 전체의 밝기가 고르지 못해 구름이나 얼룩처럼 보이는 시각적 결함.", "category": "공정"},
        {"term": "Point Defect", "full": "Pixel Defect", "desc": "특정 픽셀이 제어되지 않아 항상 켜져 있거나(Bright) 꺼져 있는(Dark) 점 불량.", "category": "공정"},
        {"term": "Dark Spot", "full": "Dead Area", "desc": "수분 침투나 오염으로 인해 유기물이 손상되어 검은 구멍처럼 보이는 현상.", "category": "공정"},
        {"term": "Short", "full": "Electrical Short", "desc": "절연이 필요한 배선 사이가 붙어버려 비정상적인 전류가 흐르고 오작동하는 현상.", "category": "공정"},
        {"term": "Open", "full": "Line Open", "desc": "배선이 중간에 끊겨 신호가 전달되지 않아 특정 라인이 나오지 않는 현상.", "category": "공정"},
        {"term": "Particle", "full": "Foreign Material", "desc": "공정 중 유입된 먼지나 티끌이 패턴 형성을 방해하여 생기는 모든 종류의 결함.", "category": "공정"},
        {"term": "Ghost", "full": "Image Retention", "desc": "이전 화면의 잔상이 완전히 사라지지 않고 희미하게 남아있는 고스트 현상.", "category": "공정"},
        {"term": "Flicker", "full": "Intensity Fluctuation", "desc": "화면의 밝기가 미세하게 주기적으로 변하여 눈에 피로를 주는 깜빡임 현상.", "category": "공정"},
        {"term": "Crosstalk", "full": "Signal Interference", "desc": "인접한 배선 사이의 신호 간섭으로 인해 다른 화면에 영향을 주는 화질 저하 현상.", "category": "공정"},
        {"term": "Burn-in", "full": "Permanent Image Stick", "desc": "장시간 같은 화면 노출로 인해 소자가 열화되어 영구적으로 자국이 남는 현상.", "category": "공정"},
        {"term": "Leakage", "full": "Leakage Current", "desc": "스위치가 꺼진 상태에서도 미세하게 전류가 흘러 소비 전력을 높이는 불량.", "category": "공정"},
        {"term": "Peel-off", "full": "Layer Delamination", "desc": "기판 사이에 증착된 박막이나 필름이 접착력을 잃고 들떠버리는 박리 현상.", "category": "공정"},
        {"term": "Bubble", "full": "Air Void", "desc": "합착이나 봉지 공정 중 공기가 갇혀 기포 형태로 남는 외관 불량.", "category": "공정"},
        {"term": "ESD", "full": "Electrostatic Discharge", "desc": "공정 중 발생하는 정전기가 회로를 타격하여 소자를 파괴하는 현상.", "category": "공정"},
        
        # 제조 설비 (14)
        {"term": "Stepper", "full": "Lithography Equipment", "desc": "고해상도 렌즈를 통해 기판에 미세 회로를 전사하는 가장 비싸고 정밀한 노광 장비.", "category": "디스플레이"},
        {"term": "Chamber", "full": "Process Vessel", "desc": "진공, 고온, 특정 가스 등 공정 조건을 유지하는 밀폐된 화학 반응 공간.", "category": "디스플레이"},
        {"term": "PLC", "full": "Programmable Logic Controller", "desc": "공장 내 기계와 장비의 동작을 논리적으로 제어하는 산업용 컴퓨터.", "category": "디스플레이"},
        {"term": "AGV", "full": "Automated Guided Vehicle", "desc": "바닥의 가이드 라인이나 센서를 따라 부품과 기판을 나르는 무인 이송 로봇.", "category": "디스플레이"},
        {"term": "Coater", "full": "PR Coating Machine", "desc": "기판에 감광액을 아주 얇고 균일한 두께로 도포해주는 회전식 혹은 슬릿식 장비.", "category": "디스플레이"},
        {"term": "Scrubber", "full": "Gas Purifier", "desc": "반도체/디스플레이 공정 독성 가스를 중화시켜 안전하게 배출하는 환경 정화 설비.", "category": "디스플레이"},
        {"term": "ELA", "full": "Excimer Laser Annealing", "desc": "강력한 레이저 에너지를 쏘아 비정질 실리콘을 고성능 결정질로 변환하는 장비.", "category": "디스플레이"},
        {"term": "GIO", "full": "Glass In-Out System", "desc": "대형 유리 기판을 카세트에서 꺼내어 인라인 장비로 투입하는 자동 반입출 장치.", "category": "디스플레이"},
        {"term": "OHS", "full": "Overhead Shuttle", "desc": "천장에 설치된 레일을 따라 기판 카세트를 고속으로 이동시키는 물류 설비.", "category": "디스플레이"},
        {"term": "Load-lock", "full": "Vacuum Transition Room", "desc": "대기압인 외부와 진공인 내부 사이에서 기판을 전달할 때 진공을 유지하는 완충실.", "category": "디스플레이"},
        {"term": "CVD", "full": "Chemical Vapor Deposition", "desc": "가스 간의 화학 반응을 이용해 기판 위에 단단한 절연막이나 금속막을 쌓는 장비.", "category": "디스플레이"},
        {"term": "PVD", "full": "Physical Vapor Deposition", "desc": "물리적 힘(가열, 충돌)을 이용해 물질을 기판에 입히는 장비로 스퍼터가 대표적임.", "category": "디스플레이"},
        {"term": "Dry Etcher", "full": "Plasma Etching Tool", "desc": "액체 대신 플라즈마 상태의 가스를 이용해 더 날카롭고 미세하게 식각하는 장비.", "category": "디스플레이"},
        {"term": "AOI", "full": "Auto Optical Inspection", "desc": "고배율 카메라와 알고리즘으로 화소의 미세한 결함을 0.1초 만에 찾아내는 설비.", "category": "디스플레이"},
        
        # 데이터 처리 (14)
        {"term": "ETL", "full": "Extract Transform Load", "desc": "원시 데이터를 추출하여 정제한 뒤 분석용 데이터베이스에 쌓는 일련의 과정.", "category": "데이터 처리"},
        {"term": "SQL", "full": "Structured Query Language", "desc": "표 형태로 저장된 데이터베이스에서 원하는 정보를 자유자재로 뽑아내는 표준 언어.", "category": "데이터 처리"},
        {"term": "NoSQL", "full": "Non-Relational DB", "desc": "규격화된 표가 아닌 문서나 로그처럼 복잡하고 방대한 데이터를 담는 유연한 저장소.", "category": "데이터 처리"},
        {"term": "Preprocessing", "full": "Data Cleaning", "desc": "분석 결과의 정확도를 높이기 위해 누락된 값이나 오타를 수정하는 전처리 작업.", "category": "데이터 처리"},
        {"term": "Normalization", "full": "Feature Scaling", "desc": "서로 다른 단위의 데이터(예: 온도 vs 압력)를 비교 가능하게 0~1 사이로 맞추는 일.", "category": "데이터 처리"},
        {"term": "Outlier", "full": "Anomaly Detection", "desc": "정상 범위에서 크게 벗어난 '이상치'로, 장비 고장이나 공정 사고를 감지하는 핵심 신호.", "category": "데이터 처리"},
        {"term": "Feature", "full": "Independent Variable", "desc": "데이터 분석에서 결과(수율)에 영향을 주는 입력값(온도, 압력 등)들을 부르는 말.", "category": "데이터 처리"},
        {"term": "Labeling", "full": "Target Definition", "desc": "AI 학습을 위해 각 데이터에 '정상' 혹은 '불량'이라는 정답지를 달아주는 과정.", "category": "데이터 처리"},
        {"term": "Join", "full": "Table Merge", "desc": "따로 떨어져 있는 설비 데이터와 수율 데이터를 하나로 합쳐서 관계를 분석하는 작업.", "category": "데이터 처리"},
        {"term": "Aggregation", "full": "Data Grouping", "desc": "초당 생성되는 방대한 데이터를 분 단위나 시간 단위로 합쳐서 요약하는 집계 과정.", "category": "데이터 처리"},
        {"term": "Indexing", "full": "Search Optimization", "desc": "원하는 데이터를 빠르게 찾을 수 있도록 미리 목차를 만들어 검색 속도를 높이는 기술.", "category": "데이터 처리"},
        {"term": "Batch", "full": "Bulk Processing", "desc": "데이터가 일정량 모일 때까지 기다렸다가 밤사이 한꺼번에 대량으로 처리하는 방식.", "category": "데이터 처리"},
        {"term": "Streaming", "full": "Real-time Event", "desc": "데이터가 발생하는 그 순간 즉시 처리하여 1초의 오차도 없이 현황을 파악하는 기술.", "category": "데이터 처리"},
        {"term": "Metadata", "full": "Data about Data", "desc": "데이터가 생성된 시간, 장비 번호 등 실제 수치 외에 그 데이터의 맥락을 설명하는 정보.", "category": "데이터 처리"},

        # 시각화 (14)
        {"term": "Heatmap", "full": "Spatial Correlation Map", "desc": "기판 위의 데이터 밀도를 색상으로 시각화하여 이상 부위를 한눈에 찾아내는 도구.", "category": "코딩"},
        {"term": "Box Plot", "full": "Whisker Chart", "desc": "데이터의 쏠림 정도와 흩어진 범위를 상자 모양으로 보여주는 강력한 통계 그래프.", "category": "코딩"},
        {"term": "Control Chart", "full": "SPC Chart", "desc": "공정 데이터가 관리 한계선을 넘는지 실시간으로 추적하여 이상 징후를 잡는 그래프.", "category": "코딩"},
        {"term": "Scatter", "full": "Scatter Plot", "desc": "두 변수 사이의 관계를 점의 분포로 나타내어 인과관계를 유추할 때 쓰는 그래프.", "category": "코딩"},
        {"term": "Dashboard", "full": "Control Panel UI", "desc": "공장의 전체 수율과 설비 상태를 한 화면에서 실시간으로 관제하는 통합 인터페이스.", "category": "코딩"},
        {"term": "Histogram", "full": "Frequency Distribution", "desc": "데이터가 특정 구간에 얼마나 몰려 있는지를 막대 높이로 빈도수를 나타낸 도구.", "category": "코딩"},
        {"term": "Sankey", "full": "Flow Diagram", "desc": "공정 단계별로 데이터나 재료가 어디로 흘러가고 손실되는지를 굵기로 표현한 차트.", "category": "코딩"},
        {"term": "Trend", "full": "Time-series Chart", "desc": "시간의 흐름에 따른 데이터의 상승 혹은 하락 경향성을 분석하기 위한 선형 그래프.", "category": "코딩"},
        {"term": "Pareto", "full": "Pareto Analysis", "desc": "수많은 불량 원인 중 가장 치명적인 20%가 무엇인지 찾아낼 때 쓰는 누적 막대 그래프.", "category": "코딩"},
        {"term": "KPI", "full": "Key Performance Index", "desc": "목표 달성 여부를 평가하기 위한 가장 핵심적인 성과 지표들(수율, Tact-time 등).", "category": "코딩"},
        {"term": "Radar", "full": "Spider Chart", "desc": "여러 설비의 성능 지표를 거미줄처럼 펼쳐 밸런스가 얼마나 좋은지 한눈에 보는 도구.", "category": "코딩"},
        {"term": "Correlation", "full": "Co-variance Map", "desc": "여러 공정 변수들 간에 서로 얼마나 관련이 있는지 격자 형태의 색상으로 보여주는 정보.", "category": "코딩"},
        {"term": "Binning", "full": "Data Categorization", "desc": "연속된 수치를 특정 구간별로 묶어서 그룹화해 시각적 명확성을 높이는 기법.", "category": "코딩"},
        {"term": "Facet", "full": "Small Multiples", "desc": "같은 종류의 그래프를 여러 개 나열하여 장비 간의 차이를 한 번에 비교하는 시각화 방법.", "category": "코딩"},

        # 코딩 (15)
        {"term": "Variable", "full": "Storage Unit", "desc": "데이터를 임시로 저장하기 위해 이름표를 붙여놓은 메모리 상의 작은 공간.", "category": "코딩"},
        {"term": "Function", "full": "Logical Block", "desc": "반복되는 로직을 하나로 묶어 필요할 때마다 호출해서 사용하는 기능의 최소 단위.", "category": "코딩"},
        {"term": "Class", "full": "Object Blueprint", "desc": "상태(데이터)와 행위(함수)가 결합된 객체를 생성하기 위한 틀이자 설계도.", "category": "코딩"},
        {"term": "Debug", "full": "Troubleshooting", "desc": "의도와 다르게 동작하는 프로그램의 원인을 추적하여 올바르게 고치는 모든 과정.", "category": "코딩"},
        {"term": "Refactor", "full": "Code Restructuring", "desc": "기능은 유지하면서 코드의 가독성을 높이고 복잡도를 낮추는 품질 개선 작업.", "category": "코딩"},
        {"term": "Compile", "full": "Code Translation", "desc": "인간이 쓴 언어를 컴퓨터가 즉시 실행할 수 있도록 기계어로 변환해주는 번역 작업.", "category": "코딩"},
        {"term": "Deploy", "full": "Service Launch", "desc": "완성된 코드를 실제 상용 서버나 장비 제어 PC에 설치하여 작동시키는 최종 과정.", "category": "코딩"},
        {"term": "Git", "full": "Version Control", "desc": "파일의 변경 이력을 타임라인으로 관리하여 과거로 돌아가거나 협업을 돕는 필수 도구.", "category": "코딩"},
        {"term": "API", "full": "Service Gateway", "desc": "내가 만든 프로그램의 기능을 외부나 다른 앱에서 사용할 수 있게 열어준 소통 창구.", "category": "코딩"},
        {"term": "JSON", "full": "Data Format", "desc": "인간과 컴퓨터가 모두 읽기 쉬운 텍스트 기반의 표준 데이터 교환 규격.", "category": "코딩"},
        {"term": "Async", "full": "Asynchronous Process", "desc": "앞의 작업이 끝나길 기다리지 않고 다음 일을 동시에 진행하는 효율적인 실행 방식.", "category": "코딩"},
        {"term": "Callback", "full": "Follow-up Task", "desc": "특정 작업이 완료되었을 때 시스템이 자동으로 실행해주는 사후 예약 기능.", "category": "코딩"},
        {"term": "Library", "full": "Pre-built Module", "desc": "다른 실력자들이 미리 만들어놓은 훌륭한 기능 조각들을 내 코드에 빌려 쓰는 도구.", "category": "코딩"},
        {"term": "Endpoint", "full": "Resource URL", "desc": "대시보드나 모바일 앱이 서버에 데이터를 요청하기 위해 접속하는 최종 주소.", "category": "코딩"},
        {"term": "DOM", "full": "Document Object Model", "desc": "웹 브라우저의 화면 구성 요소를 코드로 제어할 수 있게 트리 형태로 구조화한 모델.", "category": "코딩"},

        # 컴퓨터 사이언스 (15)
        {"term": "Algorithm", "full": "Logic Blueprint", "desc": "문제를 해결하기 위해 정해진 명확한 순서와 논리적인 수행 절차.", "category": "코딩"},
        {"term": "Stack", "full": "Last-In-First-Out", "desc": "접시를 쌓듯 나중에 들어온 것이 먼저 나가는 단순하지만 강력한 구조.", "category": "코딩"},
        {"term": "Queue", "full": "First-In-First-Out", "desc": "계산대 줄처럼 먼저 들어온 데이터가 먼저 처리되어 나가는 대기열 구조.", "category": "코딩"},
        {"term": "OS", "full": "Operating System", "desc": "하드웨어와 사용자 사이에서 자원을 분배하고 프로그램을 관리하는 기본 소프트웨어.", "category": "코딩"},
        {"term": "Network", "full": "Connectivity Hub", "desc": "전 세계 혹은 공장 내의 수많은 컴퓨터가 서로 데이터를 주고받는 연결망.", "category": "코딩"},
        {"term": "Memory", "full": "Random Access Storage", "desc": "작업 중인 데이터를 빠르게 읽고 쓰기 위해 사용하는 일시적인 디지털 작업대.", "category": "코딩"},
        {"term": "Thread", "full": "Execution Path", "desc": "하나의 프로그램 안에서 동시에 여러 일을 처리하기 위해 갈라진 실행 흐름.", "category": "코딩"},
        {"term": "Process", "full": "Running Instance", "desc": "현재 컴퓨터 메모리 위에서 실제로 살아 움직이고 있는 프로그램의 상태.", "category": "코딩"},
        {"term": "Database", "full": "Structured Storage", "desc": "엄격한 규칙에 따라 대량의 데이터를 체계적으로 보관하고 관리하는 저장소.", "category": "코딩"},
        {"term": "Cache", "full": "Fast Buffer", "desc": "자주 쓰는 데이터를 가까운 곳에 미리 복사해두어 검색 속도를 극대화하는 보관함.", "category": "코딩"},
        {"term": "Virtualizer", "full": "Logical Machine", "desc": "물리적인 컴퓨터 한 대 위에 여러 대의 가짜 컴퓨터를 띄워 자원을 효율화하는 기술.", "category": "코딩"},
        {"term": "Encryption", "full": "Data Security", "desc": "중요한 공정 비법이나 정보를 허가되지 않은 사람이 읽지 못하게 암호로 바꾸는 일.", "category": "코딩"},
        {"term": "Compiler", "full": "Language Translator", "desc": "전체 코드를 한꺼번에 분석하여 실행 속도가 빠른 최적의 기계어로 바꿔주는 프로그램.", "category": "코딩"},
        {"term": "Framework", "full": "Standard Protocol", "desc": "신입 엔지니어도 고수처럼 개발할 수 있게 미리 규정해놓은 코드의 모범 틀.", "category": "코딩"},
        {"term": "Recursion", "full": "Self-Invocation", "desc": "복잡한 문제를 해결하기 위해 함수가 자기 자신을 계속해서 다시 호출하는 기법.", "category": "코딩"}
    ]
    
    with open('../src/data/terminology.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    generate_terminology_100_final()
