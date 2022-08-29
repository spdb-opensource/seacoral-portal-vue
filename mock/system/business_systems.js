import Mock from 'mockjs'

export const SystemList = []
const count = 20

for (let i = 0; i < count; i++) {
  SystemList.push(Mock.mock({
    id: Mock.Random.string('lower', 32, 32),
    name: Mock.Random.string('lower', 6, 12),
    description: '测试',
    owner: 'admin',
    ownerName: '超级管理员',
    gmtCreate: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    creator: 'admin',
    creatorName: '超级管理员'
  }))
}

export default [
  {
    url: '/business_systems',
    type: 'get',
    response: () => {
      return {
        code: 200,
        data: SystemList
      }
    }
  },

  {
    url: '/business_systems/[a-zA-Z0-9]*',
    type: 'put',
    response: config => {
      for (const v of SystemList) {
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
    url: '/business_systems/[a-zA-Z0-9]*',
    type: 'delete',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const system_id = url_strs[url_strs.length - 1]
      let i = 0
      for (const v of SystemList) {
        if (v.id.toString() === system_id.toString()) {
          SystemList.splice(i, 1)
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
    url: '/business_systems',
    type: 'post',
    response: config => {
      const { name, description } = config.body

      SystemList.push(Mock.mock({
        id: Mock.Random.string('lower', 32, 32),
        name: name,
        description: description,
        owner: 'admin',
        ownerName: '超级管理员',
        gmtCreate: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        creator: 'admin',
        creatorName: '超级管理员'
      }))

      return {
        code: 201,
        msg: '',
        data: null
      }
    }
  }
]

