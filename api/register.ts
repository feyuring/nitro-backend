import bcrypt from 'bcrypt'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password) {
    return { success: false, msg: "用户名密码不能为空" }
  }
  const supabaseUrl = process.env.SUPABASE_URL as string
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
  const supabase = createClient(supabaseUrl, serviceKey)

  // 检查用户名是否已经存在
  const {data: existUser} = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()
  if(existUser){
    return {success:false, msg:"用户名已经被占用"}
  }

  // 密码哈希加密，加盐10轮
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  // 插入自建用户表 profiles
  const {error} = await supabase.from('profiles').insert({
    username,
    password_hash: passwordHash
  })
  if(error){
    return {success:false, msg:error.message}
  }
  return {success:true, msg:"注册成功"}
})
