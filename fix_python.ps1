# Python 경로 문제 해결 스크립트
# PowerShell 관리자 권한으로 실행 필요

Write-Host "Python 경로 문제 해결 스크립트" -ForegroundColor Green
Write-Host "=" * 50

# 1. 현재 상태 확인
Write-Host "1. 현재 Python 상태 확인..." -ForegroundColor Cyan
if (Test-Path "C:\Python313\python.exe") {
    Write-Host "✅ Python 실행 파일 존재: C:\Python313\python.exe"
    $version = & "C:\Python313\python.exe" --version 2>$null
    if ($version) {
        Write-Host "   버전: $version"
    } else {
        Write-Host "❌ Python 실행 불가 - 라이브러리 경로 문제"
    }
} else {
    Write-Host "❌ Python 실행 파일 없음"
}

# 2. 필요한 폴더 구조 확인
Write-Host "`n2. Python 폴더 구조 확인..." -ForegroundColor Cyan
$requiredFolders = @(
    "C:\Python313\Lib",
    "C:\Python313\Scripts", 
    "C:\Python313\DLLs",
    "C:\Python313\include",
    "C:\Python313\libs"
)

foreach ($folder in $requiredFolders) {
    if (Test-Path $folder) {
        $items = Get-ChildItem $folder -ErrorAction SilentlyContinue | Measure-Object
        Write-Host "✅ $folder (항목: $($items.Count)개)"
    } else {
        Write-Host "❌ $folder 누락"
    }
}

# 3. 해결 방법 제시
Write-Host "`n🔧 권장 해결 방법:" -ForegroundColor Yellow
Write-Host "━" * 50

Write-Host "`n방법 1: Python.org에서 공식 설치 (권장)"
Write-Host "1. https://python.org/downloads 방문"
Write-Host "2. Python 3.11.x LTS 버전 다운로드 (안정성 위해)"
Write-Host "3. 설치 시 '✅ Add Python to PATH' 체크"
Write-Host "4. '✅ pip 포함' 체크"
Write-Host "5. 'Install for all users' 선택"

Write-Host "`n방법 2: Microsoft Store에서 설치"
Write-Host "1. Windows 키 + R → ms-windows-store: 입력"
Write-Host "2. 'Python 3.11' 검색 후 설치"

Write-Host "`n방법 3: Chocolatey 사용 (개발자 권장)"
Write-Host "1. PowerShell 관리자 권한으로 실행"
Write-Host "2. choco install python --version=3.11.9"

# 4. 현재 Python 제거 옵션
Write-Host "`n🗑️  현재 손상된 Python 제거:" -ForegroundColor Red
Write-Host "━" * 30
$removeConfirm = Read-Host "현재 C:\Python313 폴더를 삭제하시겠습니까? (y/N)"

if ($removeConfirm -eq 'y' -or $removeConfirm -eq 'Y') {
    try {
        if (Test-Path "C:\Python313") {
            Remove-Item "C:\Python313" -Recurse -Force
            Write-Host "✅ C:\Python313 폴더 삭제 완료"
        }
        
        # PATH 환경변수에서 Python 경로 제거
        $currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
        $newPath = $currentPath -replace ";?C:\\Python313[^;]*", ""
        [Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")
        Write-Host "✅ PATH 환경변수에서 Python 경로 제거"
        
    } catch {
        Write-Host "❌ 삭제 실패: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 PowerShell을 관리자 권한으로 다시 실행해보세요."
    }
} else {
    Write-Host "ℹ️  삭제하지 않습니다. 수동으로 제거 후 재설치하세요."
}

# 5. 설치 후 확인 명령어
Write-Host "`n✅ 설치 후 확인 명령어:" -ForegroundColor Green
Write-Host "━" * 25
Write-Host "python --version"
Write-Host "pip --version" 
Write-Host "python -c `"import sys; print(sys.executable)`""
Write-Host "pip list"

Write-Host "`n🎯 LG DX Dashboard 프로젝트 복구:" -ForegroundColor Magenta
Write-Host "━" * 35
Write-Host "cd c:\LG_DX_SCHOOL\lg-dx-dashboard"
Write-Host "pip install -r requirements.txt"
Write-Host "python scripts\supabase_mcp.py status"

Write-Host "완료되면 터미널을 재시작하고 다시 시도하세요." -ForegroundColor Green
