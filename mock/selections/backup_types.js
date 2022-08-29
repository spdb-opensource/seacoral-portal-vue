const backupTypes = require('./data/backup_types.json')

export default [
  {
    url: '/selections/backup_types',
    type: 'get',
    response: config => {
      return backupTypes
    }
  }
]
