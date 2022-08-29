import Mock from 'mockjs'

export const MysqlList = []
const count = 5

export const mysqlList = require('./data/serv_grps')
export const mysqlInfoSuccess = require('./data/serv_info_success')
export const mysqlInfoWarning = require('./data/serv_info_warning')
export const mysqlParams = require('./data/params')

for (let i = 0; i < count; i++) {
	MysqlList.push(Mock.mock({
	  //...
	  
	}))
}

export default [
  {
    url: '/serv_grps/mysql$',
    type: 'get',
    response: config => {
      return mysqlList
    }
  },
  {
    url: '/serv_grps/mysql/[a-zA-Z0-9\-]*$',
    type: 'get',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const service_id = url_strs[url_strs.length - 1]
      if (service_id === mysqlInfoSuccess.data.id) {
        return mysqlInfoSuccess
      } else {
        return mysqlInfoWarning
      }
    }
  },
  {
    url: '/serv_grps/mysql/cfgs/[a-zA-Z0-9\-]*$',
    type: 'get',
    response: config => {
      return mysqlParams
    }
  },
  {
    url: '/serv_grps/mysql/editCfgs/[a-zA-Z0-9\-]*$',
    type: 'put',
    response: config => {
      return { 'code': 200 }
    }
  },
  {
    url: '/serv_grps/mysql/[a-zA-Z0-9\-]*/start$',
    type: 'put',
    response: config => {
      return { 'code': 200 }
    }
  },
  {
    url: '/serv_grps/mysql/[a-zA-Z0-9\-]*/stop$',
    type: 'put',
    response: config => {
      return { 'code': 200 }
    }
  },
  {
    url: '/serv_grps/mysql/[a-zA-Z0-9\-]*/scale/[a-zA-Z0-9\-]*$',
    type: 'put',
    response: config => {
      return { 'code': 200 }
    }
  },
  {
    url: '/serv_grps/mysql/[a-zA-Z0-9\-]*/image/[a-zA-Z0-9\-]*$',
    type: 'put',
    response: config => {
      return { 'code': 200 }
    }
  },
  {
    url: '/serv_grps/mysql/[a-zA-Z0-9\-]*$',
    type: 'delete',
    response: config => {
      return { 'code': 200 }
    }
  },
  {
    url: '/serv_grps/mysql/instances/[a-zA-Z0-9\-]*/info$',
    type: 'get',
    response: config => {
      return { 'code': 200 }
    }
  },
  {
    url: '/serv_grps/mysql/instances/[a-zA-Z0-9\-]*/info$',
    type: 'get',
    response: config => {
      return { 'code': 200 }
    }
  },
  {
    url: '/serv_grps/mysql/instances$',
    type: 'put',
    response: config => {
      return { 'code': 200 }
    }
  },
  {
    url: '/serv_grps/mysql/rebuild$',
    type: 'put',
    response: config => {
      return { 'code': 200 }
    }
  }
]
