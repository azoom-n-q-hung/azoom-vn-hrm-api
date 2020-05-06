import { execute } from '@root/util.js'
import getExistTimesheet from '@routes/timesheets/get.js'
import saveTimesheet from '@routes/timesheets/post.js'
import updateTimesheet from '@routes/timesheets/patch.js'
import { format } from 'date-fns/fp'

export default async (req, res) => {
  const userId = req.user.id
  const responseTimesheet = await execute(getExistTimesheet, { params: { userId, time: new Date() } })
  const [existedTimesheet] = responseTimesheet.body

  if (!existedTimesheet) {
    const newTimesheet = {
      userId,
      checkedDate: new Date(),
      startTime: '',
      endTime: format('HH:mm', new Date()),
      created: new Date(),
      updated: '',
    }
    const saveResult = await execute(saveTimesheet, { body: newTimesheet })

    if (saveResult.status === 200 && saveResult.body) {
      return res.send({ message: 'Checkout successfully. But you have not checked in today' })
    } else throw new Error("Internal Server Error")
  } else {
    const editProperties = {
      endTime: format('HH:mm', new Date()),
      updated: new Date(),
    }
    const warningMessage = existedTimesheet.startTime ? '' : ' But you have not checked in today'
    const updateResult = await execute(updateTimesheet, { body: editProperties, query: { timesheetAppId: existedTimesheet.id } })
    
    if (updateResult.status === 200 && updateResult.body) {
      return res.send({ message: `Checkout successfully.${warningMessage}` })
    } else throw new Error("Internal Server Error")
  }
}
