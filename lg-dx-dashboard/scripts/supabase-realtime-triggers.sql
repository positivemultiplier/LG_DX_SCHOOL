-- 🔄 실시간 Notion 동기화를 위한 Supabase 트리거 설정
-- daily_reflections 테이블에 새 데이터 삽입 시 webhook 호출

-- 1. webhook을 호출하는 함수 생성
CREATE OR REPLACE FUNCTION notify_notion_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- HTTP 요청을 통해 동기화 트리거
  PERFORM
    net.http_post(
      url := 'http://localhost:3000/api/sync-to-notion',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'record', row_to_json(NEW),
        'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END
      )::text
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. daily_reflections 테이블에 트리거 설정
DROP TRIGGER IF EXISTS trigger_notion_sync ON daily_reflections;
CREATE TRIGGER trigger_notion_sync
  AFTER INSERT OR UPDATE ON daily_reflections
  FOR EACH ROW
  EXECUTE FUNCTION notify_notion_sync();

-- 3. HTTP extension 활성화 (필요한 경우)
-- CREATE EXTENSION IF NOT EXISTS http;
-- 또는 supabase-cli에서: supabase db remote commit

-- 4. 함수 실행 권한 설정
GRANT EXECUTE ON FUNCTION notify_notion_sync() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_notion_sync() TO anon;
