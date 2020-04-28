import getProject from '@routes/projects/get.js'
import { execute } from '@root/util.js'

export default async function (managerId) {
  const projects = await execute(getProject, { query: { managerId } })
  if (projects.status === 404 || !projects.body) return [managerId]

  const memberIds = projects.body.reduce((memberIds, project) => {
    const activeMembersIds = project.members.filter(member => member.isActive).map(member => member.memberId)
    return [ ...memberIds, ...activeMembersIds]
  }, []) || []
  return [...new Set([].concat(memberIds, managerId))]
}
