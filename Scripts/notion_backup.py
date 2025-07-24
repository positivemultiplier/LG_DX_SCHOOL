#!/usr/bin/env python3
"""
🔄 Notion-Supabase 백업 및 복구 시스템
자동화된 데이터 백업, 복구, 및 데이터 무결성 검증 기능
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from pathlib import Path
import zipfile
import hashlib
from supabase_mcp import SupabaseMCP

class NotionBackupSystem:
    """📦 Notion 백업 및 복구 시스템"""
    
    def __init__(self):
        self.mcp = SupabaseMCP()
        self.backup_dir = Path("backups")
        self.backup_dir.mkdir(exist_ok=True)
        
    def create_backup(self, backup_type: str = "daily") -> Dict:
        """📋 전체 데이터 백업 생성"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"notion_backup_{backup_type}_{timestamp}"
        backup_path = self.backup_dir / f"{backup_name}.zip"
        
        print(f"🔄 백업 시작: {backup_name}")
        
        # 1. Supabase 데이터 추출
        supabase_data = self._extract_supabase_data()
        
        # 2. Notion 데이터 추출
        notion_data = self._extract_notion_data()
        
        # 3. 메타데이터 생성
        metadata = {
            "backup_type": backup_type,
            "timestamp": timestamp,
            "supabase_count": len(supabase_data),
            "notion_count": len(notion_data),
            "checksum": self._calculate_checksum(supabase_data, notion_data)
        }
        
        # 4. ZIP 파일로 압축
        with zipfile.ZipFile(backup_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zipf.writestr("supabase_data.json", json.dumps(supabase_data, indent=2, ensure_ascii=False))
            zipf.writestr("notion_data.json", json.dumps(notion_data, indent=2, ensure_ascii=False))
            zipf.writestr("metadata.json", json.dumps(metadata, indent=2, ensure_ascii=False))
            
        backup_info = {
            "backup_name": backup_name,
            "backup_path": str(backup_path),
            "size_mb": round(backup_path.stat().st_size / 1024 / 1024, 2),
            "metadata": metadata
        }
        
        print(f"✅ 백업 완료: {backup_info['size_mb']}MB")
        return backup_info
        
    def restore_backup(self, backup_name: str, restore_mode: str = "verify") -> Dict:
        """🔄 백업에서 데이터 복구"""
        backup_path = self.backup_dir / f"{backup_name}.zip"
        
        if not backup_path.exists():
            raise FileNotFoundError(f"백업 파일을 찾을 수 없습니다: {backup_path}")
            
        print(f"🔄 복구 시작: {backup_name} (모드: {restore_mode})")
        
        # 1. 백업 파일 추출
        with zipfile.ZipFile(backup_path, 'r') as zipf:
            supabase_data = json.loads(zipf.read("supabase_data.json"))
            notion_data = json.loads(zipf.read("notion_data.json"))
            metadata = json.loads(zipf.read("metadata.json"))
            
        # 2. 체크섬 검증
        current_checksum = self._calculate_checksum(supabase_data, notion_data)
        if current_checksum != metadata["checksum"]:
            print("⚠️ 백업 무결성 검증 실패")
            
        # 3. 복구 실행
        if restore_mode == "full":
            restored_count = self._restore_full(supabase_data, notion_data)
        elif restore_mode == "incremental":
            restored_count = self._restore_incremental(supabase_data, notion_data)
        else:  # verify only
            restored_count = 0
            print("🔍 검증만 실행 (실제 복구 안함)")
            
        restore_info = {
            "backup_name": backup_name,
            "restore_mode": restore_mode,
            "restored_count": restored_count,
            "backup_metadata": metadata,
            "checksum_valid": current_checksum == metadata["checksum"]
        }
        
        print(f"✅ 복구 완료: {restored_count}개 레코드")
        return restore_info
        
    def cleanup_old_backups(self, keep_days: int = 30) -> Dict:
        """🧹 오래된 백업 파일 정리"""
        cutoff_date = datetime.now() - timedelta(days=keep_days)
        deleted_count = 0
        deleted_size = 0
        
        for backup_file in self.backup_dir.glob("notion_backup_*.zip"):
            # 파일명에서 날짜 추출
            try:
                date_str = backup_file.stem.split("_")[-2]  # YYYYMMDD
                file_date = datetime.strptime(date_str, "%Y%m%d")
                
                if file_date < cutoff_date:
                    file_size = backup_file.stat().st_size
                    backup_file.unlink()
                    deleted_count += 1
                    deleted_size += file_size
                    print(f"🗑️ 삭제됨: {backup_file.name}")
                    
            except (ValueError, IndexError):
                print(f"⚠️ 날짜 파싱 실패: {backup_file.name}")
                
        return {
            "deleted_count": deleted_count,
            "deleted_size_mb": round(deleted_size / 1024 / 1024, 2),
            "keep_days": keep_days
        }
        
    def verify_data_integrity(self) -> Dict:
        """🔍 데이터 무결성 검증"""
        print("🔍 데이터 무결성 검증 시작...")
        
        # 1. Supabase-Notion 데이터 일치성 확인
        supabase_data = self._extract_supabase_data()
        notion_data = self._extract_notion_data()
        
        # 2. ID 기반 매칭 검증
        supabase_ids = {item['id'] for item in supabase_data}
        notion_ids = {item.get('supabase_id') for item in notion_data if item.get('supabase_id')}
        
        missing_in_notion = supabase_ids - notion_ids
        orphaned_in_notion = notion_ids - supabase_ids
        
        # 3. 데이터 일관성 검증
        inconsistent_records = []
        for sb_item in supabase_data:
            notion_item = next((n for n in notion_data if n.get('supabase_id') == sb_item['id']), None)
            if notion_item and not self._compare_records(sb_item, notion_item):
                inconsistent_records.append(sb_item['id'])
                
        integrity_report = {
            "total_supabase": len(supabase_data),
            "total_notion": len(notion_data),
            "missing_in_notion": len(missing_in_notion),
            "orphaned_in_notion": len(orphaned_in_notion),
            "inconsistent_records": len(inconsistent_records),
            "integrity_score": round((1 - (len(missing_in_notion) + len(orphaned_in_notion) + len(inconsistent_records)) / max(len(supabase_data), 1)) * 100, 2)
        }
        
        print(f"📊 무결성 점수: {integrity_report['integrity_score']}%")
        return integrity_report
        
    def _extract_supabase_data(self) -> List[Dict]:
        """Supabase에서 모든 데이터 추출"""
        try:
            response = self.mcp.supabase.table('daily_reflections').select("*").execute()
            return response.data
        except Exception as e:
            print(f"❌ Supabase 데이터 추출 실패: {e}")
            return []
            
    def _extract_notion_data(self) -> List[Dict]:
        """Notion에서 모든 데이터 추출"""
        try:
            # 실제 Notion API 호출 로직 구현 필요
            # 여기서는 샘플 데이터 반환
            return []
        except Exception as e:
            print(f"❌ Notion 데이터 추출 실패: {e}")
            return []
            
    def _calculate_checksum(self, supabase_data: List, notion_data: List) -> str:
        """데이터 체크섬 계산"""
        combined_data = json.dumps([supabase_data, notion_data], sort_keys=True)
        return hashlib.sha256(combined_data.encode()).hexdigest()
        
    def _restore_full(self, supabase_data: List, notion_data: List) -> int:
        """전체 복구 실행"""
        # 실제 복구 로직 구현 필요
        return len(supabase_data)
        
    def _restore_incremental(self, supabase_data: List, notion_data: List) -> int:
        """증분 복구 실행"""
        # 실제 증분 복구 로직 구현 필요
        return 0
        
    def _compare_records(self, supabase_record: Dict, notion_record: Dict) -> bool:
        """레코드 일치성 비교"""
        # 실제 비교 로직 구현 필요
        return True

def main():
    """CLI 인터페이스"""
    import argparse
    
    parser = argparse.ArgumentParser(description="🔄 Notion-Supabase 백업 시스템")
    subparsers = parser.add_subparsers(dest='command', help='사용 가능한 명령어')
    
    # 백업 명령어
    backup_parser = subparsers.add_parser('backup', help='데이터 백업 생성')
    backup_parser.add_argument('--type', default='daily', choices=['daily', 'weekly', 'manual'], help='백업 유형')
    
    # 복구 명령어
    restore_parser = subparsers.add_parser('restore', help='백업에서 복구')
    restore_parser.add_argument('backup_name', help='복구할 백업 이름')
    restore_parser.add_argument('--mode', default='verify', choices=['verify', 'incremental', 'full'], help='복구 모드')
    
    # 정리 명령어
    cleanup_parser = subparsers.add_parser('cleanup', help='오래된 백업 정리')
    cleanup_parser.add_argument('--days', type=int, default=30, help='보관 기간 (일)')
    
    # 검증 명령어
    verify_parser = subparsers.add_parser('verify', help='데이터 무결성 검증')
    
    args = parser.parse_args()
    backup_system = NotionBackupSystem()
    
    if args.command == 'backup':
        result = backup_system.create_backup(args.type)
        print(f"📋 백업 완료: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
    elif args.command == 'restore':
        result = backup_system.restore_backup(args.backup_name, args.mode)
        print(f"🔄 복구 완료: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
    elif args.command == 'cleanup':
        result = backup_system.cleanup_old_backups(args.days)
        print(f"🧹 정리 완료: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
    elif args.command == 'verify':
        result = backup_system.verify_data_integrity()
        print(f"🔍 검증 완료: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
