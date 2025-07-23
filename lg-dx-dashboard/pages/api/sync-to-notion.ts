// 🔄 실시간 Notion 동기화 API 엔드포인트
// /api/sync-to-notion.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Notion 설정
const NOTION_TOKEN = process.env.NOTION_API_TOKEN!;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!;

interface DailyReflection {
  id: string;
  user_id: string;
  date: string;
  time_part: string;
  understanding_score: number;
  concentration_score: number;
  achievement_score: number;
  total_score: number;
  condition: string;
  achievements: string[];
  challenges: string[];
  tomorrow_goals: string[];
  notes: string;
  created_at: string;
}

// Supabase 데이터를 Notion 형식으로 변환
function transformToNotionFormat(reflection: DailyReflection) {
  return {
    parent: {
      database_id: NOTION_DATABASE_ID
    },
    properties: {
      "제목": {
        "title": [
          {
            "text": {
              "content": `${reflection.date} - ${reflection.time_part} 리플렉션`
            }
          }
        ]
      },
      "날짜": {
        "date": {
          "start": reflection.date
        }
      },
      "시간대": {
        "select": {
          "name": reflection.time_part
        }
      },
      "이해도": {
        "number": reflection.understanding_score
      },
      "집중도": {
        "number": reflection.concentration_score
      },
      "성취도": {
        "number": reflection.achievement_score
      },
      "총점": {
        "number": reflection.total_score
      },
      "컨디션": {
        "select": {
          "name": reflection.condition
        }
      },
      "성취사항": {
        "multi_select": reflection.achievements?.slice(0, 5).map(achievement => ({
          "name": achievement
        })) || []
      },
      "도전과제": {
        "multi_select": reflection.challenges?.slice(0, 5).map(challenge => ({
          "name": challenge
        })) || []
      },
      "내일목표": {
        "multi_select": reflection.tomorrow_goals?.slice(0, 5).map(goal => ({
          "name": goal
        })) || []
      },
      "노트": {
        "rich_text": [
          {
            "text": {
              "content": reflection.notes?.substring(0, 2000) || ""
            }
          }
        ]
      },
      "Supabase_ID": {
        "rich_text": [
          {
            "text": {
              "content": reflection.id
            }
          }
        ]
      }
    }
  };
}

// Notion에 페이지 생성
async function createNotionPage(notionData: any): Promise<boolean> {
  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify(notionData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Notion 페이지 생성 성공: ${result.id}`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ Notion 페이지 생성 실패 (${response.status}):`, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Notion API 호출 오류:', error);
    return false;
  }
}

// 기존 Notion 페이지 확인
async function checkExistingNotionPage(supabaseId: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        filter: {
          property: "Supabase_ID",
          rich_text: {
            equals: supabaseId
          }
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      return result.results.length > 0;
    }
    return false;
  } catch (error) {
    console.error('❌ 기존 페이지 확인 오류:', error);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { table, operation, record } = req.body;

    console.log(`🔄 실시간 동기화 트리거: ${table} ${operation}`);
    console.log('📊 수신된 데이터:', record);

    // daily_reflections 테이블의 INSERT/UPDATE만 처리
    if (table !== 'daily_reflections' || !['INSERT', 'UPDATE'].includes(operation)) {
      return res.status(200).json({ 
        success: true, 
        message: '처리 대상이 아닙니다.',
        skipped: true 
      });
    }

    // 필수 환경 변수 확인
    if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
      console.error('❌ Notion 설정이 누락되었습니다.');
      return res.status(500).json({ 
        success: false, 
        error: 'Notion 설정이 누락되었습니다.' 
      });
    }

    const reflection = record as DailyReflection;

    // 기존 페이지 확인 (중복 방지)
    const exists = await checkExistingNotionPage(reflection.id);
    if (exists && operation === 'INSERT') {
      console.log(`ℹ️  이미 존재하는 페이지: ${reflection.id}`);
      return res.status(200).json({ 
        success: true, 
        message: '이미 동기화된 데이터입니다.',
        duplicate: true 
      });
    }

    // Notion 형식으로 변환
    const notionData = transformToNotionFormat(reflection);

    // Notion에 페이지 생성 (INSERT) 또는 업데이트 (UPDATE)
    if (operation === 'INSERT') {
      const success = await createNotionPage(notionData);
      
      if (success) {
        console.log(`✅ 실시간 동기화 완료: ${reflection.date} ${reflection.time_part}`);
        return res.status(200).json({ 
          success: true, 
          message: 'Notion 동기화 완료',
          reflection_id: reflection.id,
          notion_synced: true
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          error: 'Notion 페이지 생성 실패' 
        });
      }
    } else if (operation === 'UPDATE') {
      // UPDATE의 경우 기존 페이지를 찾아서 업데이트
      // 여기서는 간단히 새 페이지 생성으로 처리 (실제로는 page update API 사용)
      console.log(`🔄 업데이트 감지: ${reflection.id} (새 페이지 생성으로 처리)`);
      const success = await createNotionPage(notionData);
      
      return res.status(200).json({ 
        success: success, 
        message: success ? 'Notion 업데이트 완료' : 'Notion 업데이트 실패',
        reflection_id: reflection.id,
        notion_updated: success
      });
    }

  } catch (error) {
    console.error('❌ 실시간 동기화 오류:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류' 
    });
  }
}

// 개발 환경에서 테스트용 로그
if (process.env.NODE_ENV === 'development') {
  console.log('🔄 실시간 Notion 동기화 API 활성화됨');
  console.log('📍 엔드포인트: /api/sync-to-notion');
  console.log('🔗 Supabase URL:', supabaseUrl);
  console.log('🎨 Notion DB ID:', NOTION_DATABASE_ID?.substring(0, 8) + '...');
}
