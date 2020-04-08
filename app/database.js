const firebase = require('firebase')

const fireStore = firebase.firestore()

export const getTimesheetCollection = () => {
  return fireStore.collection(process.env.DB_TABLE_TIME_SHEET)
}
