import getUser from '@routes/users/_userId/get.js'
import { execute } from '@root/util.js'

export default async function initNewApprovalUser (userId) {
  const user = await execute(getUser, { params: { userId } } )
  const stingPermissionId = String(user.positionPermissionId)
  
  return {
    userId: user.id,
    name: user.fullName,
    createdDate: new Date(),
    approvalPoint: getApprovalPoint(stingPermissionId)
  }
}

function getApprovalPoint(permissionId) {
  switch (permissionId) {
    case process.env.POSITION_ADMIN: {
      return 3
    }
    case process.env.POSITION_EDITOR: {
      return 2
    }
    case process.env.POSITION_PROJECTMANAGER: {
      return 1
    }
    default: { 
      return 0
    }
  }
}
