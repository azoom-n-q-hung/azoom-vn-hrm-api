const { getProjectCollection } = require('@root/database')

const checkPermissionOfManage = async (managerId, memberId) => {
  const projects = await execute(getProject, { params: [{ managerId, memberId }] })
  return projects.length ? true : false
}
