import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Python 데이터 디렉토리 경로
    const dataDir = path.join(process.cwd(), '..', '..', 'data');
    const configDir = path.join(process.cwd(), '..', '..', 'config');
    
    const analysis = {
      data_directory: {
        exists: fs.existsSync(dataDir),
        path: dataDir,
        files: [] as string[]
      },
      config_directory: {
        exists: fs.existsSync(configDir),
        path: configDir,
        files: [] as string[]
      },
      migration_status: {
        subjects_ready: false,
        github_data_ready: false,
        dashboard_data_ready: false
      },
      file_analysis: {},
      database_status: {
        subjects_count: 0,
        reflections_count: 0,
        migration_needed: true
      }
    };

    // 데이터 파일 분석
    if (analysis.data_directory.exists) {
      try {
        const dataFiles = fs.readdirSync(dataDir);
        analysis.data_directory.files = dataFiles;

        // 각 파일 타입별 분석
        const githubFiles = dataFiles.filter(f => f.includes('github_heatmap'));
        const dashboardFiles = dataFiles.filter(f => f.includes('3part_dashboard'));
        const optimizationFiles = dataFiles.filter(f => f.includes('optimization'));
        const trendFiles = dataFiles.filter(f => f.includes('efficiency_trend'));

        analysis.file_analysis = {
          github_heatmap_files: githubFiles.length,
          dashboard_files: dashboardFiles.length,
          optimization_files: optimizationFiles.length,
          trend_files: trendFiles.length,
          total_files: dataFiles.length
        };

        analysis.migration_status.github_data_ready = githubFiles.length > 0;
        analysis.migration_status.dashboard_data_ready = dashboardFiles.length > 0;

      } catch (error) {
        console.error('데이터 디렉토리 읽기 오류:', error);
      }
    }

    // 설정 파일 분석
    if (analysis.config_directory.exists) {
      try {
        const configFiles = fs.readdirSync(configDir);
        analysis.config_directory.files = configFiles;

        analysis.migration_status.subjects_ready = configFiles.includes('subjects_mapping.json');

      } catch (error) {
        console.error('설정 디렉토리 읽기 오류:', error);
      }
    }

    // 기존 데이터베이스 상태 확인
    const { data: existingSubjects } = await supabase
      .from('subjects')
      .select('id, name, category')
      .limit(10);

    const { data: existingReflections } = await supabase
      .from('daily_reflections')
      .select('id, date, time_part')
      .limit(10);

    analysis.database_status = {
      subjects_count: existingSubjects?.length || 0,
      reflections_count: existingReflections?.length || 0,
      migration_needed: (existingSubjects?.length || 0) < 5
    };

    return NextResponse.json({
      success: true,
      analysis,
      recommendations: generateMigrationRecommendations(analysis)
    });

  } catch (error) {
    console.error('데이터 분석 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Data analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

function generateMigrationRecommendations(analysis: any): string[] {
  const recommendations = [];

  if (!analysis.data_directory.exists) {
    recommendations.push('❌ 데이터 디렉토리가 존재하지 않습니다. Python 시스템 데이터를 확인해주세요.');
  }

  if (!analysis.migration_status.subjects_ready) {
    recommendations.push('⚠️ subjects_mapping.json 파일이 없습니다. 기본 과목 데이터를 사용합니다.');
  }

  if (!analysis.migration_status.github_data_ready) {
    recommendations.push('⚠️ GitHub 히트맵 데이터가 없습니다. GitHub 연동을 확인해주세요.');
  }

  if (analysis.database_status?.migration_needed) {
    recommendations.push('✅ 데이터베이스 마이그레이션이 필요합니다. /api/migration/import를 실행하세요.');
  } else {
    recommendations.push('ℹ️ 데이터베이스에 기본 데이터가 이미 존재합니다.');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ 모든 데이터가 준비되었습니다. 마이그레이션을 시작할 수 있습니다.');
  }

  return recommendations;
}