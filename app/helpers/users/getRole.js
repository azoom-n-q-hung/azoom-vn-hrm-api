import getUser from '@routes/users/_userId/get.js'
import { execute } from '@root/util.js'

export default async function getRole (userId) {
  const user = await execute(getUser, { params: { userId } } )
  if (!user) return ""

  const stingPermissionId = String(user.positionPermissionId)
  switch (stingPermissionId) {
    case process.env.POSITION_ADMIN: {
      return "admin"
    }
    case process.env.POSITION_EDITOR: {
      return "editor"
    }
    case process.env.POSITION_PROJECTMANAGER: {
      return "project manager"
    }
    case process.env.POSITION_USER: {
      return "user"
    }
    default: { 
      return ""
    }
  }
}
