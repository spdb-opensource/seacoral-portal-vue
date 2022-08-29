import Mock from 'mockjs'

export const networkingList = []
export const clusterList = [{
  id: Mock.Random.guid(),
  name: 'test',
  sites: {
    id: Mock.Random.guid(),
    name: 'uat'
  },
  area: {
    code: 'area1',
    display: '区域1'
  },
  imageTypes: ['mysql'],
  haTag: 'testa',
  networkings: [
    {
      id: Mock.Random.guid(),
      name: '10.112.17.221-232'

    }
  ],
  enabled: true,
  description: 'aaa',
  created: {
    timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    username: 'admin'
  },
  modified: {
    username: 'user001',
    timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  }
}, {
  id: Mock.Random.guid(),
  name: 'uat-cluster1',
  sites: {
    id: Mock.Random.guid(),
    name: 'uat'
  },
  area: {
    code: 'area1',
    display: '区域1'
  },
  imageTypes: ['mysql'],
  haTag: 'testa',
  networkings: [
    {
      id: Mock.Random.guid(),
      name: '10.112.17.221-232'

    }
  ],
  enabled: true,
  description: 'aaa',
  created: {
    timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    username: 'admin'
  },
  modified: {
    username: 'user001',
    timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  }
}]
export const topologyList = [
  {
    id: 10,
    code: 'topology2',
    name: '拓扑2',
    sequence: 2,
    gmtCreate: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    creator: 'admin'
  },
  {
    id: 11,
    code: 'topology3',
    name: '拓扑3',
    sequence: 3,
    gmtCreate: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    creator: 'admin'
  },
  {
    id: 12,
    code: 'topology4',
    name: '拓扑4',
    sequence: 4,
    gmtCreate: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    creator: 'admin'
  },
  {
    id: 9,
    code: 'topology1',
    name: '拓扑1',
    sequence: 1,
    gmtCreate: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    creator: 'admin'
  }
]
const count = 30

function getClusterName(clusterId) {
  for (let i = 0; i < clusterList.length; i++) {
    if (clusterList[i].id === clusterId) {
      return clusterList[i].name
    }
  }
  return undefined
}

for (let i = 0; i < count; i++) {
  var siteName = Mock.Random.string('lower', 3, 6)
  var ip = Mock.Random.ip()
  var temp = ip.split('.')
  var endIp = temp[0] + '.' + temp[1] + '.' + temp[2] + '.255'
  var gateway = temp[0] + '.' + temp[1] + '.' + temp[2] + '.1'
  var total = 255 - parseInt(temp[3]) + 1
  var cluster = Mock.Random.integer(0, clusterList.length - 1)
  networkingList.push(Mock.mock({
    id: Mock.Random.guid(),
    site: {
      id: Mock.Random.guid(),
      name: siteName
    },
    startIp: ip,
    endIp: endIp,
    gateway: gateway,
    mask: 24,
    ip: {
      total: total,
      usedCnt: Mock.Random.integer(0, total)
    },
    vlanId: Mock.Random.integer(0, 2000),
    topologies: ['topology1'],
    cluster: {
      id: clusterList[cluster].id,
      name: clusterList[cluster].name
    },
    enabled: Mock.Random.boolean(),
    description: '测试',
    created: {
      username: 'user001',
      timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    },
    modified: {
      username: 'user001',
      timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    }
  }))
}

export default [
  {
    url: '/networkings/[a-zA-Z0-9]*',
    type: 'get',
    response: config => {
      var data = {}
      const id = config.originalUrl.split('/').pop()
      for (var i = 0; i < networkingList.length; i++) {
        if (networkingList[i].id === id) {
          data = networkingList[i]
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
    url: '/networkings',
    type: 'get',
    response: config => {
      return {
        code: 200,
        data: networkingList
      }
    }
  },

  {
    url: '/networkings',
    type: 'post',
    response: config => {
      return {
        code: 200,
        msg: ''
      }
    }
  },

  {
    url: '/networkings/[a-zA-Z0-9+\-]*$',
    type: 'put',
    response: config => {
      const id = config.originalUrl.split('/').pop()
      for (const v of networkingList) {
        if (v.id === id) {
          v.topologies = config.body.topologies
          v.description = config.body.description
          var clusterName = getClusterName(config.body.clusterId)
          v.cluster = {
            id: config.body.clusterId,
            name: clusterName
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
    url: '/networkings/[a-zA-Z0-9+\-]*/disabled$',
    type: 'put',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const host_id = url_strs[url_strs.length - 2]

      for (const v of networkingList) {
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
    url: '/networkings/[a-zA-Z0-9+\-]*/enabled$',
    type: 'put',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const host_id = url_strs[url_strs.length - 2]

      for (const v of networkingList) {
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
    url: '/networkings/[a-zA-Z0-9\-]*',
    type: 'delete',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const requestId = url_strs[url_strs.length - 1]
      let i = 0
      for (const v of networkingList) {
        if (v.id === requestId) {
          networkingList.splice(i, 1)
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
    url: '/selections/topologie_types',
    type: 'get',
    response: config => {
      return {
        code: 200,
        data: topologyList
      }
    }
  },

  {
    url: '/selections/clusters?[a-zA-Z0-9]*',
    type: 'get',
    response: config => {
      return {
        code: 200,
        data: clusterList
      }
    }
  }
]

