const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testDatabase() {
  console.log('🔍 Supabase 데이터베이스 상태 확인...')
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  
  const tables = ['users', 'subjects', 'daily_reflections', 'daily_statistics']
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1)
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
      } else {
        console.log(`✅ ${table}: ${count || 0} records`)
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`)
    }
  }

  // 인증 테스트
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    console.log('🔐 Auth session:', session ? 'Active' : 'None')
  } catch (err) {
    console.log('❌ Auth error:', err.message)
  }
}

testDatabase().catch(console.error)