import backupList from './data/backup_list'

export default [
  {
    url: '/backupfiles[a-zA-Z0-9\-]*$',
    type: 'get',
    response: config => {
      return backupList
    }
  },
  {
    url: '/backupfiles/[a-zA-Z0-9\-]*$',
    type: 'delete',
    response: config => {
      return {
        'code': 200
      }
    }
  },
  {
    url: '/backupfiles/restore$',
    type: 'put',
    response: config => {
      return {
        'code': 200
      }
    }
  }
]
