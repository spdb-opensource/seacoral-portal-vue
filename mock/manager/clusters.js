import Mock from 'mockjs'
import { SiteList } from './sites'
import { AreaList } from '../selections/areas'
import { ImageTypeList } from '../selections/images'

export const ClusterList = []
const count = 10

for (let i = 0; i < count; i++) {
  const site = SiteList[Mock.Random.integer(0, SiteList.length - 1)]
  const area = AreaList[Mock.Random.integer(0, AreaList.length - 1)]
  const imageTypes = ImageTypeList[Mock.Random.integer(0, ImageTypeList.length - 1)]
  ClusterList.push(Mock.mock({
    id: '@increment',
    name: Mock.Random.string('lower', 6, 12),
    site: {
      id: site.id,
      name: site.name
    },
    area: {
      code: area.code,
      display: area.name
    },
    haTag: Mock.Random.string('lower', 3, 8),
    imageTypes: [imageTypes.name],
    enabled: Mock.Random.boolean(),
    description: '',
    nfs_ip: Mock.Random.ip(),
    nfs_source: Mock.Random.string('lower', 3, 8),
    nfs_opts: Mock.Random.string('lower', 3, 8),
    networkings: [{
      id: Mock.Random.guid(),
      name: '10.112.17.221-232'
    }],
    created: {
      user: 'user001',
      timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    },
    modified: {
      user: 'user001',
      timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    }
    // 其他待完成，上述字段为主机管理添加
  }))
}

export default [
  {
    url: '/clusters',
    type: 'get',
    response: config => {
      return {
        code: 200,
        data: ClusterList
      }
    }
  },

  {
    url: '/clusters/[a-zA-Z0-9]*',
    type: 'get',
    response: config => {
      var data = {}
      for (var i = 0; i < ClusterList.length; i++) {
        if (ClusterList[i].id === config.body.id) {
          data = ClusterList[i]
          break
        }
      }
      if (data !== {}) {
        return {
          code: 200,
          data: ClusterList
        }
      } else {
        return {
          code: 404
        }
      }
    }
  },

  {
    url: '/clusters/[a-zA-Z0-9]*',
    type: 'put',
    response: config => {
      for (const v of ClusterList) {
        if (v.id === config.body.id) {
          v.name = config.body.name
          v.siteId = config.body.siteId
          v.areaCode = config.body.areaCode
          v.imageTypes = config.body.imageTypes
          v.haTag = config.body.haTag
          v.enabled = config.body.enabled
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
    url: '/clusters/[a-zA-Z0-9]*',
    type: 'delete',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const requestId = parseInt(url_strs[url_strs.length - 1])
      let i = 0
      for (const v of ClusterList) {
        if (v.id.toString() === requestId.toString()) {
          ClusterList.splice(i, 1)
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
    url: '/clusters/[0-9a-zA-Z]+/disabled$',
    type: 'put',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const remote_id = url_strs[url_strs.length - 2]

      for (const v of ClusterList) {
        if (v.id.toString() === remote_id.toString()) {
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
    url: '/clusters/[0-9a-zA-Z]+/enabled$',
    type: 'put',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const remote_id = url_strs[url_strs.length - 2]

      for (const v of ClusterList) {
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
    url: '/clusters$',
    type: 'post',
    response: config => {
      const { siteId, areaCode, name, imageTypes, haTag, enabled, nfs_ip, nfs_source, nfs_opts, description } = config.body
      let aSiteId = SiteList[0]
      for (const v of SiteList) {
        if (v.id.toString() === siteId.toString()) {
          aSiteId = v
          break
        }
      }

      let aAreaCode = AreaList[0]
      for (const v of AreaList) {
        if (v.code.toString() === areaCode.toString()) {
          aAreaCode = v
          break
        }
      }
      let aType = ImageTypeList[0]
      for (const v of ImageTypeList) {
        if (v.name.toString() === imageTypes.toString()) {
          aType = v
          break
        }
      }

      ClusterList.push(Mock.mock({
        id: '@increment',
        name: name,
        site: {
          id: aSiteId.id,
          name: aSiteId.name
        },
        code: {
          code: aAreaCode.code,
          display: aAreaCode.display
        },
        imageTypes: aType,
        networkings: [{
          id: '',
          name: ''
        }],
        enabled: enabled,
        nfs_ip: nfs_ip,
        nfs_source: nfs_source,
        nfs_opts: nfs_opts,
        haTag: haTag,
        description: description,
        created: {
          user: 'user001',
          timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
        },
        modified: {
          user: 'user001',
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

