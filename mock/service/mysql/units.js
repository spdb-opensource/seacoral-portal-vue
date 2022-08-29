export const tasksList = require('./data/tasks_list')

export default [
  {
    url: '/serv_grps/mysql/[a-zA-Z0-9\-]*/units/[a-zA-Z0-9\-]*/start$',
    type: 'put',
    response: config => {
      return {
        'code': 200
      }
    }
  },
  {
    url: '/serv_grps/mysql/[a-zA-Z0-9\-]*/units/[a-zA-Z0-9\-]*/stop$',
    type: 'put',
    response: config => {
      return {
        'code': 200
      }
    }
  },
  {
    url: '/serv_grps/mysql/[a-zA-Z0-9\-]*/units/[a-zA-Z0-9\-]*/backup$',
    type: 'put',
    response: config => {
      return {
        'code': 200
      }
    }
  },
  {
    url: '/units/[a-zA-Z0-9\-]*/isolate$',
    type: 'put',
    response: config => {
      return {
        'code': 200
      }
    }
  },
  {
    url: '/units/[a-zA-Z0-9\-]*/recover$',
    type: 'put',
    response: config => {
      return {
        'code': 200
      }
    }
  },
  {
    url: '/units/[a-zA-Z0-9\-]*/image?[a-zA-Z0-9\-]*',
    type: 'put',
    response: config => {
      return {
        'code': 200
      }
    }
  },
  {
    url: '/serv_grps/mysql/tasks/[a-zA-Z0-9\-]*$',
    type: 'get',
    response: config => {
      return tasksList
    }
  }
]
