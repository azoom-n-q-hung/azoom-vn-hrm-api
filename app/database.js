const firebase = require('firebase')

const fireStore = firebase.firestore()

export const getTimesheetApplicationCollection = () => {
  return fireStore.collection(process.env.DB_TABLE_TIME_SHEET_APPLICATION)
}

export const getProjectCollection = () => {
  return firebase.firestore().collection(process.env.DB_TABLE_PROJECT)
}

export const getUserCollection = () => {
  return firebase.firestore().collection(process.env.DB_TABLE_USER)
}
