import { slackBot } from '@helpers/slack/createSlackbot'
import { execute } from '@root/util'
import saveNotification from '@routes/notifications/post.js'
// TODO: Cho ra chơi với constansts hoặc env
const urlChannel = `https://slack.com/app_redirect?channel=`
const colorNotification = '#3AA3E3'

export default async (req, res) => {
  const {
    receiverIds = [],
    senderId,
    title,
    content,
    typeNotice, //leave-application || payment-request & typeId = 1
    requestId, // if typeId == 1
    typeId, //1 || 0
    options,
  } = req.body
  try {
    if (
      receiverIds.length == 0 ||
      !senderId ||
      title == '' ||
      content == '' ||
      !typeId
    )
      return res.sendStatus(400)
    const getSenderInfo = await slackBot.users.info({ users: senderId })
    const [senderInfo] = getSenderInfo.users
    if (!senderInfo) return res.sendStatus(400)
    await receiverIds.forEach(async (memberId) => {
      const getReceiverInfo = await slackBot.users.info({ users: memberId })
      const [receiverInfo] = getReceiverInfo.users
      if (!receiverInfo) return execute(saveNotification, { body: req.body })
      const attachment = {
        author_name: senderInfo.name,
        title,
        text: content,
        callback_id: requestId,
        color: colorNotification,
        actions: [],
      }
      if (typeId === 1) {
        attachment.actions = renderActions(options, typeNotice)
      }

      const sendNotification = await slackBot.chat.postMessage({
        channel: memberId,
        text: `You have a notice from <${urlChannel}${senderInfo.id}|${senderInfo.name}>`,
        attachments: [attachment],
      })
      if (sendNotification.ok !== true) {
        await execute(saveNotification, { body: req.body })
      }
    })
    res.send({ message: 'Send Notification Successful' })
  } catch (error) {
    res.sendStatus(500)
  }
}

const renderActions = (options, typeNotice) => {
  return options.map((option) => {
    const { typeOption, value } = option
    const action = {
      name: typeNotice,
      type: typeOption,
      style: '',
      value,
      text: value,
    }
    if (value === 'Reject') {
      action.style = 'danger'
    } else if (value === 'Approve') {
      action.style = 'primary'
    } else action.style = 'default'
    return action
  })
}
