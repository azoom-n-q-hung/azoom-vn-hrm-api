import { execute } from '@root/util.js'
import checkExistTimesheet from '@routes/timesheets/get.js'
import saveTimesheet from '@routes/timesheets/post.js'
import updateTimesheet from '@routes/timesheets/patch.js'
import { format } from 'date-fns/fp'

export default async (req, res) => {
  const userId = req.user.id
  const responseTimesheet = await execute(checkExistTimesheet, { params: { userId, time: new Date() } })
  const [checkedInRecord] = responseTimesheet.body

  if (!checkedInRecord) {
    const newTimesheet = {
      userId,
      checkedDate: new Date(),
      startTime: format('HH:mm', new Date()),
      endTime: '',
      created: new Date(),
      updated: '',
    }
    const saveResult = await execute(saveTimesheet, { body: newTimesheet })

    if (saveResult.status === 200 && saveResult.body) {
      return res.send({ message: 'Checkin successfully.' })
    } else throw new Error("Internal Server Error")
  } else if (!checkedInRecord.startTime) {
    const updateProperties = {
      startTime: format('HH:mm', new Date()),
      updated: new Date(),
    }
    const updateResult = await execute(updateTimesheet, { body: updateProperties, query: { timesheetAppId: checkedInRecord.id } })
    
    if (updateResult.status === 200 && updateResult.body) {
      return res.send({ message: 'Checkin successfully.' })
    } else throw new Error("Internal Server Error")
  } else {
    return res.send({ message: `You checked in at ${checkedInRecord.startTime}` })
  }
}
