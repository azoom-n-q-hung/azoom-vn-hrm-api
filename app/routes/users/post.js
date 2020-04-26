import _ from 'lodash/fp'
import bcrypt from 'bcrypt'
import { userCollection } from '@root/database'
import getRole from '@helpers/users/getRole.js'

export default async (req, res) => {
  const { userId, user } = req.body

  const role = await getRole(userId)
  if (role !== 'admin' && role !== 'editor') return res.sendStatus(403)

  const defaultUser = {
    id: '',
    userName: '',
    fullName: '',
    email: '',
    password: '',
    birthDate: '',
    address: '',
    tel: '',
    zipCode: '',
    totalPaidLeaveDate: 0,
    contractType: 0,
    position: 'Dev',
    positionPermissionId: 1,
    isActive: true,
    created: new Date(),
    updated: ''
  }
  const newUser = { ...defaultUser, ...user, password: bcrypt.hashSync(user.password, 10)}

  await userCollection().doc(newUser.id).set(newUser)
  res.send(user)
}
