"""
Supabase to Notion Sync with MCP Tools - Latest Version
최신 Supabase 데이터를 Notion 데이터베이스로 동기화하는 스크립트 (2025-08-01 업데이트)
"""
import os
import requests
import json
from datetime import datetime

# Load environment variables
def load_env():
    env_vars = {}
    try:
        with open('.env.local', 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip().strip('"').strip("'")
    except FileNotFoundError:
        print("Warning: .env.local file not found")
    
    return env_vars

# Initialize environment variables
env_vars = load_env()

# Notion configuration
NOTION_TOKEN = env_vars.get('NOTION_API_TOKEN')
NOTION_DATABASE_ID = env_vars.get('NOTION_DATABASE_ID')

print(f"🔧 Notion Token: {'✓' if NOTION_TOKEN else '✗'}")
print(f"🔧 Notion Database ID: {'✓' if NOTION_DATABASE_ID else '✗'}")

# 최신 Supabase 데이터 (MCP에서 실시간 가져온 데이터 - 7월 31일까지 포함)
LATEST_SUPABASE_DATA = [
    {
        "id": "d9f835d4-5c86-4cd0-b885-e8e4f9f7bab3",
        "user_id": "1e132506-7cbb-42e0-829a-1c8d5a6e4a10",
        "date": "2025-07-31",
        "time_part": "morning",
        "understanding_score": 5,
        "concentration_score": 5,
        "achievement_score": 5,
        "condition": "좋음",
        "total_score": 15,
        "subjects": {},
        "achievements": [
            "Reddit Crawling 실패.  (팀원 은지 API를 사용해서 하니까 부담되서 적극적으로 시도해보지 못했다. 오후에 Redit API 만들어서 성공시키기)",
            "전사 <= 라는 단어의 정의를 팀원들과했다 (은지,성화 = LG그룹 전계열사// 수진,광민,진헌,희창 = LG전자 전사업부)  민주적으로 LG전자라 정의하고 진행한다.",
            "PDF 형식을 text로 바꿔주는 라이브러리를 찾았다 PDF to text => pdfplumber Library "
        ],
        "challenges": [
            "Reddit 사이트에서 401 response error가 나왔다. 해결하는중이다. 오후에는 분명 해결 될 것이다. "
        ],
        "tomorrow_goals": [
            "Reddit 크롤링 성공해야지!!"
        ],
        "notes": "고객의 needs를 찾아내는 crawlning을 좀 더 많이 해야겠다.\n워드 클라우드를 좀 더 다양하게 활용할 수 있을 것 같다. ",
        "github_commits": 0,
        "github_issues": 0,
        "github_prs": 0,
        "github_reviews": 0,
        "created_at": "2025-07-31 21:25:36.711955+00",
        "updated_at": "2025-07-31 21:25:36.711955+00"
    },
    {
        "id": "67aeb574-5c13-4cdd-a475-c65aba0277f6",
        "user_id": "1e132506-7cbb-42e0-829a-1c8d5a6e4a10",
        "date": "2025-07-31",
        "time_part": "afternoon",
        "understanding_score": 9,
        "concentration_score": 2,
        "achievement_score": 4,
        "condition": "나쁨",
        "total_score": 15,
        "subjects": {},
        "achievements": [
            "Reddit에 실제 API를 사용해서 Crawling에 성공했다. ",
            "워드클라우드 구름모양을 생성할 수 있게 되었다. 함수를 정의하고 사용하였다. ",
            "팁에서는 PPT 작업을 시작하였다. 수진이가 필요이상의 디자인에 공을 들이는것같지만 본인의 도메인에 대한 pride라고  생각이들어  열심히 응원하고 지지하는것 밖에 할 수 있는게 없다."
        ],
        "challenges": [],
        "tomorrow_goals": [],
        "notes": "AI의 도움 없이 이 일들이 진행될 수 있을까? \n예전에는 구글링 잘 하는게 노하우였다면 지금은 AI를 활용잘 하는게 노하우가 되는것 같다.\n모든사람에게 동일한 LLM이 제공되지만, 누구는 어떻게 사용할지도 몰라서 안쓰는사람, 누구는 손으로 하는게 더 빠르겠다는사람, 누구는 AI이전의 자신이 알던 지식으로만 해결하려는사람, 효과적으로 잘 활용하는사람, AI 를 사용하지만 전혀 논점에서 벗어난 garbage in 만 시키는사람 \n결국 사람이 중요하다! ",
        "github_commits": 0,
        "github_issues": 0,
        "github_prs": 0,
        "github_reviews": 0,
        "created_at": "2025-07-31 21:35:31.390534+00",
        "updated_at": "2025-07-31 21:35:31.390534+00"
    },
    {
        "id": "d357bebf-255c-4cde-aa26-eea390f46c97",
        "user_id": "1e132506-7cbb-42e0-829a-1c8d5a6e4a10",
        "date": "2025-07-30",
        "time_part": "morning",
        "understanding_score": 3,
        "concentration_score": 3,
        "achievement_score": 3,
        "condition": "좋음",
        "total_score": 9,
        "subjects": {},
        "achievements": [
            "팀 회의를 통해서 전반적인 구도가 잡혔다. 평가기준과 example을 보여준것을 기반으로 진행하려고한다.",
            "평가 point들을 다시 한번 확인하고 팀원들과 우리의 idea가 정확한 길로 가고 있는지 확인하였다. "
        ],
        "challenges": [
            "하나의 문제점을 가정해놓고 (공간의 확장) 진행하다보니 LG전자가 가진 문제점을 그것에 끼워 마치는 형식이 되고있다. 사실 LG의 문제점부터 진행해야 되는것 같은데 이해가 잘 되지 않는다. ",
            "기존의 경영적접근FrameWork(  BCG Analysis, SWOT Analysis, STP Srategy, 4P Mix Strategy) 로 해도 될것같은데 다 무시하고 진행하다보니, 이해가 많이 되지 않는다. 내가 Frame에 갇혀있을 수 있으니 적극적으로 한번 따라가봐야겠다.",
            "이해가 되지 않을때는 책이 정답이다 DCX 책을 한번 읽어봐야겠다. "
        ],
        "tomorrow_goals": [],
        "notes": "",
        "github_commits": 0,
        "github_issues": 0,
        "github_prs": 0,
        "github_reviews": 0,
        "created_at": "2025-07-31 21:46:02.683684+00",
        "updated_at": "2025-07-31 21:46:02.683684+00"
    },
    {
        "id": "d512c59e-ec45-4c96-b10f-38d5a16eafe1",
        "user_id": "1e132506-7cbb-42e0-829a-1c8d5a6e4a10",
        "date": "2025-07-30",
        "time_part": "afternoon",
        "understanding_score": 5,
        "concentration_score": 5,
        "achievement_score": 5,
        "condition": "보통",
        "total_score": 15,
        "subjects": {},
        "achievements": [
            "전자공시 Dart API 연동후 재무정보를 수집할 수 있게 되었다.",
            "팀 활동으로 LG전자 내부에서 왜 사업부문을 확장시켜야하는거 라는 근거를 찾기위해 Data를 수집했다. 나는 재무부문 위주로 정보를 수집했다.",
            "통계청 Data도 반려 등의 키워드로 검색해보았다."
        ],
        "challenges": [],
        "tomorrow_goals": [],
        "notes": "",
        "github_commits": 0,
        "github_issues": 0,
        "github_prs": 0,
        "github_reviews": 0,
        "created_at": "2025-07-31 21:37:51.712576+00",
        "updated_at": "2025-07-31 21:37:51.712576+00"
    },
    {
        "id": "b07c708e-4131-487f-be82-90661ae451a9",
        "user_id": "1e132506-7cbb-42e0-829a-1c8d5a6e4a10",
        "date": "2025-07-29",
        "time_part": "morning",
        "understanding_score": 10,
        "concentration_score": 9,
        "achievement_score": 10,
        "condition": "좋음",
        "total_score": 29,
        "subjects": {},
        "achievements": [
            "어제 Brainstorming한 내용들을 정리하기 시작했다. ",
            "페르소나를 설정하고 needs를 파악했다. "
        ],
        "challenges": [
            "어제 가볍게 했던 key idea 들이 잘 생각나지 않았다. "
        ],
        "tomorrow_goals": [],
        "notes": "",
        "github_commits": 0,
        "github_issues": 0,
        "github_prs": 0,
        "github_reviews": 0,
        "created_at": "2025-07-29 08:49:44.867928+00",
        "updated_at": "2025-07-29 08:49:44.867928+00"
    },
    {
        "id": "87d492fe-1667-4847-bfc0-d42dbca0b917",
        "user_id": "1e132506-7cbb-42e0-829a-1c8d5a6e4a10",
        "date": "2025-07-29",
        "time_part": "afternoon",
        "understanding_score": 8,
        "concentration_score": 5,
        "achievement_score": 7,
        "condition": "좋음",
        "total_score": 20,
        "subjects": {},
        "achievements": [
            "part를 설정했다. "
        ],
        "challenges": [],
        "tomorrow_goals": [],
        "notes": "",
        "github_commits": 0,
        "github_issues": 0,
        "github_prs": 0,
        "github_reviews": 0,
        "created_at": "2025-07-29 08:50:28.884403+00",
        "updated_at": "2025-07-29 08:50:56.213+00"
    },
    {
        "id": "1c98fda7-ecde-4741-840c-e99a84dba09f",
        "user_id": "1e132506-7cbb-42e0-829a-1c8d5a6e4a10",
        "date": "2025-07-28",
        "time_part": "morning",
        "understanding_score": 10,
        "concentration_score": 10,
        "achievement_score": 3,
        "condition": "좋음",
        "total_score": 23,
        "subjects": {},
        "achievements": [
            "LG_DX_SCHOOL : BX Project Idea Brainstorming",
            "★★★★★민주적 의사결정에 의한 Idea 결정!! ★★★★★"
        ],
        "challenges": [
            "여러가지 좋은 Idea 중 목적적합하며, 시의적절한 주제를 선택하기 어려웠다."
        ],
        "tomorrow_goals": [
            "Data들을 모아야겠다."
        ],
        "notes": "",
        "github_commits": 0,
        "github_issues": 0,
        "github_prs": 0,
        "github_reviews": 0,
        "created_at": "2025-07-28 08:34:23.887028+00",
        "updated_at": "2025-07-28 08:34:23.887028+00"
    },
    {
        "id": "3ce11625-c252-4181-9f62-b3fa2cce3b04",
        "user_id": "1e132506-7cbb-42e0-829a-1c8d5a6e4a10",
        "date": "2025-07-28",
        "time_part": "afternoon",
        "understanding_score": 8,
        "concentration_score": 6,
        "achievement_score": 8,
        "condition": "좋음",
        "total_score": 22,
        "subjects": {},
        "achievements": [
            "구체적인 Prodoct 구상을 하였다. ",
            "Raw Data를 수집하기 시작했다. "
        ],
        "challenges": [
            "원하는 Data set을 획득하고싶지만 통계청, Data.go.kr 등 정량 Data가 부족하다.",
            "논문들좀 찾아봐야겠다 "
        ],
        "tomorrow_goals": [],
        "notes": "",
        "github_commits": 0,
        "github_issues": 0,
        "github_prs": 0,
        "github_reviews": 0,
        "created_at": "2025-07-28 08:39:52.589707+00",
        "updated_at": "2025-07-28 08:39:52.589707+00"
    }
]

def clean_text_for_multi_select(text):
    """
    Multi-select에 적합하도록 텍스트 정리
    """
    if not text:
        return ""
    # 100자 제한 및 특수문자 정리 (쉼표 제거)
    cleaned = text.strip()[:100]
    # 쉼표를 세미콜론으로 변환
    cleaned = cleaned.replace(',', ';')
    # 괄호 제거
    cleaned = cleaned.replace('(', '').replace(')', '')
    return cleaned

def map_data_to_notion_properties(item):
    """
    Supabase 데이터를 Notion 속성으로 매핑 (기존 스키마 기준)
    """
    # 날짜 형식 처리
    date_value = item.get('date', '')
    if date_value:
        # ISO 8601 형식으로 변환
        try:
            # 2025-07-31 -> 2025-07-31
            formatted_date = date_value
        except:
            formatted_date = date_value
    
    properties = {
        "제목": {
            "title": [
                {
                    "text": {
                        "content": f"{item.get('date', '')} - {item.get('time_part', '')} 리플렉션"
                    }
                }
            ]
        },
        "날짜": {
            "date": {
                "start": formatted_date
            }
        },
        "시간대": {
            "select": {
                "name": item.get('time_part', 'morning')
            }
        },
        "이해도": {
            "number": item.get('understanding_score', 0)
        },
        "집중도": {
            "number": item.get('concentration_score', 0)
        },
        "성취도": {
            "number": item.get('achievement_score', 0)
        },
        "컨디션": {
            "select": {
                "name": item.get('condition', '보통')
            }
        },
        " 오늘의 성취": {
            "multi_select": [
                {"name": clean_text_for_multi_select(achievement)} 
                for achievement in item.get('achievements', [])[:10] 
                if achievement and achievement.strip()
            ]
        },
        "어려웠던 점": {
            "multi_select": [
                {"name": clean_text_for_multi_select(challenge)} 
                for challenge in item.get('challenges', [])[:10] 
                if challenge and challenge.strip()
            ]
        },
        "내일목표": {
            "multi_select": [
                {"name": clean_text_for_multi_select(goal)} 
                for goal in item.get('tomorrow_goals', [])[:10] 
                if goal and goal.strip()
            ]
        },
        "추가 메모": {
            "rich_text": [
                {
                    "text": {
                        "content": item.get('notes', '')[:2000] if item.get('notes') else ""
                    }
                }
            ]
        },
        "Supabase_ID": {
            "rich_text": [
                {
                    "text": {
                        "content": item.get('id', '')
                    }
                }
            ]
        },
        "동기화상태": {
            "select": {
                "name": "완료"
            }
        }
    }
    
    return properties

def sync_to_notion(data_list):
    """
    Notion 데이터베이스에 데이터 동기화
    """
    if not NOTION_TOKEN or not NOTION_DATABASE_ID:
        print("❌ Notion 토큰 또는 데이터베이스 ID가 설정되지 않았습니다.")
        return False
    
    headers = {
        'Authorization': f'Bearer {NOTION_TOKEN}',
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
    }
    
    # 이미 동기화된 항목 확인
    print("🔍 기존 동기화된 항목 확인 중...")
    existing_items = check_existing_items()
    print(f"📋 기존 항목 {len(existing_items)}개 발견")
    
    success_count = 0
    error_count = 0
    skip_count = 0
    
    for item in data_list:
        # 이미 동기화된 항목인지 확인
        item_key = f"{item['date']}_{item['time_part']}"
        if item_key in existing_items:
            print(f"⏭️  건너뛰기: {item['date']} {item['time_part']} (이미 동기화됨)")
            skip_count += 1
            continue
            
        try:
            properties = map_data_to_notion_properties(item)
            
            payload = {
                "parent": {"database_id": NOTION_DATABASE_ID},
                "properties": properties
            }
            
            response = requests.post(
                'https://api.notion.com/v1/pages',
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                print(f"✅ 동기화 성공: {item['date']} {item['time_part']}")
                success_count += 1
            else:
                print(f"❌ 동기화 실패: {item['date']} {item['time_part']}")
                print(f"   Status: {response.status_code}")
                print(f"   Response: {response.text}")
                error_count += 1
                
        except Exception as e:
            print(f"❌ 오류 발생: {item['date']} {item['time_part']} - {e}")
            error_count += 1
    
    print(f"\n📊 동기화 완료:")
    print(f"   ✅ 성공: {success_count}개")
    print(f"   ⏭️  건너뛰기: {skip_count}개")
    print(f"   ❌ 실패: {error_count}개")
    
    # 성공하거나 건너뛰기가 있으면 성공으로 간주
    return success_count > 0 or skip_count > 0

def check_existing_items():
    """
    이미 동기화된 항목들을 확인
    """
    headers = {
        'Authorization': f'Bearer {NOTION_TOKEN}',
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
    }
    
    payload = {
        "page_size": 100
    }
    
    existing_items = set()
    
    try:
        response = requests.post(
            f'https://api.notion.com/v1/databases/{NOTION_DATABASE_ID}/query',
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            data = response.json()
            for page in data.get('results', []):
                properties = page.get('properties', {})
                date_prop = properties.get('날짜', {})
                time_prop = properties.get('시간대', {})
                
                if date_prop.get('date') and time_prop.get('select'):
                    date_val = date_prop['date']['start']
                    time_val = time_prop['select']['name']
                    existing_items.add(f"{date_val}_{time_val}")
        
    except Exception as e:
        print(f"⚠️  기존 항목 확인 중 오류: {e}")
    
    return existing_items

def main():
    """
    메인 실행 함수
    """
    print("🚀 Supabase to Notion 동기화 시작... (최신 데이터 2025-08-01)")
    print(f"📊 처리할 데이터: {len(LATEST_SUPABASE_DATA)}개")
    print(f"🆕 최신 추가 항목: 2025-07-31 (Reddit API 성공, 워드클라우드 생성)")
    
    # Notion으로 동기화
    if sync_to_notion(LATEST_SUPABASE_DATA):
        print("🎉 동기화가 완료되었습니다!")
    else:
        print("💥 동기화에 실패했습니다.")

if __name__ == "__main__":
    main()
