import Mock from 'mockjs'
import { regionMap } from '../selections/regions'

export const SiteList = []
const count = 20

for (let i = 0; i < count; i++) {
  SiteList.push(Mock.mock({
    id: '@increment',
    name: Mock.Random.string('lower', 6, 12),
    region: {
      code: 'SH',
      display: '上海'
    },
    type: {
      code: 'kubernetes',
      display: 'kubernetes'
    },
    version: '1.15.0',
    domain: 'cluster_engine1.service.consul',
    port: 6443,
    'status|1': ['passing', 'critical'],
    image_registry: 'registry1.service.consul:20160',
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
    url: '/sites',
    type: 'get',
    response: () => {
      return {
        code: 200,
        data: SiteList
      }
    }
  },

  {
    url: '/sites/update/[a-zA-Z0-9]*',
    type: 'put',
    response: config => {
      for (const v of SiteList) {
        if (v.id.toString() === config.body.id.toString()) {
          v.name = config.body.name
          v.desc = config.body.desc
          v.region = {
            code: config.body.region,
            display: regionMap.get(config.body.region)
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
    url: '/sites/[a-zA-Z0-9]*',
    type: 'delete',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const requestId = parseInt(url_strs[url_strs.length - 1])
      let i = 0
      for (const v of SiteList) {
        if (v.id.toString() === requestId.toString()) {
          SiteList.splice(i, 1)
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

