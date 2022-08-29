import Mock from 'mockjs'
import { PerformanceList } from '../selections/storages'
import { StorageRemoteList } from './storages'
import { ClusterList } from './clusters'

export const HostList = []
const count = 12

for (let i = 0; i < count; i++) {
  const cluster = ClusterList[Mock.Random.integer(0, ClusterList.length - 1)]
  const maxUnitCnt = Mock.Random.integer(10, 100)
  const cpuTotal = Mock.Random.integer(16, 128)
  const memTotal = Mock.Random.integer(1024 * 4, 1024 * 256)
  const bwTotal = Mock.Random.integer(100, 1000)
  const storageList = []
  for (let s = 0; s < Mock.Random.integer(1, 3); s++) {
    const performance = PerformanceList[Mock.Random.integer(0, PerformanceList.length - 1)]
    const totalSize = Mock.Random.integer(1024 * 1024, 6 * 1024 * 1024)
    storageList.push({
      performance: {
        code: performance.code,
        display: performance.display
      },
      path: Mock.Random.string('lower', 6, 12),
      totalSize: totalSize,
      usedSize: Mock.Random.integer(0, totalSize)
    })
  }
  const storageRemote = StorageRemoteList[Mock.Random.integer(0, StorageRemoteList.length - 1)]
  HostList.push(Mock.mock({
    id: '@increment',
    name: Mock.Random.string('lower', 6, 12),
    site: {
      id: cluster.site.id,
      name: cluster.site.name
    },
    cluster: {
      id: cluster.id,
      name: cluster.name
    },
    ip: Mock.Random.ip(),
    ssh: {
      username: Mock.Random.string('lower', 6, 12),
      port: 22
    },
    room: Mock.Random.string('lower', 6, 12),
    seat: Mock.Random.string('lower', 6, 12),
    ntpServer: Mock.Random.domain(),
    storage: storageList,
    storageRemote: {
      id: storageRemote.id,
      name: storageRemote.name
    },
    maxUnitCnt: maxUnitCnt,
    unitCnt: Mock.Random.integer(0, maxUnitCnt),
    maxUsage: {
      cpu: Mock.Random.integer(0, 100),
      mem: Mock.Random.integer(0, 100),
      bandwidth: Mock.Random.integer(0, 100),
      storage: Mock.Random.integer(0, 100)
    },
    os: Mock.Random.string('lower', 6, 12),
    cpu: {
      total: cpuTotal,
      usedCnt: Mock.Random.integer(0, cpuTotal)
    },
    mem: {
      totalSize: memTotal,
      usedSize: Mock.Random.integer(0, memTotal)
    },
    bandwidth: {
      totalSize: bwTotal,
      usedSize: Mock.Random.integer(0, bwTotal)
    },
    'arch|1': ['arm', 'amd64'],
    'role|1': ['dbscale-node', 'dbscale-spare'],
    enabled: Mock.Random.boolean(),
    description: '测试',
    created: {
      user: 'user001',
      timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    },
    modified: {
      user: 'user001',
      timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    },
    gmtModified: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    task: {
      id: 'ssss',
      action: {
        code: 'sss',
        display: 'ssss'
      },
      status: {
        code: 'sss',
        'display|1': ['新增成功', '新增失败', '删除成功']
      }
    }
  }))
}

export default [
  {
    url: '/hosts',
    type: 'get',
    response: () => {
      return {
        code: 200,
        data: HostList
      }
    }
  },

  {
    url: '/hosts',
    type: 'post',
    response: config => {
      const { clusterId, ip, sshPort, sshUsername, room, seat, ntpServer,
        storage, storageRemoteId, maxUnitCnt, maxUsage, enabled, description, arch, role, created_user } = config.body
      let aCluster = ClusterList[0]
      for (const v of ClusterList) {
        if (v.id.toString() === clusterId.toString()) {
          aCluster = v
          break
        }
      }
      let aRemoteStorage = null
      for (const v of StorageRemoteList) {
        if (v.id.toString() === storageRemoteId.toString()) {
          aRemoteStorage = v
          break
        }
      }

      const storageList = []
      for (const v of storage) {
        if (v.path.length > 0) {
          const totalSize = Mock.Random.integer(1024 * 1024, 6 * 1024 * 1024)
          let performance = PerformanceList[0]
          for (const p of PerformanceList) {
            if (p.code.toString() === v.performance.toString()) {
              performance = p
            }
          }

          storageList.push({
            performance: {
              code: performance.code,
              display: performance.display
            },
            path: v.path,
            totalSize: totalSize,
            usedSize: Mock.Random.integer(0, totalSize)
          })
        }
      }

      const cpuTotal = Mock.Random.integer(16, 128)
      const memTotal = Mock.Random.integer(1024 * 4, 1024 * 256)
      const bwTotal = Mock.Random.integer(100, 1000)
      HostList.push(Mock.mock({
        id: '@increment',
        name: Mock.Random.string('lower', 6, 12),
        site: {
          id: aCluster.site.id,
          name: aCluster.site.name
        },
        cluster: {
          id: aCluster.id,
          name: aCluster.name
        },
        ip: ip,
        ssh: {
          username: sshUsername,
          port: sshPort
        },
        room: room,
        seat: seat,
        ntpServer: ntpServer,
        storage: storageList,
        storageRemote: null,
        maxUnitCnt: maxUnitCnt,
        unitCnt: 0,
        maxUsage: {
          cpu: maxUsage.cpu,
          mem: maxUsage.mem,
          bandwidth: maxUsage.bandwidth,
          storage: maxUsage.storage
        },
        os: Mock.Random.string('lower', 6, 12),
        cpu: {
          total: cpuTotal,
          usedCnt: Mock.Random.integer(0, cpuTotal)
        },
        mem: {
          totalSize: memTotal,
          usedSize: Mock.Random.integer(0, memTotal)
        },
        bandwidth: {
          totalSize: bwTotal,
          usedSize: Mock.Random.integer(0, bwTotal)
        },
        arch: arch,
        role: role,
        enabled: enabled,
        description: description,
        created: {
          user: created_user,
          timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
        },
        modified: {
          user: created_user,
          timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
        },
        gmtModified: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        task: {
          id: 'ssss',
          action: {
            code: 'sss',
            display: 'ssss'
          },
          status: {
            code: 'sss',
            'display|1': ['新增成功', '新增失败', '删除成功']
          }
        }
      }))

      if (aRemoteStorage != null) {
        HostList[HostList.length - 1].storageRemote = {
          id: aRemoteStorage.id,
          name: aRemoteStorage.name
        }
      }

      return {
        code: 201,
        msg: '',
        data: null
      }
    }
  },

  {
    url: '/hosts/[a-zA-Z0-9]*$',
    type: 'put',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const host_id = url_strs[url_strs.length - 1]
      const { room, seat, maxUnitCnt, maxUsage, description, role } = config.body

      for (const v of HostList) {
        if (v.id.toString() === host_id.toString()) {
          v.room = room
          v.seat = seat
          v.maxUnitCnt = maxUnitCnt
          v.maxUsage = maxUsage
          v.description = description
          v.role = role
          break
        }
      }

      return {
        code: 200,
        msg: '',
        data: null
      }
    }
  },

  {
    url: '/hosts/[a-zA-Z0-9]*/delete$',
    type: 'put',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const host_id = url_strs[url_strs.length - 1]
      let i = 0
      for (const v of HostList) {
        if (v.id.toString() === host_id.toString()) {
          HostList.splice(i, 1)
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
    url: '/hosts/[a-zA-Z0-9]*/disabled$',
    type: 'put',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const host_id = url_strs[url_strs.length - 2]

      for (const v of HostList) {
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
    url: '/hosts/[a-zA-Z0-9]*/enabled$',
    type: 'put',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const host_id = url_strs[url_strs.length - 2]

      for (const v of HostList) {
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
  }
]

