#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
문화공공데이터광장 API - 채식/글루틴프리/할랄 음식점 크롤러
API: 한국문화정보원_전국 세계음식점
"""

import requests
import json
import pandas as pd
import time
from datetime import datetime
from pathlib import Path
import xml.etree.ElementTree as ET
import os
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv(Path(__file__).parent.parent.parent / '.env')

# 출력 디렉토리
OUTPUT_DIR = Path(__file__).parent / "data" / "raw"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# API 설정
API_BASE_URL = "https://api.kcisa.kr/openapi/API_TOU_052/request"

def get_world_restaurants(service_key, page_no=1, num_of_rows=100, keyword=""):
    """
    전국 세계음식점 데이터 조회
    
    Args:
        service_key: API 인증키
        page_no: 페이지 번호
        num_of_rows: 한 페이지당 결과 수
        keyword: 검색어
    
    Returns:
        dict: API 응답 데이터
    """
    params = {
        'serviceKey': service_key,
        'pageNo': page_no,
        'numOfRows': num_of_rows,
        'keyword': keyword
    }
    
    try:
        response = requests.get(API_BASE_URL, params=params, timeout=30)
        response.raise_for_status()
        
        # XML 파싱
        root = ET.fromstring(response.content)
        
        # 결과 추출
        result_code = root.find('.//resultCode')
        result_msg = root.find('.//resultMsg')
        
        if result_code is not None and result_code.text == '0000':
            # 성공 - 데이터 추출
            items = []
            for item in root.findall('.//item'):
                restaurant = {}
                for child in item:
                    restaurant[child.tag] = child.text
                items.append(restaurant)
            
            total_count = root.find('.//totalCount')
            
            return {
                'success': True,
                'totalCount': int(total_count.text) if total_count is not None else 0,
                'items': items,
                'message': result_msg.text if result_msg is not None else 'Success'
            }
        else:
            return {
                'success': False,
                'message': result_msg.text if result_msg is not None else 'Unknown error'
            }
    
    except requests.exceptions.RequestException as e:
        print(f"⚠️  API 요청 실패: {e}")
        return {'success': False, 'message': str(e)}
    except ET.ParseError as e:
        print(f"⚠️  XML 파싱 실패: {e}")
        return {'success': False, 'message': str(e)}

def parse_restaurant_info(information):
    """
    시설정보 필드에서 채식/할랄/글루텐프리 정보 추출
    
    정보 형식: "무료주차 가능|발렛주차 불가|유아의자 대여 불가|
               휠체어 대여 불가|반려동물 동반 입장불가|
               채식 메뉴 없음|할랄음식 메뉴 없음|글루텐프리 메뉴 없음"
    """
    if not information:
        return {
            'vegetarian': None,
            'halal': None,
            'gluten_free': None,
            'parking': None,
            'valet_parking': None,
            'baby_chair': None,
            'wheelchair': None,
            'pets_allowed': None
        }
    
    info_dict = {
        'vegetarian': None,
        'halal': None,
        'gluten_free': None,
        'parking': None,
        'valet_parking': None,
        'baby_chair': None,
        'wheelchair': None,
        'pets_allowed': None
    }
    
    # 기준으로 분리
    parts = information.split('|')
    
    for part in parts:
        part = part.strip()
        
        # 채식
        if '채식' in part:
            if '없음' in part or '불가' in part:
                info_dict['vegetarian'] = 'No'
            elif '가능' in part or '있음' in part:
                info_dict['vegetarian'] = 'Yes'
        
        # 할랄
        if '할랄' in part:
            if '없음' in part or '불가' in part:
                info_dict['halal'] = 'No'
            elif '가능' in part or '있음' in part:
                info_dict['halal'] = 'Yes'
        
        # 글루텐프리
        if '글루텐' in part:
            if '없음' in part or '불가' in part:
                info_dict['gluten_free'] = 'No'
            elif '가능' in part or '있음' in part:
                info_dict['gluten_free'] = 'Yes'
        
        # 주차
        if '무료주차' in part:
            if '불가' in part:
                info_dict['parking'] = 'No'
            elif '가능' in part:
                info_dict['parking'] = 'Yes'
        
        # 발렛주차
        if '발렛' in part:
            if '불가' in part:
                info_dict['valet_parking'] = 'No'
            elif '가능' in part:
                info_dict['valet_parking'] = 'Yes'
        
        # 유아의자
        if '유아의자' in part:
            if '불가' in part:
                info_dict['baby_chair'] = 'No'
            elif '가능' in part:
                info_dict['baby_chair'] = 'Yes'
        
        # 휠체어
        if '휠체어' in part:
            if '불가' in part:
                info_dict['wheelchair'] = 'No'
            elif '가능' in part:
                info_dict['wheelchair'] = 'Yes'
        
        # 반려동물
        if '반려동물' in part or '애완동물' in part:
            if '불가' in part or '입장불가' in part:
                info_dict['pets_allowed'] = 'No'
            elif '가능' in part:
                info_dict['pets_allowed'] = 'Yes'
    
    return info_dict

def parse_coordinates(coordinates):
    """좌표 파싱"""
    if not coordinates:
        return None, None
    
    try:
        # 형식: "N37.331773, E126.796648"
        parts = coordinates.replace('N', '').replace('E', '').split(',')
        lat = float(parts[0].strip())
        lon = float(parts[1].strip())
        return lat, lon
    except:
        return None, None

def collect_all_restaurants(service_key, max_pages=None):
    """
    전체 음식점 데이터 수집
    
    Args:
        service_key: API 인증키
        max_pages: 최대 페이지 수 (None이면 전체)
    
    Returns:
        list: 음식점 리스트
    """
    all_restaurants = []
    page = 1
    num_of_rows = 100  # 한 페이지당 100개
    
    print(f"🍽️  전국 세계음식점 데이터 수집 시작...")
    
    while True:
        print(f"\n📄 페이지 {page} 조회 중...")
        
        result = get_world_restaurants(
            service_key=service_key,
            page_no=page,
            num_of_rows=num_of_rows
        )
        
        if not result['success']:
            print(f"⚠️  오류: {result['message']}")
            break
        
        items = result['items']
        total_count = result['totalCount']
        
        if not items:
            print("✅ 더 이상 데이터가 없습니다.")
            break
        
        print(f"   - 수집: {len(items)}개")
        print(f"   - 전체: {total_count}개")
        
        all_restaurants.extend(items)
        
        # 최대 페이지 체크
        if max_pages and page >= max_pages:
            print(f"\n⚠️  최대 페이지({max_pages}) 도달")
            break
        
        # 전체 데이터 수집 완료 체크
        if len(all_restaurants) >= total_count:
            print("\n✅ 전체 데이터 수집 완료")
            break
        
        page += 1
        time.sleep(0.5)  # API 부하 방지
    
    return all_restaurants

def filter_dietary_restaurants(restaurants):
    """
    채식/할랄/글루텐프리 음식점 필터링
    
    Args:
        restaurants: 전체 음식점 리스트
    
    Returns:
        dict: 필터링된 음식점 (vegetarian, halal, gluten_free)
    """
    vegetarian_list = []
    halal_list = []
    gluten_free_list = []
    
    for restaurant in restaurants:
        info = parse_restaurant_info(restaurant.get('information', ''))
        
        # 데이터 보강
        lat, lon = parse_coordinates(restaurant.get('coordinates'))
        restaurant['latitude'] = lat
        restaurant['longitude'] = lon
        restaurant.update(info)
        
        # 필터링
        if info['vegetarian'] == 'Yes':
            vegetarian_list.append(restaurant)
        
        if info['halal'] == 'Yes':
            halal_list.append(restaurant)
        
        if info['gluten_free'] == 'Yes':
            gluten_free_list.append(restaurant)
    
    return {
        'vegetarian': vegetarian_list,
        'halal': halal_list,
        'gluten_free': gluten_free_list
    }

def save_data(restaurants, dietary_filtered):
    """데이터 저장"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # 1. 전체 데이터 저장 (JSON)
    json_path = OUTPUT_DIR / f"world_restaurants_all_{timestamp}.json"
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(restaurants, f, ensure_ascii=False, indent=2)
    print(f"\n✅ 전체 데이터 저장: {json_path}")
    print(f"   - 총 {len(restaurants)}개 음식점")
    
    # 2. 전체 데이터 CSV
    df_all = pd.DataFrame(restaurants)
    csv_all_path = OUTPUT_DIR / f"world_restaurants_all_{timestamp}.csv"
    df_all.to_csv(csv_all_path, index=False, encoding='utf-8-sig')
    print(f"✅ 전체 CSV 저장: {csv_all_path}")
    
    # 3. 채식 음식점 저장
    if dietary_filtered['vegetarian']:
        df_veg = pd.DataFrame(dietary_filtered['vegetarian'])
        veg_path = OUTPUT_DIR / f"vegetarian_restaurants_{timestamp}.csv"
        df_veg.to_csv(veg_path, index=False, encoding='utf-8-sig')
        print(f"\n🥗 채식 음식점: {len(dietary_filtered['vegetarian'])}개")
        print(f"   저장: {veg_path}")
    else:
        print(f"\n⚠️  채식 음식점: 0개")
    
    # 4. 할랄 음식점 저장
    if dietary_filtered['halal']:
        df_halal = pd.DataFrame(dietary_filtered['halal'])
        halal_path = OUTPUT_DIR / f"halal_restaurants_{timestamp}.csv"
        df_halal.to_csv(halal_path, index=False, encoding='utf-8-sig')
        print(f"\n🕌 할랄 음식점: {len(dietary_filtered['halal'])}개")
        print(f"   저장: {halal_path}")
    else:
        print(f"\n⚠️  할랄 음식점: 0개")
    
    # 5. 글루텐프리 음식점 저장
    if dietary_filtered['gluten_free']:
        df_gf = pd.DataFrame(dietary_filtered['gluten_free'])
        gf_path = OUTPUT_DIR / f"gluten_free_restaurants_{timestamp}.csv"
        df_gf.to_csv(gf_path, index=False, encoding='utf-8-sig')
        print(f"\n🌾 글루텐프리 음식점: {len(dietary_filtered['gluten_free'])}개")
        print(f"   저장: {gf_path}")
    else:
        print(f"\n⚠️  글루텐프리 음식점: 0개")

def main():
    """메인 실행"""
    print("="*70)
    print("문화공공데이터광장 - 채식/할랄/글루텐프리 음식점 크롤러")
    print("="*70)
    
    # API 키 확인
    service_key = os.getenv('CULTURE_API_KEY')
    
    if not service_key:
        print("\n⚠️  오류: CULTURE_API_KEY가 .env 파일에 없습니다.")
        print("\n📝 설정 방법:")
        print("   1. https://www.culture.go.kr/data 접속")
        print("   2. 회원가입 및 로그인")
        print("   3. '한국문화정보원_전국 세계음식점' API 활용신청")
        print("   4. 발급받은 서비스키를 .env 파일에 추가:")
        print("      CULTURE_API_KEY=발급받은키")
        return
    
    print(f"✅ API 키 확인 완료")
    
    # 데이터 수집
    restaurants = collect_all_restaurants(
        service_key=service_key,
        max_pages=None  # 전체 수집 (테스트 시 max_pages=2 등으로 제한 가능)
    )
    
    if not restaurants:
        print("\n⚠️  수집된 데이터가 없습니다.")
        return
    
    print(f"\n📊 총 수집: {len(restaurants)}개 음식점")
    
    # 채식/할랄/글루텐프리 필터링
    print(f"\n🔍 채식/할랄/글루텐프리 음식점 필터링 중...")
    dietary_filtered = filter_dietary_restaurants(restaurants)
    
    # 데이터 저장
    save_data(restaurants, dietary_filtered)
    
    # 통계 출력
    print("\n" + "="*70)
    print("📊 수집 통계")
    print("="*70)
    print(f"전체 음식점:        {len(restaurants):,}개")
    print(f"채식 음식점:        {len(dietary_filtered['vegetarian']):,}개 ({len(dietary_filtered['vegetarian'])/len(restaurants)*100:.1f}%)")
    print(f"할랄 음식점:        {len(dietary_filtered['halal']):,}개 ({len(dietary_filtered['halal'])/len(restaurants)*100:.1f}%)")
    print(f"글루텐프리 음식점:  {len(dietary_filtered['gluten_free']):,}개 ({len(dietary_filtered['gluten_free'])/len(restaurants)*100:.1f}%)")
    print("="*70)
    
    print("\n✅ 크롤링 완료!")

if __name__ == "__main__":
    main()
