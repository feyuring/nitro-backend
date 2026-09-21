import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
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

  // ?? 查询 users 表
  const { data: user, error } = await supabase
    .from('users')
    .select('id,username,password_hash')
    .eq('username', username)
    .single()

  if (error || !user) {
    return { success: false, msg: "用户名不存在" }
  }

  const passOk = await bcrypt.compare(password, user.password_hash)
  if (!passOk) {
    return { success: false, msg: "密码错误" }
  }

  const jwtSecret = process.env.JWT_SECRET as string
  const token = jwt.sign(
    {
      userId: user.id,
      username: user.username
    },
    jwtSecret,
    { expiresIn: '7d' }
  )

  return {
    success: true,
    msg: "登录成功",
    data: {
      token,
      user: {
        id: user.id,
        username: user.username
      }
    }
  }
})
