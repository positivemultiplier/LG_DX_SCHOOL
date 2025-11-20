# 외국인 한국여행 불편사항 크롤링 및 분석 프로젝트
# PowerShell 자동화 파이프라인
# 작성: 2025-11-14

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   외국인 한국여행 불편사항 분석 파이프라인" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 0. 사전 확인
Write-Host "`n[0/7] 환경 확인 중..." -ForegroundColor Yellow

# .env 파일 확인
if (-not (Test-Path "04.DX_Groupx\.env")) {
    Write-Host "[ERROR] .env 파일이 없습니다." -ForegroundColor Red
    Write-Host "  .env.example을 복사하여 .env 파일을 생성하고 API 키를 입력하세요." -ForegroundColor Red
    Write-Host "  위치: 04.DX_Groupx\.env" -ForegroundColor Yellow
    exit 1
}

Write-Host "  ✓ .env 파일 확인 완료" -ForegroundColor Green

# 가상환경 확인
$venvPath = "04.DX_Groupx\.venv"
if (-not (Test-Path "$venvPath\Scripts\Activate.ps1")) {
    Write-Host "[INFO] 가상환경이 없습니다. 생성 중..." -ForegroundColor Yellow
    python -m venv $venvPath
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] 가상환경 생성 실패" -ForegroundColor Red
        exit 1
    }
}

Write-Host "  ✓ 가상환경 확인 완료" -ForegroundColor Green

# 가상환경 활성화
& "$venvPath\Scripts\Activate.ps1"
Write-Host "  ✓ 가상환경 활성화 완료" -ForegroundColor Green

# 의존성 설치
Write-Host "`n  의존성 설치 확인 중..." -ForegroundColor Yellow
pip install -q -r 04.DX_Groupx\requirements_crawling.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] 의존성 설치 실패" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ 의존성 설치 완료" -ForegroundColor Green

# 1. Reddit 크롤링
Write-Host "`n[1/7] Reddit 크롤링 시작..." -ForegroundColor Yellow
python 04.DX_Groupx\crawlers\reddit_korea_travel.py --limit 50
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Reddit 크롤링 실패" -ForegroundColor Red
    Write-Host "  API 키 확인: REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT" -ForegroundColor Yellow
    exit 1
}

# 2. YouTube 크롤링
Write-Host "`n[2/7] YouTube 크롤링 시작..." -ForegroundColor Yellow
python 04.DX_Groupx\crawlers\youtube_comments.py --max-videos 50 --max-comments 50
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] YouTube 크롤링 실패" -ForegroundColor Red
    Write-Host "  API 키 확인: YOUTUBE_API_KEY" -ForegroundColor Yellow
    Write-Host "  쿼터 초과 가능성 확인: https://console.cloud.google.com/" -ForegroundColor Yellow
    exit 1
}

# 3. Naver 블로그 크롤링
Write-Host "`n[3/7] Naver 블로그 크롤링 시작..." -ForegroundColor Yellow
python 04.DX_Groupx\crawlers\naver_blog_crawler.py --display 50
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Naver 크롤링 실패" -ForegroundColor Red
    Write-Host "  API 키 확인: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET" -ForegroundColor Yellow
    exit 1
}

# 4. 데이터 전처리 및 감성분석 (노트북 실행)
Write-Host "`n[4/7] 데이터 전처리 및 감성분석..." -ForegroundColor Yellow
if (Test-Path "04.DX_Groupx\analysis\preprocess_and_sentiment.ipynb") {
    jupyter nbconvert --to notebook --execute `
        --output preprocess_and_sentiment_executed.ipynb `
        04.DX_Groupx\analysis\preprocess_and_sentiment.ipynb
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARN] 전처리 노트북 실행 실패 (스킵)" -ForegroundColor Yellow
    } else {
        Write-Host "  ✓ 전처리 완료" -ForegroundColor Green
    }
} else {
    Write-Host "[WARN] preprocess_and_sentiment.ipynb 파일이 없습니다 (스킵)" -ForegroundColor Yellow
}

# 5. 토픽모델링 및 워드클라우드 (노트북 실행)
Write-Host "`n[5/7] 토픽모델링 및 워드클라우드 생성..." -ForegroundColor Yellow
if (Test-Path "04.DX_Groupx\analysis\topic_modeling.ipynb") {
    jupyter nbconvert --to notebook --execute `
        --output topic_modeling_executed.ipynb `
        04.DX_Groupx\analysis\topic_modeling.ipynb
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARN] 토픽모델링 노트북 실행 실패 (스킵)" -ForegroundColor Yellow
    } else {
        Write-Host "  ✓ 토픽모델링 완료" -ForegroundColor Green
    }
} else {
    Write-Host "[WARN] topic_modeling.ipynb 파일이 없습니다 (스킵)" -ForegroundColor Yellow
}

# 6. 결과 확인
Write-Host "`n[6/7] 결과 파일 확인..." -ForegroundColor Yellow

$rawFiles = Get-ChildItem "04.DX_Groupx\data\raw" -ErrorAction SilentlyContinue
$processedFiles = Get-ChildItem "04.DX_Groupx\data\processed" -ErrorAction SilentlyContinue
$figureFiles = Get-ChildItem "04.DX_Groupx\data\figures" -ErrorAction SilentlyContinue

Write-Host "`n  📁 원천 데이터 (data/raw/):" -ForegroundColor Cyan
if ($rawFiles) {
    $rawFiles | ForEach-Object { Write-Host "    - $($_.Name) ($([math]::Round($_.Length/1KB, 2)) KB)" -ForegroundColor White }
} else {
    Write-Host "    (없음)" -ForegroundColor Gray
}

Write-Host "`n  📁 처리 데이터 (data/processed/):" -ForegroundColor Cyan
if ($processedFiles) {
    $processedFiles | ForEach-Object { Write-Host "    - $($_.Name) ($([math]::Round($_.Length/1KB, 2)) KB)" -ForegroundColor White }
} else {
    Write-Host "    (없음)" -ForegroundColor Gray
}

Write-Host "`n  📁 시각화 (data/figures/):" -ForegroundColor Cyan
if ($figureFiles) {
    $figureFiles | ForEach-Object { Write-Host "    - $($_.Name) ($([math]::Round($_.Length/1KB, 2)) KB)" -ForegroundColor White }
} else {
    Write-Host "    (없음)" -ForegroundColor Gray
}

# 7. 완료 메시지
Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "   ✅ 파이프라인 실행 완료!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green

Write-Host "`n📊 다음 단계:" -ForegroundColor Cyan
Write-Host "  1. 데이터 확인: 04.DX_Groupx\data\raw\" -ForegroundColor White
Write-Host "  2. 노트북 실행: Jupyter에서 analysis/*.ipynb 열기" -ForegroundColor White
Write-Host "  3. 보고서 작성: ANALYSIS_REPORT.md 생성" -ForegroundColor White

Write-Host "`n💡 Tip:" -ForegroundColor Yellow
Write-Host "  - API 쿼터 부족 시: 다음날 재실행" -ForegroundColor White
Write-Host "  - 더 많은 데이터 수집: --limit, --max-videos 파라미터 증가" -ForegroundColor White
