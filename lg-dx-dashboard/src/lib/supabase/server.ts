import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export const createServerClient = async () => {
  const cookieStore = await cookies()
  return createServerComponentClient<Database>({ 
    cookies: () => cookieStore
  })
}