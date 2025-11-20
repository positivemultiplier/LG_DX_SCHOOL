#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""채식/할랄/글루텐프리 음식점 데이터 분석"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from collections import Counter

# 한글 폰트 설정
plt.rcParams['font.family'] = 'Malgun Gothic'
plt.rcParams['axes.unicode_minus'] = False

# 데이터 로드
DATA_DIR = Path(__file__).parent / "data" / "raw"

# 최신 파일 찾기
veg_files = list(DATA_DIR.glob("vegetarian_restaurants_*.csv"))
halal_files = list(DATA_DIR.glob("halal_restaurants_*.csv"))
gf_files = list(DATA_DIR.glob("gluten_free_restaurants_*.csv"))
all_files = list(DATA_DIR.glob("world_restaurants_all_*.csv"))

if not veg_files:
    print("⚠️  데이터 파일이 없습니다. 먼저 crawler.py를 실행하세요.")
    exit(1)

# 최신 파일 선택
veg_file = sorted(veg_files)[-1]
halal_file = sorted(halal_files)[-1]
gf_file = sorted(gf_files)[-1]
all_file = sorted(all_files)[-1]

print("="*70)
print("채식/할랄/글루텐프리 음식점 데이터 분석")
print("="*70)

# 데이터 로드
df_all = pd.read_csv(all_file)
df_veg = pd.read_csv(veg_file)
df_halal = pd.read_csv(halal_file)
df_gf = pd.read_csv(gf_file)

print(f"\n📊 데이터 로드:")
print(f"   전체: {len(df_all):,}개")
print(f"   채식: {len(df_veg):,}개")
print(f"   할랄: {len(df_halal):,}개")
print(f"   글루텐프리: {len(df_gf):,}개")

# ===========================================
# 1. 카테고리별 분석
# ===========================================

print(f"\n📈 음식 카테고리 분석 (category2):")
category_counts = df_all['category2'].value_counts().head(10)
print(category_counts)

# ===========================================
# 2. 지역별 분포
# ===========================================

print(f"\n🗺️  채식 음식점 지역별 분포:")
if not df_veg.empty and 'address' in df_veg.columns:
    # 주소에서 시/도 추출
    df_veg['region'] = df_veg['address'].str.extract(r'\((\d+)\)([가-힣]+시|[가-힣]+도)')[1]
    veg_region_counts = df_veg['region'].value_counts().head(10)
    print(veg_region_counts)

print(f"\n🗺️  할랄 음식점 지역별 분포:")
if not df_halal.empty and 'address' in df_halal.columns:
    df_halal['region'] = df_halal['address'].str.extract(r'\((\d+)\)([가-힣]+시|[가-힣]+도)')[1]
    halal_region_counts = df_halal['region'].value_counts().head(10)
    print(halal_region_counts)

# ===========================================
# 3. 샘플 출력
# ===========================================

print(f"\n🥗 채식 음식점 샘플 (5개):")
if not df_veg.empty:
    for idx, row in df_veg.head(5).iterrows():
        print(f"\n{idx+1}. {row['title']}")
        print(f"   카테고리: {row.get('category2', 'N/A')}")
        print(f"   주소: {row['address']}")
        print(f"   전화: {row.get('tel', 'N/A')}")

print(f"\n🕌 할랄 음식점 샘플 (5개):")
if not df_halal.empty:
    for idx, row in df_halal.head(5).iterrows():
        print(f"\n{idx+1}. {row['title']}")
        print(f"   카테고리: {row.get('category2', 'N/A')}")
        print(f"   주소: {row['address']}")
        print(f"   전화: {row.get('tel', 'N/A')}")

print(f"\n🌾 글루텐프리 음식점 샘플 (전체 {len(df_gf)}개):")
if not df_gf.empty:
    for idx, row in df_gf.iterrows():
        print(f"\n{idx+1}. {row['title']}")
        print(f"   카테고리: {row.get('category2', 'N/A')}")
        print(f"   주소: {row['address']}")
        print(f"   전화: {row.get('tel', 'N/A')}")

# ===========================================
# 4. 시각화
# ===========================================

output_dir = Path(__file__).parent / "data" / "figures"
output_dir.mkdir(parents=True, exist_ok=True)

# 비율 차트
fig, axes = plt.subplots(1, 2, figsize=(15, 6))

# 1) 채식/할랄/글루텐프리 비율
dietary_counts = {
    '채식': len(df_veg),
    '할랈': len(df_halal),
    '글루텐프리': len(df_gf),
    '일반': len(df_all) - len(df_veg) - len(df_halal) - len(df_gf)
}

colors = ['#2ecc71', '#27ae60', '#f39c12', '#95a5a6']
axes[0].pie(
    dietary_counts.values(), 
    labels=dietary_counts.keys(), 
    autopct='%1.1f%%',
    colors=colors,
    startangle=90
)
axes[0].set_title('전국 세계음식점 식이 옵션 분포', fontsize=14, fontweight='bold')

# 2) TOP 10 음식 카테고리
top_categories = df_all['category2'].value_counts().head(10)
axes[1].barh(top_categories.index, top_categories.values, color='#3498db')
axes[1].set_xlabel('음식점 수', fontsize=11)
axes[1].set_title('TOP 10 음식 카테고리', fontsize=14, fontweight='bold')
axes[1].invert_yaxis()

plt.tight_layout()
chart_path = output_dir / 'dietary_restaurants_analysis.png'
plt.savefig(chart_path, dpi=300, bbox_inches='tight')
print(f"\n✅ 차트 저장: {chart_path}")

# 지역별 채식 음식점 분포
if not df_veg.empty and 'region' in df_veg.columns:
    fig, ax = plt.subplots(figsize=(12, 6))
    region_counts = df_veg['region'].value_counts().head(10)
    
    bars = ax.bar(range(len(region_counts)), region_counts.values, color='#2ecc71')
    ax.set_xticks(range(len(region_counts)))
    ax.set_xticklabels(region_counts.index, rotation=45, ha='right')
    ax.set_ylabel('음식점 수', fontsize=11)
    ax.set_title('채식 음식점 지역별 분포 (TOP 10)', fontsize=14, fontweight='bold')
    ax.grid(axis='y', alpha=0.3)
    
    # 막대 위 숫자
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height)}',
                ha='center', va='bottom', fontsize=10)
    
    plt.tight_layout()
    region_path = output_dir / 'vegetarian_by_region.png'
    plt.savefig(region_path, dpi=300, bbox_inches='tight')
    print(f"✅ 지역 차트 저장: {region_path}")

print("\n" + "="*70)
print("✅ 분석 완료!")
print("="*70)
