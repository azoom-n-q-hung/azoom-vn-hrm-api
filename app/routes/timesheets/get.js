import { getTimesheetCollection } from '@root/database'
import initTimesheetId from '@helpers/timesheets/initTimesheetId'

export default async (req, res) => {
  try {
    const { userId, time = new Date() } = req.params
    
    if (!userId) {
      const timesheetsSnapshot = await getTimesheetCollection().get()
      res.send(timesheetsSnapshot.docs.map(timesheet => timesheet.data()))
    } else {
      const timesheetId = initTimesheetId(userId, time)
      const timesheetsSnapshot = await getTimesheetCollection().doc(timesheetId).get()
      const docsToday = timesheetsSnapshot.exists ? timesheetsSnapshot.data() : null

      res.send(docsToday)
    }
  } catch (error) {
    res.status(500).send({ message: 'Error when save timesheet to firebase.' })
  }
}
