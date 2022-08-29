import Mock from 'mockjs'
import { deepClone } from '../../src/utils/index.js'
import { asyncRoutes, constantRoutes } from './routes.js'

const apps = require('./data/apps.json')
const apps_selections = require('./data/apps_selections.json')
const data_scopes = require('./data/data_scopes.json')
const data_scopes_selections = require('./data/data_scopes_selections.json')
const others = require('./data/others.json')
const routes = deepClone([...constantRoutes, ...asyncRoutes])

export const roles = [
  {
    key: 'admin',
    routes: routes,

    id: '1',
    name: 'admin',
    sequence: 0,
    description: 'Super Administrator. Have access to view all pages.',
    created: {
      username: 'admin',
      timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    },
    modified: {
      username: 'admin',
      timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    }
  },
  {
    key: 'editor',
    routes: routes.filter(i => i.path !== '/permission'), // just a mock
    id: '2',
    name: 'editor',
    description: 'Normal Editor. Can see all pages except permission page',
    sequence: 0,
    created: {
      username: 'admin',
      timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    },
    modified: {
      username: 'admin',
      timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    }
  },
  {
    key: 'visitor',
    routes: [{
      path: '',
      redirect: 'dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          meta: { title: 'dashboard', icon: 'dashboard' }
        }
      ]
    }],

    id: '3',
    name: 'visitor',
    description: 'Just a visitor. Can only see the home page and the document page',
    sequence: 0,
    created: {
      username: 'admin',
      timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    },
    modified: {
      username: 'admin',
      timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    }
  }
]

export default [
  // mock get all routes form server
  {
    url: '/routes',
    type: 'get',
    response: _ => {
      return {
        code: 200,
        data: routes
      }
    }
  },

  {
    url: '/roles/[a-zA-Z0-9+\-]*/cfgs/apps$',
    type: 'get',
    response: config => {
      return apps
    }
  },

  {
    url: '/roles/[a-zA-Z0-9+\-]*/cfgs/data_scopes$',
    type: 'get',
    response: config => {
      return data_scopes
    }
  },

  {
    url: '/roles/[a-zA-Z0-9+\-]*/cfgs/others$',
    type: 'get',
    response: config => {
      return others
    }
  },

  {
    url: '/roles/[a-zA-Z0-9+\-]*/cfgs/apps$',
    type: 'put',
    response: config => {
      return {
        code: 200
      }
    }
  },

  {
    url: '/roles/[a-zA-Z0-9+\-]*/cfgs/data_scopes$',
    type: 'put',
    response: config => {
      return {
        code: 200
      }
    }
  },

  {
    url: '/roles/[a-zA-Z0-9+\-]*/cfgs/others$',
    type: 'put',
    response: config => {
      return {
        code: 200
      }
    }
  },

  {
    url: '/roles/[a-zA-Z0-9+\-]*$',
    type: 'get',
    response: config => {
      let data = {}
      const id = config.originalUrl.split('/').pop()
      console.log(id)
      for (var i = 0; i < roles.length; i++) {
        if (roles[i].id.toString() === id.toString()) {
          data = roles[i]
          break
        }
      }
      if (data !== {}) {
        return {
          code: 200,
          data: data
        }
      } else {
        return {
          code: 404
        }
      }
    }
  },

  {
    url: '/selections/apps',
    type: 'get',
    response: config => {
      return apps_selections
    }
  },
  {
    url: '/selections/data_scopes',
    type: 'get',
    response: config => {
      return data_scopes_selections
    }
  },

  // mock get all roles form server
  {
    url: '/roles',
    type: 'get',
    response: _ => {
      return {
        code: 200,
        data: roles
      }
    }
  },

  // add role
  {
    url: '/roles',
    type: 'post',
    response: {
      code: 201,
      data: {
        key: Mock.mock('@integer(300, 5000)')
      }
    }
  },

  // update role
  {
    url: '/roles/[A-Za-z0-9]*$',
    type: 'put',
    response: {
      code: 200,
      data: {
        status: 'success'
      }
    }
  },

  // delete role
  {
    url: '/roles/[A-Za-z0-9]',
    type: 'delete',
    response: {
      code: 204,
      data: {
        status: 'success'
      }
    }
  }
]
