# Python 경로 문제 해결 스크립트
Write-Host "Python 경로 문제 진단 중..." -ForegroundColor Green

# 1. 현재 Python 상태 확인
Write-Host "1. 현재 Python 상태 확인..."
if (Test-Path "C:\Python313\python.exe") {
    Write-Host "Python 실행 파일 존재: C:\Python313\python.exe"
    
    # Python 버전 확인 시도
    try {
        $version = & "C:\Python313\python.exe" --version 2>&1
        Write-Host "버전: $version"
    } catch {
        Write-Host "Python 실행 불가 - 라이브러리 경로 문제" -ForegroundColor Red
    }
} else {
    Write-Host "Python 실행 파일 없음" -ForegroundColor Red
}

# 2. 필요한 폴더 확인
Write-Host "`n2. Python 폴더 구조 확인..."
$folders = @("C:\Python313\Lib", "C:\Python313\Scripts", "C:\Python313\DLLs")
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        $count = (Get-ChildItem $folder -ErrorAction SilentlyContinue | Measure-Object).Count
        Write-Host "OK: $folder ($count 개 항목)"
    } else {
        Write-Host "누락: $folder" -ForegroundColor Red
    }
}

# 3. 해결책 제시
Write-Host "`n권장 해결 방법:" -ForegroundColor Yellow
Write-Host "1. Python.org에서 공식 Python 3.11.x 다운로드"
Write-Host "2. 설치 시 'Add Python to PATH' 체크"
Write-Host "3. 'pip 포함' 체크"
Write-Host "4. 설치 완료 후 새 터미널에서 테스트"

Write-Host "`n현재 Python 제거를 원하시면 y를 입력하세요:"
$remove = Read-Host "C:\Python313 폴더를 삭제하시겠습니까? (y/N)"

if ($remove -eq 'y') {
    try {
        Remove-Item "C:\Python313" -Recurse -Force -ErrorAction Stop
        Write-Host "C:\Python313 폴더 삭제 완료" -ForegroundColor Green
    } catch {
        Write-Host "삭제 실패: 관리자 권한이 필요할 수 있습니다" -ForegroundColor Red
    }
}

Write-Host "`n설치 후 확인 명령어:"
Write-Host "python --version"
Write-Host "pip --version"
