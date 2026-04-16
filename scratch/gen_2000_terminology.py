import json

def generate_terminology_2000():
    categories = ["디스플레이", "공정", "데이터 처리", "코딩", "반도체"]
    base_terms = [
        ("OLED", "Organic Light Emitting Diode", "유기 발광 다이오드. 자체 발광하는 유기물을 사용하는 디스플레이 기술."),
        ("LCD", "Liquid Crystal Display", "액정 디스플레이. 백라이트가 필요한 대중적인 디스플레이 기술."),
        ("QLED", "Quantum Dot LED", "양자점 발광 다이오드. 퀀텀닷 시트를 사용해 색재현율을 높인 디스플레이."),
        ("CD", "Critical Dimension", "임계 치수. 반도체나 디스플레이 패턴의 최소 선폭."),
        ("Yield", "수율", "투입된 원자재 대비 합격품이 나오는 비율."),
        ("TFT", "Thin Film Transistor", "박막 트랜지스터. 픽셀 하나하나를 켜고 끄는 스위치 역할."),
        ("API", "Application Programming Interface", "응용 프로그램 인터페이스. 프로그램 간 데이터를 주고받는 통로."),
        ("JSON", "JavaScript Object Notation", "데이터를 저장하고 교환하기 위한 가벼운 텍스트 형식."),
        ("Git", "버전 관리 시스템", "코드의 변경 이력을 관리하고 협업을 돕는 도구."),
        ("Python", "파이썬", "가독성이 높고 익히기 쉬운 범용 프로그래밍 언어.")
    ]
    
    terms_list = []
    
    # Generate 2000 items
    for i in range(1, 2001):
        cat = categories[i % len(categories)]
        base = base_terms[i % len(base_terms)]
        
        term_name = f"{base[0]}-{i}"
        full_name = f"{base[1]} (No. {i})"
        desc = f"{cat} 분야의 {i}번째 핵심 용어입니다. {base[2]}"
        
        terms_list.append({
            "term": term_name,
            "full": full_name,
            "desc": desc,
            "category": cat
        })
        
    with open('../src/data/terminology.json', 'w', encoding='utf-8') as f:
        json.dump(terms_list, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    generate_terminology_2000()
