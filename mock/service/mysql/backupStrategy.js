import backupStrategyList from './data/backup_strategy'

export default [
  {
    url: '/backupfiles/strategy[a-zA-Z0-9\-]*$',
    type: 'get',
    response: config => {
      return backupStrategyList
    }
  },
  {
    url: '/backupfiles/strategy/[a-zA-Z0-9\-]*$',
    type: 'post',
    response: config => {
      return {
        'code': 200
      }
    }
  },
  {
    url: '/backupfiles/deleteStrategy/[a-zA-Z0-9\-]*$',
    type: 'delete',
    response: config => {
      return {
        'code': 200
      }
    }
  }

]
