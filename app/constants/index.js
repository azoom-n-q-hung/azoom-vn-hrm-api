export const status = { inPending: -1, reject: 0, approved: 1 }

export const getRole = (permissionId) => {
  switch (permissionId) {
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
  }
}
