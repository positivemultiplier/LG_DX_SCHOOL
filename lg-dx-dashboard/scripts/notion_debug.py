#!/usr/bin/env python3
"""
Notion API 토큰 검증 스크립트
"""

import os
import requests

def test_notion_token():
    """Notion API 토큰 직접 테스트"""
    
    # 환경 변수에서 토큰 읽기
    token = "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"
    
    print("🔍 Notion API 토큰 테스트")
    print("=" * 40)
    print(f"토큰 형식: {token[:10]}...{token[-10:]}")
    print(f"토큰 길이: {len(token)}")
    print(f"토큰 접두사: {token[:4]}")
    
    # API 호출 테스트
    headers = {
        "Authorization": f"Bearer {token}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
    }
    
    try:
        print("\n🌐 API 호출 테스트...")
        response = requests.get("https://api.notion.com/v1/users/me", headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ API 연결 성공!")
            return True
        else:
            print("❌ API 연결 실패")
            return False
            
    except Exception as e:
        print(f"❌ 요청 오류: {e}")
        return False

def check_page_access():
    """페이지 접근 권한 테스트"""
    token = "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"
    page_id = "2227307dc90b80beb4b5d8d36679df54"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
    }
    
    try:
        print(f"\n📄 페이지 접근 테스트 (ID: {page_id})")
        response = requests.get(f"https://api.notion.com/v1/pages/{page_id}", headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        
        if response.status_code == 200:
            print("✅ 페이지 접근 성공!")
            return True
        elif response.status_code == 404:
            print("❌ 페이지를 찾을 수 없음 (Integration 연결 필요)")
            return False
        else:
            print("❌ 페이지 접근 실패")
            return False
            
    except Exception as e:
        print(f"❌ 요청 오류: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Notion API 연결 진단 시작")
    print()
    
    # 1단계: 토큰 테스트
    token_ok = test_notion_token()
    
    # 2단계: 페이지 접근 테스트  
    if token_ok:
        page_ok = check_page_access()
    else:
        print("⏭️  토큰 문제로 페이지 테스트 건너뜀")
        page_ok = False
    
    print("\n" + "=" * 40)
    print("📊 진단 결과:")
    print(f"  토큰 유효성: {'✅' if token_ok else '❌'}")
    print(f"  페이지 접근: {'✅' if page_ok else '❌'}")
    
    if not token_ok:
        print("\n🔧 해결 방법:")
        print("1. Notion Developers에서 Integration 상태 확인")
        print("2. 새로운 토큰 재발급")
        print("3. 토큰 복사 시 공백/개행 문자 확인")
        
    elif not page_ok:
        print("\n🔧 해결 방법:")
        print("1. Notion 페이지에서 Share → Integration 연결")
        print("2. 'Can edit' 권한으로 설정")
        print("3. 페이지 ID 확인")
    else:
        print("\n🎉 모든 테스트 성공! API 연동 준비 완료!")
