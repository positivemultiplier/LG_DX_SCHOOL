import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase configuration missing',
        config: {
          url: !!supabaseUrl,
          serviceKey: !!supabaseServiceKey
        }
      });
    }

    // 서비스 롤로 Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 테이블 존재 확인
    const tables = ['users', 'subjects', 'daily_reflections'];
    const tableStatus: Record<string, any> = {};
    
    for (const tableName of tables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          tableStatus[tableName] = { exists: false, error: error.message };
        } else {
          tableStatus[tableName] = { exists: true, count: count || 0 };
        }
      } catch (err) {
        tableStatus[tableName] = { exists: false, error: 'Connection failed' };
      }
    }
    
    const allTablesExist = Object.values(tableStatus).every(
      (status: any) => status.exists
    );
    
    return NextResponse.json({ 
      success: true,
      database: {
        url: supabaseUrl,
        connected: true,
        tables: tableStatus,
        ready: allTablesExist
      },
      message: allTablesExist 
        ? 'Database is ready for use' 
        : 'Database needs setup - run SQL in Supabase dashboard'
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database status check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}