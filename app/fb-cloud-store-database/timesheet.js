const date = require('date-and-time')
const _ = require('lodash')
const firebase = require('firebase')

const timesheetCollection = () => {
  return firebase.firestore().collection(process.env.DB_TABLE_TIME_SHEET)
}

export const timesheet = {
  id: '',
  userId: '',
  startTime: '',
  endTime: '',
  leaveTypeId: '',
  checkedDate: date.format(new Date(), 'YYYY/MM/DD'),
  isCorrect: false
}

export const invaildTimesheet = data => {
  return true
}

export const setTimesheetId = (userId, time) => {
  return userId + '_' + date.format(time, 'YYYYMMDD')
}

export const saveTimesheet = async timesheetReq => {
  try {
    const timesheetId = timesheetReq.id = setTimesheetId(timesheetReq.userId, new Date())
    await timesheetCollection()
      .doc(timesheetId)
      .set(timesheetReq)

    return true
  } catch(error) {
    throw new Error("Error when save to firebase")
  }
}

export const updateTimesheet = async timesheetReq => {
  try {
    const timesheetId = timesheetReq.id = setTimesheetId(timesheetReq.userId, new Date())
    await timesheetCollection()
      .doc(timesheetId)
      .update(timesheetReq)

    return true
  } catch(error) { 
    throw new Error("Error when save to firebase")
  }
}

export const getTimesheetUserdate = async (userId, tmsDate) => {
  const timesheetId = setTimesheetId(userId, tmsDate)
  const docsToday = await timesheetCollection().where('id', '==', timesheetId).get()

  return  docsToday.docs.length ? docsToday.docs.pop().data() : null
}