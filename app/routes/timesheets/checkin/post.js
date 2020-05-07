import { execute } from '@root/util.js'
import checkExistTimesheet from '@routes/timesheets/get.js'
import saveTimesheet from '@routes/timesheets/post.js'
import updateTimesheet from '@routes/timesheets/patch.js'
import { format } from 'date-fns/fp'

export default async (req, res) => {
  const userId = req.user.id
  const responseTimesheet = await execute(checkExistTimesheet, { params: { userId, time: new Date() } })
  const [checkedInRecord] = responseTimesheet.body
  const startTime = format('HH:mm', new Date())

  if (checkedInRecord && checkedInRecord.startTime) return res.send({ message: `You checked in at ${checkedInRecord.startTime}.` })

  if (checkedInRecord && !checkedInRecord.startTime) {
    const updateProperties = {
      startTime,
      updated: new Date(),
    }
    const updateResult = await execute(updateTimesheet, { body: updateProperties, query: { timesheetAppId: checkedInRecord.id } })
    
    if (updateResult.status !== 200) throw new Error("Internal Server Error")
    return res.send({ message: `Checkin successfully at ${startTime}.` })
  }

  const newTimesheet = {
    userId,
    checkedDate: new Date(),
    startTime,
    endTime: '',
    created: new Date(),
    updated: '',
  }
  const saveResult = await execute(saveTimesheet, { body: newTimesheet })

  if (saveResult.status !== 200) throw new Error("Internal Server Error")
  return res.send({ message: `Checkin successfully at ${startTime}.` })
}
