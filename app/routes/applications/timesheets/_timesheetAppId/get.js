const { getTimesheetApplicationCollection } = require('@root/database')

module.exports = async (req, res) => {
  try {
    const { timesheetAppId } = req.params
    const existTimesheetApplication = await getTimesheetApplicationCollection().doc(timesheetAppId).get()
    
    if (existTimesheetApplication.exists) {
      res.send(existTimesheetApplication.data())
    } else {
      res.send(null)
    }
  } catch(error) {  
    res.status(500).send(error)
  }
}
