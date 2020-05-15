import { WebClient } from '@slack/web-api'
const createWebClient = () => {
  return new WebClient(process.env.SLACK_BOT_TOKEN)
}

export const slackBot = createWebClient()
