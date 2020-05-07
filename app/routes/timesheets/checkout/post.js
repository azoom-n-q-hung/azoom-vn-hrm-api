import { execute } from '@root/util.js'
import getExistTimesheet from '@routes/timesheets/get.js'
import saveTimesheet from '@routes/timesheets/post.js'
import updateTimesheet from '@routes/timesheets/patch.js'
import { format } from 'date-fns/fp'

export default async (req, res) => {
  const userId = req.user.id
  const responseTimesheet = await execute(getExistTimesheet, { params: { userId, time: new Date() } })
  const [existedTimesheet] = responseTimesheet.body
  const endTime = format('HH:mm', new Date())
  const warningMessage = existedTimesheet && existedTimesheet.startTime ? '' : ' But you have not checked in today.'

  if (existedTimesheet && existedTimesheet.endTime) return res.send({ message: `You checked out at ${existedTimesheet.endTime}.${warningMessage}` })

  if (existedTimesheet && !existedTimesheet.endTime) {
    const editProperties = {
      endTime,
      updated: new Date(),
    }
    const updateResult = await execute(updateTimesheet, { body: editProperties, query: { timesheetAppId: existedTimesheet.id } })
    
    if (updateResult.status !== 200) throw new Error("Internal Server Error")
    return res.send({ message: `Checkout successfully at ${endTime}.${warningMessage}` })
  }

  const newTimesheet = {
    userId,
    checkedDate: new Date(),
    startTime: '',
    endTime,
    created: new Date(),
    updated: '',
  }
  const saveResult = await execute(saveTimesheet, { body: newTimesheet })

  if (saveResult.status !== 200) throw new Error("Internal Server Error")
  return res.send({ message: `Checkout successfully at ${endTime}. But you have not checked in today.` })
}
