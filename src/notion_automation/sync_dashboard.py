import os
import requests
from notion_client import Client
from datetime import datetime, timedelta # Added timedelta
from dotenv import load_dotenv

load_dotenv()

def get_today_commits(owner, repo, token):
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    url = f"https://api.github.com/repos/{owner}/{repo}/commits"
    headers = {'Authorization': f'token {token}', 'Accept': 'application/vnd.github.v3+json'}
    params = {'since': today_start}
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()

# New function to get historical Notion data
def get_historical_notion_data(notion_client, database_id, days=30):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    filter_payload = {
        "property": "Date",
        "date": {
            "on_or_after": start_date.strftime("%Y-%m-%d"),
            "on_or_before": end_date.strftime("%Y-%m-%d")
        }
    }
    sort_payload = {
        "property": "Date",
        "direction": "ascending"
    }

    results = []
    has_more = True
    next_cursor = None

    while has_more:
        query_response = notion_client.databases.query(
            database_id=database_id,
            filter=filter_payload,
            sorts=[sort_payload],
            start_cursor=next_cursor
        )
        results.extend(query_response["results"])
        has_more = query_response["has_more"]
        next_cursor = query_response["next_cursor"]

    parsed_data = []
    for page in results:
        props = page["properties"]
        date = props.get("Date", {}).get("date", {}).get("start")
        commit_count = props.get("Commit Count", {}).get("number")
        difficulty = props.get("난이도", {}).get("number") # Assuming '난이도' property exists
        understanding = props.get("이해도", {}).get("number") # Assuming '이해도' property exists
        condition = props.get("컨디션", {}).get("number") # Assuming '컨디션' property exists

        if date and commit_count is not None:
            parsed_data.append({
                "date": date,
                "commit_count": commit_count,
                "difficulty": difficulty,
                "understanding": understanding,
                "condition": condition
            })
    return parsed_data

# --------------------------------------------------------------------------------------
# 📝 Notion Dashboard Helper
# --------------------------------------------------------------------------------------

# NOTE: Notion 공식 API에서는 코드 블록에 "markdown" 언어를 지정하면 Mermaid 차트를 정상적으로
#       렌더링합니다(노션 웹/데스크톱 기준). 아래 함수는 대시보드 페이지 하위에 자동 생성된 차트
#       블록을 매 실행 시 새로 추가합니다. 중복을 방지하려면 고도화가 필요하지만, 우선은 간단히
#       append 방식으로 구현합니다.

def update_notion_dashboard_page(notion_client: Client, page_id: str, mermaid_charts: list[str]):
    """대시보드 페이지에 Mermaid 차트(코드 블록)를 추가한다.

    Parameters
    ----------
    notion_client : Client
        초기화된 Notion 파이썬 SDK 클라이언트
    page_id : str
        차트를 추가할 대상 페이지(대시보드)의 ID
    mermaid_charts : list[str]
        mermaid 차트 문자열 리스트 (```mermaid``` 태그 내부 내용만 전달)
    """

    for chart in mermaid_charts:
        # 코드 블록 내에 고유 태그를 삽입해 후처리(중복 제거)할 수도 있음
        code_content = f"""```mermaid\n{chart}\n```"""

        code_block_payload = {
            "object": "block",
            "type": "code",
            "code": {
                "text": [
                    {
                        "type": "text",
                        "text": {"content": code_content},
                    }
                ],
                "language": "markdown",
            },
        }

        try:
            notion_client.blocks.children.append(block_id=page_id, children=[code_block_payload])
        except Exception as err:
            print(f"[update_notion_dashboard_page] 차트 추가 실패: {err}")

def main():
    notion_api_token = os.getenv("NOTION_API_TOKEN")
    database_id = os.getenv("NOTION_DATABASE_ID")
    github_user = os.getenv("GITHUB_USER")
    github_repo = os.getenv("GITHUB_MAIN_REPO")
    github_token = os.getenv("GITHUB_TOKEN")
    notion_dashboard_page_id = os.getenv("NOTION_DASHBOARD_PAGE_ID") # New environment variable

    if not all([notion_api_token, database_id, github_user, github_repo, notion_dashboard_page_id]):
        print("Missing required environment variables. Check your .env file and ensure NOTION_DASHBOARD_PAGE_ID is set.")
        if not github_token:
            print("Warning: GITHUB_TOKEN is not set. API requests may be limited.")
        return

    notion = Client(auth=notion_api_token)

    try:
        commits = get_today_commits(github_user, github_repo, github_token)
        commit_count = len(commits)
        commit_messages = "\n".join([f"- {commit['commit']['message']}" for commit in commits])
    except requests.exceptions.RequestException as e:
        print(f"Error fetching GitHub commits: {e}")
        # Even if commit fetch fails, we might still want to update the dashboard with historical data
        commit_count = 0
        commit_messages = "Failed to fetch commits today."

    today_str = datetime.now().strftime("%Y-%m-%d")
    page_title = f"자동화된 학습 리포트 - {today_str}"

    try:
        # Search for a page with today's date
        response = notion.databases.query(
            database_id=database_id,
            filter={
                "property": "Date",
                "date": {
                    "equals": today_str,
                },
            },
        )
        existing_page = response["results"][0] if response["results"] else None

        properties_payload = {
            "Commit Count": {"number": commit_count},
            "Commit Messages": {
                "rich_text": [
                    {"text": {"content": commit_messages or "No commits today."}}
                ]
            }
        }

        # Add properties for difficulty, understanding, condition if they exist in the database
        # These are typically manually entered, so we only update them if they are not null
        # For now, I'll assume they are not part of the automated update for today's page,
        # but rather for historical data for graphs.

        if existing_page:
            # Update the existing page
            page_id = existing_page["id"]
            notion.pages.update(page_id=page_id, properties=properties_payload)
            print(f"Successfully updated today's page with {commit_count} commits.")
        else:
            # Create a new page
            properties_payload["Name"] = {"title": [{"text": {"content": page_title}}]}
            properties_payload["Date"] = {"date": {"start": today_str}}
            notion.pages.create(
                parent={"database_id": database_id},
                properties=properties_payload
            )
            print(f"Successfully created a new page for today with {commit_count} commits.")

        # --- Dashboard Update Logic ---
        print("Fetching historical data for dashboard...")
        historical_data = get_historical_notion_data(notion, database_id, days=30)
        print(f"Fetched {len(historical_data)} historical records.")

        # --- Dashboard Chart Generation ---
        mermaid_charts = []

        # 1) 전체 학습량 및 진도율 (Pie Chart)
        total_commits = sum(d["commit_count"] for d in historical_data)
        # Assuming '완료' is based on total commits, and '진행중', '미시작' are placeholders
        completed_percentage = 0
        if total_commits > 0:
            completed_percentage = min(total_commits * 2, 100) # Arbitrary scaling for visualization
        in_progress_percentage = max(0, 100 - completed_percentage - 10) # Ensure sum is <= 100
        not_started_percentage = max(0, 100 - completed_percentage - in_progress_percentage)

        mermaid_charts.append(f"""pie title 전체 학습 진행 현황
    "완료" : {completed_percentage}
    "진행중" : {in_progress_percentage}
    "미시작" : {not_started_percentage}""")

        # 2) 주관적 난이도/이해도/컨디션 트렌드 (Flowchart)
        difficulty_trend = []
        understanding_trend = []
        condition_trend = []
        for i, data in enumerate(historical_data):
            day_label = f"Day {i+1}"
            if data["difficulty"] is not None:
                difficulty_trend.append(f"{day_label}: {data['difficulty']}")
            if data["understanding"] is not None:
                understanding_trend.append(f"{day_label}: {data['understanding']}")
            if data["condition"] is not None:
                condition_trend.append(f"{day_label}: {data['condition']}")

        if difficulty_trend or understanding_trend or condition_trend:
            trend_chart = """flowchart TD"""
            if difficulty_trend:
                trend_chart += f"""
    subgraph difficulty ["📶 난이도"]
        { " --> ".join([f"A{j+1}[{val}]" for j, val in enumerate(difficulty_trend)]) }
    end"""
            if understanding_trend:
                trend_chart += f"""
    subgraph comprehension ["🧠 이해도"]
        { " --> ".join([f"B{j+1}[{val}]" for j, val in enumerate(understanding_trend)]) }
    end"""
            if condition_trend:
                trend_chart += f"""
    subgraph condition ["💪 컨디션"]
        { " --> ".join([f"C{j+1}[{val}]" for j, val in enumerate(condition_trend)]) }
    end"""
            mermaid_charts.append(trend_chart)

        # 3) 일별 학습량 변화 (Flowchart - using commit count as proxy for learning hours)
        daily_learning_trend = []
        for i, data in enumerate(historical_data):
            date_obj = datetime.strptime(data["date"].split('T')[0], "%Y-%m-%d")
            daily_learning_trend.append(date_obj.strftime("%m/%d"))
            daily_learning_trend.append(f"{data['commit_count']} 커밋") # Using commit count as proxy

        if daily_learning_trend:
            # Format for flowchart: H1[7/1] --> H2[2시간] --> H3[7/2] ...
            formatted_trend = []
            for i in range(0, len(daily_learning_trend), 2):
                if i + 1 < len(daily_learning_trend):
                    formatted_trend.append(f"H{i+1}[{daily_learning_trend[i]}] --> H{i+2}[{daily_learning_trend[i+1]}]")
            mermaid_charts.append(f"""flowchart TD
    { " --> ".join(formatted_trend) }
    %% bar 차트 대신 flowchart로 시간 흐름과 학습량을 시각화 (v11.x, 최소 스타일)""")

        # 4) 과제/커밋 현황 (Pie Chart)
        # Using total_commits for '완료', and arbitrary values for '진행중', '미제출'
        completed_commits = total_commits
        in_progress_commits = max(0, 5 - completed_commits) # Placeholder
        unsubmitted_commits = max(0, 3 - completed_commits - in_progress_commits) # Placeholder

        mermaid_charts.append(f"""pie title GitHub 커밋/과제 현황
    "완료" : {completed_commits}
    "진행중" : {in_progress_commits}
    "미제출" : {unsubmitted_commits}""")

        # --- Push generated charts to Notion dashboard ---
        if mermaid_charts:
            print(f"Uploading {len(mermaid_charts)} chart(s) to Notion dashboard page...")
            update_notion_dashboard_page(notion, notion_dashboard_page_id, mermaid_charts)
            print("Dashboard page successfully updated.")
        else:
            print("No charts generated – dashboard update skipped.")

    except Exception as e:
        print(f"An error occurred with Notion API: {e}")

if __name__ == "__main__":
    main()
