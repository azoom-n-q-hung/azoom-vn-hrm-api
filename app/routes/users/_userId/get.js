import _ from 'lodash/fp'

const { getUserCollection } = require('@root/database')

module.exports = async (req, res) => {
  try {
    const { userId } = req.params
    const user = await getUserCollection().doc(userId).get()
    if (!user.exists) return res.sendStatus(404)

    return res.send(_.omit(['password'], user.data()))
  } catch (error) {
    return res.sendStatus(500)
  }
}
