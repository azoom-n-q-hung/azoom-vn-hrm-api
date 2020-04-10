const firebase = require('firebase')

const fireStore = firebase.firestore()

export const getUserCollection = () => {
  return fireStore.collection(process.env.DB_TABLE_USER)
}
