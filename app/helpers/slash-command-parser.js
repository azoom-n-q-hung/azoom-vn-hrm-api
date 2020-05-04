
export default (commandText, seperator = '=') => {
  const commandArgs = commandText.match(/\S+/g) || false
  if (!commandArgs) return {}
  return commandArgs.reduce((formatedArgs, arg) => {
    const [generalKey, value] = arg.split(seperator)
    const key = {
      'username': 'username',
      'u': 'username',
      'password': 'password',
      'p': 'password',
      'email': 'email',
      'e': 'email',
      'permissionId': 'permissionId',
      'pid': 'permissionId',
      'userId': 'userId',
      'uid': 'userId',
      'id': 'id',
      'projectId': 'projectId',
      'pjid': 'projectId',
      'projectName': 'projectName',
      'pjn': 'projectName',
      'managerId': 'managerId',
      'mid': 'managerId',
      'memberIds': 'memberIds',
      'mids': 'memberIds',
      'position': 'position',
      'pos': 'position',
      'time': 'time',
      't': 'time',
      'startTime': 'startTime',
      'st': 'startTime',
      'endTime': 'endTime',
      'et': 'endTime',
      'startDate': 'startDate',
      'sd': 'startDate',
      'endDate': 'endDate',
      'ed': 'endDate',
      'date': 'date',
      'd': 'date',
      'reasion': 'reasion',
      'rs': 'reasion',
      'status':'status',
      's':'status',
      'timesheetAppId': 'timesheetAppId',
      'atid': 'timesheetAppId',
      'leaveType': 'leaveType',
      'lt': 'leaveType',
      'leaveAppId': 'leaveAppId',
      'alid': 'leaveAppId',
      'page': 'page',
      'limit': 'limit',
      'positionScore': 'positionScore',
      'ps': 'positionScore',
    }[generalKey]
    return value ? { ...formatedArgs, [key]: value } : formatedArgs
  }, {})
}
