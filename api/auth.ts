import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  // 白名单：登录、注册接口不需要校验token，直接放行
  const noAuthPath = ['/api/login','/api/register']
  if (noAuthPath.includes(event.path)) {
    return
  }

  // 从请求头拿token，格式：Authorization: Bearer xxxxxx
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: '未登录，缺少token'
    })
  }
  const token = authHeader.split(' ')[1]
  const jwtSecret = process.env.JWT_SECRET as string
  try {
    // 解析JWT，拿到用户信息，挂载到event.context，后面接口直接读取
    const payload = jwt.verify(token, jwtSecret) as {userId:number, username:string}
    event.context.user = payload
  } catch (e) {
    throw createError({
      statusCode: 401,
      statusMessage: 'token无效或者已过期，请重新登录'
    })
  }
})
