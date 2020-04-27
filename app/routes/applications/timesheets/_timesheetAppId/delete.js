import { execute } from '@root/util.js'
import { status } from '@constants/index'
import { timesheetApplicationCollection } from '@root/database'
import getExistTimesheetApp from '@routes/applications/timesheets/_timesheetAppId/get.js'
import getRole from '@helpers/users/getRole'

export default async (req, res) => {
  const userId = req.user.id
  const { timesheetAppId } = req.params

  const role = await getRole(userId)
  const exitTimesheetApp = await execute(getExistTimesheetApp, { params: { timesheetAppId } } )

  if (exitTimesheetApp.status !== status.inPending || exitTimesheetApp.approvalUsers.length !== 0) {
    return res.status(400).send({ message: 'You cannot delete the application which was approved/rejected.' })
  }
  
  if (role === 'admin' || exitTimesheetApp.userId === userId) {
    await timesheetApplicationCollection().doc(timesheetAppId).update({ isActive: 0 })
    return res.sendStatus(200)
  } else return res.sendStatus(403)
}
