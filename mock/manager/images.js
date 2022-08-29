import Mock from 'mockjs'
import { ImageTypeList } from '../selections/images'
import { SiteList } from './sites'

export const ImageList = []
const imageCount = 22

for (let i = 0; i < imageCount; i++) {
  const image = ImageTypeList[i % 3]
  const site = SiteList[Mock.Random.integer(0, ImageTypeList.length - 1)]
  ImageList.push(Mock.mock({
    id: '@increment',
    type: image.name,
    version: {
      major: Mock.Random.integer(0, 10),
      minor: Mock.Random.integer(0, 20),
      patch: Mock.Random.integer(0, 10),
      build: Mock.Random.integer(0, 10)
    },
    unschedulable: Mock.Random.boolean(),
    'architecture|1': ['arm', 'amd64'],
    description: '',
    site: {
      id: site.id,
      name: site.name
    },
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

export default [
  {
    url: '/images$',
    type: 'get',
    response: config => {
      // console.log(config)
      return {
        code: 200,
        data: ImageList
      }
    }
  },

  {
    url: '/images$',
    type: 'post',
    response: config => {
      const { type, site_id, architecture, version, created_user } = config.body
      let aType = ImageTypeList[0]
      for (const v of ImageTypeList) {
        if (v.id.toString() === type.toString()) {
          aType = v
          break
        }
      }

      let aSiteId = SiteList[0]
      for (const v of SiteList) {
        if (v.id.toString() === site_id.toString()) {
          aSiteId = v
          break
        }
      }

      ImageList.push(Mock.mock({
        id: '@increment',
        type: aType.name,
        version: {
          major: version.major,
          minor: version.minor,
          patch: version.patch,
          build: version.build
        },
        unschedulable: Mock.Random.boolean(),
        architecture: architecture,
        description: '',
        site: {
          id: aSiteId.id,
          name: aSiteId.name
        },
        created: {
          user: created_user,
          timestamp: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
        },
        modified: {
          user: created_user,
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
    url: '/images/[0-9a-zA-Z]+/disabled$',
    type: 'put',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const image_id = url_strs[url_strs.length - 2]

      for (const v of ImageList) {
        if (v.id.toString() === image_id) {
          v.unschedulable = true
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
    url: '/images/[0-9a-zA-Z]+/enabled$',
    type: 'put',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const image_id = url_strs[url_strs.length - 2]

      for (const v of ImageList) {
        if (v.id.toString() === image_id.toString()) {
          v.unschedulable = false
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
    url: '/images/[a-zA-Z0-9]*',
    type: 'delete',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const image_id = url_strs[url_strs.length - 1]
      let i = 0
      for (const v of ImageList) {
        if (v.id.toString() === image_id.toString()) {
          ImageList.splice(i, 1)
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
    url: '/images/[a-zA-Z0-9]*/cfgs$',
    type: 'get',
    response: () => {
      const cfgList = []
      for (let i = 0; i < 200; i++) {
        cfgList.push(Mock.mock({
          canset: Mock.Random.boolean(),
          mustRestart: Mock.Random.boolean(),
          key: Mock.Random.string('lower', 6, 12),
          value: Mock.Random.string('lower', 6, 12),
          defaultValue: Mock.Random.string('lower', 6, 12),
          description: Mock.Random.paragraph(),
          range: Mock.Random.string('lower', 20, 32)
        }))
      }

      return {
        code: 200,
        data: {
          configFile: '/opt/app-root/configmap/mysqld.cnf',
          keysets: cfgList
        }
      }
    }
  }
]

