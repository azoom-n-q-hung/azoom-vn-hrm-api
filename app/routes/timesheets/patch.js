import { timesheetCollection } from '@root/database'

export default async (req, res) => {
  try {
    const { timesheetAppId } = req.query
    const timesheet = req.body

    await timesheetCollection().doc(timesheetAppId).update(timesheet)
    res.sendStatus(200)
  } catch(error) {
    res.status(500).send({ message: "Error when save timesheet to firebase."})
  }
}
