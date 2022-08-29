import Mock from 'mockjs'

export const scalesList = []
const count = 30

for (let i = 0; i < count; i++) {
  const id = Mock.Random.integer()
  scalesList.push(Mock.mock({
    id: id,
    type: {
      code: 'mysql',
      display: 'MySQL'
    },
    name: (i + 1).toString() + '核' + (i + 1).toString() + 'G',
    cpuCnt: i + 1,
    memSize: (i + 1) * 1024,
    enabled: Mock.Random.boolean(),
    sequence: i,
    description: '测试',
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
    url: '/scales/[a-zA-Z0-9]*',
    type: 'get',
    response: config => {
      let data = {}
      const id = parseInt(config.originalUrl.split('/').pop())
      for (let i = 0; i < scalesList.length; i++) {
        if (scalesList[i].id === id) {
          data = scalesList[i]
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
    url: '/scales',
    type: 'get',
    response: config => {
      const { type, enabled } = config.query
      const retList = []
      for (const s of scalesList) {
        if ((type === undefined || s.type.code === type) && ((enabled === undefined || s.enabled.toString() === enabled))) {
          retList.push(s)
        }
      }
      return {
        code: 200,
        data: retList
      }
    }
  },

  {
    url: '/scales',
    type: 'post',
    response: () => {
      return {
        code: 200,
        msg: ''
      }
    }
  },

  {
    url: '/scales/[a-zA-Z0-9+\-]*$',
    type: 'put',
    response: config => {
      const id = parseInt(config.originalUrl.split('/').pop())
      for (const v of scalesList) {
        if (v.id === id) {
          v.name = config.body.name
          v.sequence = config.body.sequence
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
    url: '/scales/[a-zA-Z0-9+\-]*/disabled$',
    type: 'put',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const host_id = url_strs[url_strs.length - 2]

      for (const v of scalesList) {
        if (v.id.toString() === host_id.toString()) {
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
    url: '/scales/[a-zA-Z0-9+\-]*/enabled$',
    type: 'put',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const host_id = url_strs[url_strs.length - 2]

      for (const v of scalesList) {
        if (v.id.toString() === host_id.toString()) {
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
    url: '/scales/[a-zA-Z0-9\-]*',
    type: 'delete',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const requestId = parseInt(url_strs[url_strs.length - 1])
      let i = 0
      for (const v of scalesList) {
        if (v.id === requestId) {
          scalesList.splice(i, 1)
          break
        }
        i += 1
      }

      return {
        code: 204,
        msg: ''
      }
    }
  }
]

