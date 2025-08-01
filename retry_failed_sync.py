"""
실패한 항목들만 재시도하는 스크립트
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
                "start": item.get('date', '')
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

# 실패한 항목들만
FAILED_ITEMS = [
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
            "Reddit Crawling 실패. API 사용 시도",
            "LG전자 전사 정의 민주적 합의",
            "PDF to text 라이브러리 발견 pdfplumber"
        ],
        "challenges": [
            "Reddit 401 response error 발생"
        ],
        "tomorrow_goals": [
            "Reddit 크롤링 성공하기"
        ],
        "notes": "고객의 needs를 찾아내는 crawling을 좀 더 많이 해야겠다.\n워드 클라우드를 좀 더 다양하게 활용할 수 있을 것 같다.",
        "github_commits": 0,
        "github_issues": 0,
        "github_prs": 0,
        "github_reviews": 0,
        "created_at": "2025-07-31 21:25:36.711955+00",
        "updated_at": "2025-07-31 21:25:36.711955+00"
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
            "팀 회의로 전반적 구도 확립",
            "평가 기준과 아이디어 방향성 확인"
        ],
        "challenges": [
            "문제점 가정하고 LG전자 문제를 끼워맞추는 형식",
            "기존 경영 프레임워크 대신 새로운 접근 방식 이해 어려움",
            "DCX 책을 읽어서 이해도 향상 필요"
        ],
        "tomorrow_goals": [],
        "notes": "",
        "github_commits": 0,
        "github_issues": 0,
        "github_prs": 0,
        "github_reviews": 0,
        "created_at": "2025-07-31 21:46:02.683684+00",
        "updated_at": "2025-07-31 21:46:02.683684+00"
    }
]

def sync_failed_items():
    """실패한 항목들 동기화"""
    headers = {
        'Authorization': f'Bearer {NOTION_TOKEN}',
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
    }
    
    success_count = 0
    error_count = 0
    
    for item in FAILED_ITEMS:
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
                print(f"✅ 재시도 성공: {item['date']} {item['time_part']}")
                success_count += 1
            else:
                print(f"❌ 재시도 실패: {item['date']} {item['time_part']}")
                print(f"   Status: {response.status_code}")
                print(f"   Response: {response.text}")
                error_count += 1
                
        except Exception as e:
            print(f"❌ 오류 발생: {item['date']} {item['time_part']} - {e}")
            error_count += 1
    
    print(f"\n📊 재시도 완료:")
    print(f"   ✅ 성공: {success_count}개")
    print(f"   ❌ 실패: {error_count}개")

if __name__ == "__main__":
    print("🔄 실패한 항목들 재시도 중...")
    sync_failed_items()
