import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // 간단한 과목 삽입 테스트
    const testSubject = {
      name: 'Test Subject',
      category: 'Test',
      description: 'Test description',
      color_code: '#000000',
      icon: 'Test',
      difficulty_level: 1,
      estimated_hours: 10
    };
    
    console.log('Attempting to insert test subject...');
    
    const { data, error } = await supabase
      .from('subjects')
      .insert([testSubject])
      .select();
    
    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    }
    
    console.log('Insert successful:', data);
    
    // 전체 과목 조회
    const { data: allSubjects } = await supabase
      .from('subjects')
      .select('*');
    
    return NextResponse.json({ 
      success: true,
      inserted: data,
      all_subjects: allSubjects
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'API failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}