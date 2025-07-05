import os
import requests
from dotenv import load_dotenv

# .env.local 파일 로드
env_path = os.path.join(os.path.dirname(__file__), '.env.local')
load_dotenv(dotenv_path=env_path)

GITHUB_TOKEN = os.getenv('GITHUB_PERSONAL_ACCESS_TOKEN')
GITHUB_OWNER = os.getenv('GITHUB_OWNER')

headers = {
    'Authorization': f'token {GITHUB_TOKEN}',
    'Accept': 'application/vnd.github.v3+json'
}

url = f'https://api.github.com/users/{GITHUB_OWNER}/repos'

response = requests.get(url, headers=headers)

if response.status_code == 200:
    repos = response.json()
    for repo in repos:
        print(f"{repo['name']}: {repo['html_url']}")
else:
    print(f"Error: {response.status_code} - {response.text}")
