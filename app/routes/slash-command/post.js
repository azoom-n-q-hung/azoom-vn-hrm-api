import commandParser from '@helpers/slash-command-parser'
import { execute } from '@root/util.js'
import getUserDetail from '@routes/users/_userId/get.js'
import getUserBySlackId from '@routes/users/_slackId/get.js'
import getUsers from '@routes/users/get.js'
import createUser from '@routes/users/post.js'
import updateUser from '@routes/users/_userId/put.js'
import deactiveUser from '@routes/users/_userId/deactive/patch.js'
import getMembers from '@routes/projects/_projectId/members/get.js'
import approvalTimesheetApp from '@routes/applications/timesheets/_timesheetAppId/patch.js'
import checkIn from '@routes/timesheets/checkin/post.js'
import checkOut from '@routes/timesheets/checkout/post.js'
import slackApi from '@helpers/slack-api'
import verifySlackRequest from '@helpers/verify-requests/slack'

exports.post = async (req, res) => {
  const request = req
  const { user_id } = req.body
  const commandText = req.body.text
  
  if (!verifySlackRequest(request))
    await slackPostMessage(user_id, 'We are sorry but we are not able to authenticate you.')

  const userResponse = await execute(getUserBySlackId, { params: { slackId: user_id } } )
  const user = userResponse.body
  if (!user)
    return await slackPostMessage(userId, 
      `> Sorry, You did not register account before
      > Please register HRM account first`)
  const params = commandParser(commandText)
  const {resource, action} = getSlashCommandAction(commandText)
  const slashCommands = {
    ':': () => {
      return `
        -------------------------------------------------------------------------
         R \`/hrm\` → Show help
         R \`/hrm users:profile userId={userId}\` → Get an user
         R \`/hrm users:list \` → Get all user
         R \`/hrm users \` → Get your info
        W \`/hrm users:create id=azoom-19 username=azoom-19 password=123456 email=azoom@gmail.com\` → Create an user
        W \`/hrm users:update id=azoom-19 username=azoom-19 password=123456 email=azoom@gmail.com\` → Update an user
        W \`/hrm users:deactive id=azoom-19\` → Deactive an user
         R \`/hrm project:get-member projectId=project-005\` → Get all member in project
         R \`/hrm applications-timesheets:approval timesheetAppId=tsa-001 status=approve\` → Approve or reject an timesheet application
        W \`/hrm checkin\` → Check in
        W \`/hrm checkout\` → Check out
        -------------------------------------------------------------------------
      `
    },
    'users:profile': async ({ params }) => {
      return execute(getUserDetail, { params: { userId: params.userId } } )
    },
    'users:list': async ({ user, params }) => {
      return execute(getUsers, { query: params, body: { user } } )
    },
    'users:': async ({ user }) => {
      return execute(getUserDetail, { params: { userId: user.id } } )
    },
    'users:create': async ({ user, params }) => {
      return execute(createUser, { body: params, user } )
    },
    'users:update': async ({ user, params }) => {
      return execute(updateUser, { body: params, user, params: { userId: params.id } } )
    },
    'users:deactive': async ({ user, params }) => {
      return execute(deactiveUser, { user, params: { userId: params.id } } )
    },
    'projects:get-member': async ({ params }) => {
      return execute(getMembers, { params: { projectId: params.projectId } } )
    },
    'applications-timesheets:approval': async ({ user, params }) => {
      //TODO need to take a look when API be refactor
      return execute(approvalTimesheetApp, { params: { timesheetAppId: params.timesheetAppId }, user, query: { isApproved: params.status === "approve" } } )
    },
    'users:permission': async ({ user, params }) => {},
    'permission:list': async ({ user, params }) => {},
    'projects:list': async ({ user, params }) => {},
    'projects:create': async ({ user, params }) => {},
    'projects:add-member': async ({ user, params }) => {},
    'projects:update-member': async ({ user, params }) => {},
    'projects:remove-member': async ({ user, params }) => {},
    'checkin:': async ({ user }) => {
      return execute(checkIn, { body: { userId: user.id } } )
    },
    'checkout:': async ({ user }) => {
      return execute(checkOut, { body: { userId: user.id } } )
    },
    'timesheets': async ({ user, params }) => {},
    'applications-timesheets:create': async ({ user, params }) => {},
    'applications-timesheets:list': async ({ user, params }) => {},
    'applications-timesheets:remove': async ({ user, params }) => {},
    'applications-timesheets:all': async ({ user, params }) => {},
    'application-leaves:create': async ({ user, params }) => {},
    'application-leaves:list': async ({ user, params }) => {},
    'application-leaves:approval': async ({ user, params }) => {},
    'application-leaves:delete': async ({ user, params }) => {},
  }

  const executeResponse = await slashCommands[`${resource}:${action}`]({user, action, params})
  
  await slackApi.post('/chat.postMessage', {
    body: {
      channel: user.slackId,
      text: executeResponse.body || executeResponse
    }
  })

  return res.sendStatus(200)
}

const slackPostMessage = async (channelId, message) => {
  await slackApi.post('/chat.postMessage', {
    body: {
      channel: channelId,
      text: message,
      as_user: true
    }
  })
}

const getSlashCommandAction = commandText => {
  if (!commandText) return {
    resource: "",
    action: ""
  }
  const [resourceArg = "", actionAndParam = ""] = commandText.split(':', 2)
  const [actionArg] = actionAndParam.split(' ', 1)
  const resource = {
    'u': 'users',
    'user': 'users',
    'users': 'users',
    'permission': 'permission',
    'permissions': 'permission',
    'per': 'permission',
    'projects': 'projects',
    'project': 'projects',
    'p': 'projects',
    'checkin': 'checkin',
    'in': 'checkin',
    'checkout': 'checkout',
    'out': 'checkout',
    'timesheet': 'timesheets',
    'timesheets': 'timesheets',
    'ts': 'timesheets',
    'applications-timesheet': 'applications-timesheets',
    'applications-timesheets': 'applications-timesheets',
    'ats': 'applications-timesheets',
    'application-leave': 'application-leaves',
    'application-leaves': 'application-leaves',
    'al': 'application-leaves'
  }[resourceArg] || ""
  const action = {
    'l': 'list',
    'list': 'list',
    'c': 'create',
    'create': 'create',
    'per': 'permission',
    'permission': 'permission',
    'd': 'deactive',
    'deactive': 'deactive',
    'u': 'update',
    'update': 'update',
    'p': 'profile',
    'profile': 'profile',
    'gm': 'get-member',
    'get-member': 'get-member',
    'am': 'add-member',
    'add-member': 'add-member',
    'um': 'update-member',
    'update-member': 'update-member',
    'rm': 'remove-member',
    'remove-member': 'remove-member',
    'ap': 'approval',
    'approval': 'approval',
    'r': 'remove',
    'remove': 'remove',
    'all': 'all',
    'del': 'delete'
  }[actionArg] || ""

  return {
    resource,
    action
  }
}
