import Mock from 'mockjs'

export const GroupList = []
const count = 25

for (let i = 0; i < count; i++) {
  GroupList.push(Mock.mock({
    id: Mock.Random.string('lower', 6, 12),
    name: Mock.Random.string('lower', 4, 10),
    decsription: '',
    created: {
      username: 'admin',
      timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    }
  }))
}

export default [
  {
    url: '/groups',
    type: 'get',
    response: () => {
      return {
        code: 200,
        data: GroupList
      }
    }
  },

  {
    url: '/groups/[a-zA-Z0-9]*',
    type: 'put',
    response: config => {
      for (const v of GroupList) {
        if (v.id.toString() === config.body.id.toString()) {
          v.name = config.body.name
          v.description = config.body.description
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
    url: '/groups/[a-zA-Z0-9]*',
    type: 'delete',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const system_id = url_strs[url_strs.length - 1]
      let i = 0
      for (const v of GroupList) {
        if (v.id.toString() === system_id.toString()) {
          GroupList.splice(i, 1)
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
    url: '/groups',
    type: 'post',
    response: config => {
      const { name, description } = config.body

      GroupList.push(Mock.mock({
        id: Mock.Random.string('lower', 32, 32),
        name: name,
        description: description,
        created: {
          username: 'admin',
          timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
        }
      }))

      return {
        code: 201,
        msg: '',
        data: null
      }
    }
  }
]

