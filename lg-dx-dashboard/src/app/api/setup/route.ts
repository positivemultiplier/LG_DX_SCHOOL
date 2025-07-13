import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 테이블 존재 확인
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'subjects', 'daily_reflections', 'daily_statistics']);

    const existingTables = tables?.map(t => t.table_name) || [];

    // 사용자 프로필 생성/업데이트
    let userCreated = false;
    if (existingTables.includes('users')) {
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url,
          updated_at: new Date().toISOString()
        });

      userCreated = !userError;
      if (userError) {
        console.error('User creation error:', userError);
      }
    }

    // 기본 과목 데이터 확인
    let subjectsCount = 0;
    if (existingTables.includes('subjects')) {
      const { count } = await supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true });
      
      subjectsCount = count || 0;
    }

    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User'
      },
      database: {
        existing_tables: existingTables,
        user_profile_created: userCreated,
        subjects_count: subjectsCount
      },
      message: existingTables.length === 4 
        ? 'Database is ready for use' 
        : 'Database tables need to be created in Supabase console'
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Setup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createServerClient();

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 현재 상태 확인
    const status = {
      authenticated: !!user,
      user_id: user.id,
      email: user.email,
    };

    return NextResponse.json({ 
      success: true,
      status,
      message: 'System status check completed'
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Status check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}