import Mock from 'mockjs'

import { SiteList } from '../manager/sites'
import { AreaList } from '../selections/areas'
import { ImageList } from '../manager/images'
import { ArchList } from './dictionary'
import { CfgList } from './cfg'

export const OrderList = []
const count = 100

for (let i = 0; i < count; i++) {
  const site = SiteList[Mock.Random.integer(0, SiteList.length - 1)]
  const area = AreaList[Mock.Random.integer(0, AreaList.length - 1)]
  const imageVersion = ImageList[Mock.Random.integer(0, ImageList.length - 1)]
  const arch = ArchList[Mock.Random.integer(0, ArchList.length - 1)]
  const cfgs = CfgList[Mock.Random.integer(0, CfgList.length - 1)]

  OrderList.push(Mock.mock({
    id: '@increment',
    type: 'mysql',
    site: {
      id: site.id,
      name: site.name
    },
    area: {
      code: area.code,
      display: area.name
    },
    name: Mock.Random.string('lower', 5, 6),
    actionType: {
      code: 'new',
      display: '创建'
    },
    status: {
      code: 'unapproved',
      display: '未审批'
    },
    msg: '',
    owner: 'admin',
    gmtCreate: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    creator: 'admin',
    taskId: Mock.Random.string('lower', 6, 12),
    order: [{
      id: '@increment',
      type: 'mysql',
      cnt: 1,
      version: {
        major: imageVersion.major,
        minor: imageVersion.minor,
        patch: imageVersion.patch,
        build: imageVersion.build
      },
      arch: {
        mode: arch.code,
        replicas: arch.sequence,
        name: arch.name
      },
      cpuCnt: 2,
      memSize: 2048,
      port: 3306,
      dataDirSize: 81920,
      dataDirType: {
        code: 'remote',
        display: '外置存储'
      },
      dataDirPerformance: {
        code: 'high',
        display: '高性能'
      },
      logDirSize: 81920,
      cfg: `{${cfgs.key}:${cfgs.value}}`

    }]
  }))
}

export default [
  {
    url: '/order_groups',
    type: 'get',
    response: () => {
      return {
        code: 200,
        data: OrderList
      }
    }
  },

  {
    url: '/order_groups/[a-zA-Z0-9]*',
    type: 'get',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const remote_id = url_strs[url_strs.length - 1]
      return {
        code: 200,
        data: OrderList.get(remote_id)
      }
    }
  }

  //   {
  //     url: '/sites/[a-zA-Z0-9]*',
  //     type: 'put',
  //     response: config => {
  //       for (const v of SiteList) {
  //         if (v.id.toString() === config.body.id.toString()) {
  //           v.name = config.body.name
  //           v.desc = config.body.desc
  //           v.region = {
  //             code: config.body.region,
  //             display: regionMap.get(config.body.region)
  //           }
  //           break
  //         }
  //       }

  //       return {
  //         code: 200,
  //         msg: ''
  //       }
  //     }
  //   },

  //   {
  //     url: '/sites/[a-zA-Z0-9]*',
  //     type: 'delete',
  //     response: config => {
  //       const url_strs = config.originalUrl.split('/')
  //       const requestId = parseInt(url_strs[url_strs.length - 1])
  //       let i = 0
  //       for (const v of SiteList) {
  //         if (v.id.toString() === requestId.toString()) {
  //           SiteList.splice(i, 1)
  //           break
  //         }
  //         i += 1
  //       }

  //       return {
  //         code: 204,
  //         msg: ''
  //       }
  //     }
  //   },

  //   {
  //     url: '/order_group$',
  //     type: 'post',
  //     response: config => {
  //       const { type, version, created_user } = config.body

  //       let aType = ImageTypeList[0]
  //       for (const v of ImageTypeList) {
  //         if (v.id.toString() === type.toString()) {
  //           aType = v
  //           break
  //         }
  //       }

  //       ImageList.push(Mock.mock({
  //         id: '@increment',
  //         type: aType.name,
  //         version: {
  //           major: version.major,
  //           minor: version.minor,
  //           patch: version.patch,
  //           build: version.build
  //         },
  //         enabled: Mock.Random.boolean(),
  //         description: '',
  //         created: {
  //           user: created_user,
  //           timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  //         },
  //         modified: {
  //           user: created_user,
  //           timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  //         },
  //         task: {
  //           id: 'ssss',
  //           action: {
  //             code: 'sss',
  //             display: 'ssss'
  //           },
  //           status: {
  //             code: 'sss',
  //             'display|1': ['新增成功', '新增失败', '删除成功']
  //           }
  //         }
  //       }))

//       return {
//         code: 201,
//         msg: '',
//         data: null
//       }
//     }
//   }
]

