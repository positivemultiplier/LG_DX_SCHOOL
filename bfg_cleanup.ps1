# BFG Repo-Cleaner 자동 민감 파일 이력 삭제 스크립트 (PowerShell)
# 사용 전 반드시 모든 변경사항을 백업하세요!

# 1. BFG 다운로드 (이미 있으면 생략)
if (!(Test-Path "bfg.jar")) {
    Write-Host "[BFG] bfg.jar 다운로드 중..."
    Invoke-WebRequest -Uri "https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar" -OutFile "bfg.jar"
}

# 2. .env, .env.example 전체 이력에서 삭제
Write-Host "[BFG] .env, .env.example 전체 이력에서 삭제 중..."
& java -jar bfg.jar --delete-files .env --delete-files .env.example

# 3. reflog 및 gc로 잔여 이력 정리
Write-Host "[GIT] reflog/gc로 잔여 이력 정리 중..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 4. 강제 push (모든 브랜치/태그)
Write-Host "[GIT] 강제 push (모든 브랜치/태그) 중..."
git push --force --all
git push --force --tags

Write-Host "[완료] 민감 파일 이력 삭제 및 push protection 해제 시도 완료!"
Write-Host "[주의] 모든 협업자도 반드시 pull/clone 후 작업해야 합니다."
