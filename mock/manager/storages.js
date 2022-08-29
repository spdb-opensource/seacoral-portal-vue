import Mock from 'mockjs'
import { SiteList } from './sites'
import { VendorList, TypeList, PerformanceList } from '../selections/storages'

export const StorageRemoteList = []
const StorageRemotePoolMap = new Map()
const storageCount = 12

for (let i = 0; i < storageCount; i++) {
  const vendor = VendorList[Mock.Random.integer(0, VendorList.length - 1)]
  const aType = TypeList[Mock.Random.integer(0, TypeList.length - 1)]
  StorageRemoteList.push(Mock.mock({
    id: '@increment',
    name: Mock.Random.string('lower', 6, 12),
    site: {
      id: SiteList[i].id,
      name: SiteList[i].name
    },
    vendor: {
      code: vendor.code,
      display: vendor.name
    },
    model: 'SSD80000',
    type: {
      code: aType.code,
      display: aType.name
    },
    totalSize: Mock.Random.integer(1000000, 2000000),
    usedSize: Mock.Random.integer(100000, 999999),
    enabled: Mock.Random.boolean(),
    description: '',
    created: {
      user: 'user001',
      timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    },
    modified: {
      user: 'user001',
      timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    },
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

for (let j = 0; j < StorageRemoteList.length; j++) {
  const tmpList = []
  const performance = PerformanceList[Mock.Random.integer(0, PerformanceList.length - 1)]
  for (let i = 0; i < Mock.Random.integer(1, 100); i++) {
    tmpList.push(Mock.mock({
      code: '@increment',
      performance: {
        code: performance.code,
        display: performance.display
      },
      totalSize: Mock.Random.integer(10000, 20000),
      usedSize: Mock.Random.integer(1000, 9999),
      enabled: Mock.Random.boolean(),
      description: '',
      created: {
        user: 'user001',
        timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      },
      modified: {
        user: 'user001',
        timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      },
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
  StorageRemotePoolMap.set(StorageRemoteList[j].id.toString(), tmpList)
}

export default [
  {
    url: '/storages/remotes$',
    type: 'get',
    response: () => {
      return {
        code: 200,
        data: StorageRemoteList
      }
    }
  },

  {
    url: '/storages/remotes$',
    type: 'post',
    response: config => {
      const { name, siteId, vendorCode, type, enabled, description, created_user } = config.body
      let aSiteId = SiteList[0]
      for (const v of SiteList) {
        if (v.id.toString() === siteId.toString()) {
          aSiteId = v
          break
        }
      }
      let aVendor = VendorList[0]
      for (const v of VendorList) {
        if (v.code.toString() === vendorCode.toString()) {
          aVendor = v
          break
        }
      }
      let aType = TypeList[0]
      for (const v of TypeList) {
        if (v.code.toString() === type.toString()) {
          aType = v
          break
        }
      }

      StorageRemoteList.push(Mock.mock({
        id: '@increment',
        name: name,
        site: {
          id: aSiteId.id,
          name: aSiteId.name
        },
        vendor: {
          code: aVendor.code,
          display: aVendor.name
        },
        model: 'SSD80000',
        type: {
          code: aType.code,
          display: aType.name
        },
        totalSize: Mock.Random.integer(1000000, 2000000),
        usedSize: Mock.Random.integer(100000, 999999),
        enabled: enabled,
        description: description,
        created: {
          user: created_user,
          timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
        },
        modified: {
          user: 'user001',
          timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
        },
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

      const tmpList = []
      StorageRemotePoolMap.set(StorageRemoteList[StorageRemoteList.length - 1].id.toString(), tmpList)

      return {
        code: 201,
        msg: '',
        data: null
      }
    }
  },

  {
    url: '/storages/remotes/[0-9a-zA-Z]+/disabled$',
    type: 'put',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const remote_id = url_strs[url_strs.length - 2]

      for (const v of StorageRemoteList) {
        if (v.id.toString() === remote_id) {
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
    url: '/storages/remotes/[0-9a-zA-Z]+/enabled$',
    type: 'put',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const remote_id = url_strs[url_strs.length - 2]

      for (const v of StorageRemoteList) {
        if (v.id.toString() === remote_id.toString()) {
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
    url: '/storages/remotes/[0-9a-zA-Z]+/pools$',
    type: 'get',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const remote_id = url_strs[url_strs.length - 2]
      return {
        code: 200,
        data: StorageRemotePoolMap.get(remote_id)
      }
    }
  },

  {
    url: '/storages/remotes/[0-9a-zA-Z]+/pools$',
    type: 'post',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const remote_id = url_strs[url_strs.length - 2]

      const { code, performance, enabled, description, created_user } = config.body
      let aPerformance = PerformanceList[0]
      for (const p of PerformanceList) {
        if (p.code.toString() === performance.toString()) {
          aPerformance = p
          break
        }
      }

      StorageRemotePoolMap.get(remote_id).push(Mock.mock({
        code: code,
        performance: {
          code: aPerformance.code,
          display: aPerformance.display
        },
        totalSize: Mock.Random.integer(10000, 20000),
        usedSize: Mock.Random.integer(1000, 9999),
        enabled: enabled,
        description: description,
        created: {
          user: created_user,
          timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
        },
        modified: {
          user: 'user001',
          timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
        },
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

      return {
        code: 201,
        msg: '',
        data: null
      }
    }
  },

  {
    url: '/storages/remotes/[0-9a-zA-Z]+/pools/[0-9a-zA-Z]+/enabled$',
    type: 'put',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const remote_id = url_strs[url_strs.length - 4]
      const pool_code = url_strs[url_strs.length - 2]

      for (const v of StorageRemotePoolMap.get(remote_id)) {
        if (v.code.toString() === pool_code.toString()) {
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
    url: '/storages/remotes/[0-9a-zA-Z]+/pools/[0-9a-zA-Z]+/disabled$',
    type: 'put',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const remote_id = url_strs[url_strs.length - 4]
      const pool_code = url_strs[url_strs.length - 2]

      for (const v of StorageRemotePoolMap.get(remote_id)) {
        if (v.code.toString() === pool_code.toString()) {
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
    url: '/storages/remotes/[0-9a-zA-Z]+/pools/[0-9a-zA-Z]$',
    type: 'delete',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const remote_id = url_strs[url_strs.length - 4]
      const pool_code = url_strs[url_strs.length - 2]

      let i = 0
      for (const v of StorageRemotePoolMap.get(remote_id)) {
        if (v.code.toString() === pool_code.toString()) {
          StorageRemotePoolMap.get(remote_id).splice(i, 1)
          break
        }
        i += 1
      }

      return {
        code: 204,
        msg: '',
        data: ''
      }
    }
  },

  {
    url: '/storages/remotes/[a-zA-Z0-9]*',
    type: 'delete',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const requestId = url_strs[url_strs.length - 1]
      let i = 0
      for (const v of StorageRemoteList) {
        if (v.id.toString() === requestId.toString()) {
          StorageRemoteList.splice(i, 1)
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

