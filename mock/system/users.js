import Mock from 'mockjs'
import { GroupList } from './group'
import { roles } from '../role'

export const usersList = []
const count = 30

for (let i = 0; i < count; i++) {
  var username = Mock.Random.string('lower', 3, 6)
  var groupNameNumer = Mock.Random.integer(0, GroupList.length - 2)
  usersList.push(Mock.mock({
    username: username,
    name: username + '中文',
    telephone: '18900000000',
    email: Mock.Random.email(),
    company: 'spdb',
    emerContact: username,
    emerTel: '18900000000',
    authType: 'native',
    enabled: Mock.Random.boolean(),
    groupNames: [
      GroupList[groupNameNumer].name, GroupList[groupNameNumer + 1].name
    ],
    role: {
      id: roles[0].id,
      name: roles[0].name
    },
    created: {
      user: 'user001',
      timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    },
    modified: {
      user: 'user001',
      timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    }
  }))
}

export default [
  {
    url: '/users/[a-zA-Z0-9]*',
    type: 'get',
    response: config => {
      var data = {}
      const username = config.originalUrl.split('/').pop()
      for (var i = 0; i < usersList.length; i++) {
        if (usersList[i].username === username) {
          data = usersList[i]
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
    url: '/users',
    type: 'get',
    response: config => {
      return {
        code: 200,
        data: usersList
      }
    }
  },

  {
    url: '/users',
    type: 'post',
    response: config => {
      return {
        code: 200,
        msg: ''
      }
    }
  },

  {
    url: '/users/[a-zA-Z0-9+\-]*$',
    type: 'put',
    response: config => {
      const username = config.originalUrl.split('/').pop()
      for (const v of usersList) {
        if (v.username === username) {
          v.name = config.body.name
          v.telephone = config.body.telephone
          v.email = config.body.email
          v.company = config.body.company
          v.emerContact = config.body.emerContact
          v.emerTel = config.body.emerTel
          v.groupNames = []
          for (const w of GroupList) {
            if (config.body.groupIds.includes(w.id)) {
              v.groupNames.push(w.name)
            }
          }
          for (const x of roles) {
            if (config.body.roleId === x.id) {
              v.role.id = x.id
              v.role.name = x.name
            }
          }
          break
        }
      }

      return {
        code: 200,
        msg: ''
      }
    }
  },

  {
    url: '/users/[a-zA-Z0-9+\-]*/disabled$',
    type: 'put',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const username = url_strs[url_strs.length - 2]

      for (const v of usersList) {
        if (v.username.toString() === username.toString()) {
          v.enabled = false
          break
        }
      }

      return {
        code: 200,
        msg: '',
        data: ''
      }
    }
  },

  {
    url: '/users/[a-zA-Z0-9+\-]*/enabled$',
    type: 'put',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const username = url_strs[url_strs.length - 2]

      for (const v of usersList) {
        if (v.username.toString() === username.toString()) {
          v.enabled = true
          break
        }
      }
      return {
        code: 200,
        msg: '',
        data: ''
      }
    }
  },

  {
    url: '/users/[a-zA-Z0-9\-]*',
    type: 'delete',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const username = url_strs[url_strs.length - 1]
      let i = 0
      for (const v of usersList) {
        if (v.username === username) {
          usersList.splice(i, 1)
          break
        }
        i += 1
      }

      return {
        code: 204,
        msg: ''
      }
    }
  },

  {
    url: '/users/[a-zA-Z0-9+\-]*/pwd$',
    type: 'put',
    response: config => {
      return {
        code: 200,
        msg: ''
      }
    }
  }
]

