const date = require('date-and-time')

export const initTimesheetApplicationId = (id) => {
  return id + date.format(new Date(), 'YYYYMMDDHHMMSS')
}
