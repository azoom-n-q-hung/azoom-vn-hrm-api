import commandParser from '@helpers/slash-command-parser'
import { execute } from '@root/util.js'
import getUserDetail from '@routes/users/_userId/get.js'
import getUserBySlackId from '@routes/users/_slackId/get.js'
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

  const user = await execute(getUserBySlackId, { params: { slackId: user_id } } )
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
         R \`/hrm users:list userId={userId}\` → Get all user
         W \`/hrm checkin\` → Check in
         W \`/hrm checkout\` → Check out
        -------------------------------------------------------------------------
      `
    },
    'users:profile': async ({ params }) => {
      return execute(getUserDetail, { params: { userId: params.userId } } )
    },

    'users:list': async ({ user }) => {},
    'users:create': async ({ user, params }) => {},
    'users:permission': async ({ user, params }) => {},
    'users:deactive': async ({ user, params }) => {},
    'users:update': async ({ user, params }) => {},
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
    'applications-timesheets:approval': async ({ user, params }) => {},
    'applications-timesheets:remove': async ({ user, params }) => {},
    'applications-timesheets:all': async ({ user, params }) => {},
    'application-leaves:create': async ({ user, params }) => {},
    'application-leaves:list': async ({ user, params }) => {},
    'application-leaves:approval': async ({ user, params }) => {},
    'application-leaves:delete': async ({ user, params }) => {},
  }

  await slackApi.post('/chat.postMessage', {
    body: {
      channel: user.slackId,
      text: await slashCommands[`${resource}:${action}`]({user, action, params})
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
