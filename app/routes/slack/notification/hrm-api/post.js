import { execute } from '@root/util'
import handleLeaveApplication from '@routes/applications/leaves/_leaveAppId/patch'
import handlePaymentApplication from '@routes/applications/payments/_paymentAppId/patch'
import handleTimesheetApplication from '@routes/applications/timesheets/_timesheetAppId/patch'
import { userCollection } from '@root/database'

const slackAction = {
  leaveApplication: {
    name: 'leave-application',
    approved: 'Approve',
    reject: 'Reject',
  },
  timesheetApplication: {
    name: 'timesheet-application',
    approved: 'Approve',
    reject: 'Reject',
  },
  paymentRequest: {
    name: 'payment-request',
    approve: 'Approve',
    reject: 'Reject',
  },
}

export default async (req, res) => {
  try {
    const { payload } = req.body
    if (!payload) return res.send(responseSlackRequest(400))
    const { actions = [], callback_id, user } = JSON.parse(payload)
    const [action] = actions
    const slackId = user.id
    if (!slackId) return res.send(responseSlackRequest(400))
    const userQuery = await userCollection()
      .where('slackId', '==', slackId)
      .get()
    if (userQuery.empty)
      return res.send('Your slack account is not registered on HRM system')
    const userInfo = {
      id: userQuery.docs[0].data().id,
      positionPermissionId: userQuery.docs[0].data().positionPermissionId,
    }
    if (action.name === slackAction.leaveApplication.name) {
      const { status } = await executeLeaveApplication(
        userInfo,
        callback_id,
        action.value === slackAction.leaveApplication.approved ? 1 : 0
      )
      return res.send(responseSlackRequest(status))
    }
    if (action.name === slackAction.paymentRequest.name) {
      const { status } = await executePaymentRequest(
        userInfo,
        callback_id,
        action.value === slackAction.paymentRequest.approve ? 1 : 0
      )
      return res.send(responseSlackRequest(status))
    }
    if (action.name === slackAction.timesheetApplication.name) {
      const { status } = await executeTimesheetApplication(
        userInfo,
        callback_id,
        action.value === slackAction.timesheetApplication.approved ? 1 : 0
      )
      return res.send(responseSlackRequest(status))
    }
    return res.send(responseSlackRequest(400))
  } catch (error) {
    res.send(responseSlackRequest(500))
  }
}

const executeLeaveApplication = async (userInfo, leaveAppId, isApproved) => {
  return await execute(handleLeaveApplication, {
    user: { ...userInfo },
    params: { leaveAppId },
    query: { isApproved },
  })
}

const executePaymentRequest = async (userInfo, paymentAppId, isApproved) => {
  return await execute(handlePaymentApplication, {
    user: { ...userInfo },
    params: { paymentAppId },
    query: { isApproved },
  })
}

const executeTimesheetApplication = async (
  userInfo,
  timesheetAppId,
  isApproved
) => {
  return await execute(handleTimesheetApplication, {
    user: { ...userInfo },
    params: { timesheetAppId },
    query: { isApproved },
  })
}

const responseSlackRequest = (status) => {
  if (status === 200) {
    return `Your approve/reject request was successful`
  }
  if (status === 403) {
    return `You are not authorized to make approve/reject request`
  }
  if (status === 404) {
    return 'Your requestId is not found'
  }
  if (status === 500) {
    return `HRM  server error. Please try again`
  }
  return `Your approve/reject request isn't valid. Please re-check`
}
