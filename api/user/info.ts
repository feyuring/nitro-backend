import { createClient } from '@supabase/supabase-js'
export default defineEventHandler(async (event)=>{
  // ? 直接从event.context拿到登录用户，中间件已经校验完token
  const {userId} = event.context.user
  const supabaseUrl = process.env.SUPABASE_URL as string
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
  const supabase = createClient(supabaseUrl, serviceKey)

  const {data} = await supabase.from('users').select('id,username,nickname,avatar').eq('id',userId).single()
  return {success:true, data}
})
