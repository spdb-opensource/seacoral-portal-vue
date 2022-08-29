import Mock from 'mockjs'

import { SystemList } from './business_systems'

export const SubsystemList = []
const count = 25

for (let i = 0; i < count; i++) {
  const system = SystemList[Mock.Random.integer(0, SystemList.length - 1)]

  SubsystemList.push(Mock.mock({
    id: Mock.Random.string('lower', 32, 32),
    name: Mock.Random.string('lower', 6, 12),
    businessSystemName: system.name,
    businessSystemId: system.id,
    description: '子系统名称管理',
    owner: 'admin',
    ownerName: '超级管理员',
    gmtCreate: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    creator: 'admin',
    creatorName: '超级管理员'
  }))
}

export default [
  {
    url: '/business_subsystems',
    type: 'get',
    response: () => {
      return {
        code: 200,
        data: SubsystemList
      }
    }
  },

  {
    url: '/business_subsystems/[a-zA-Z0-9]*',
    type: 'put',
    response: config => {
      for (const v of SubsystemList) {
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
    url: '/business_subsystems/[a-zA-Z0-9]*',
    type: 'delete',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const system_id = url_strs[url_strs.length - 1]
      let i = 0
      for (const v of SubsystemList) {
        if (v.id.toString() === system_id.toString()) {
          SubsystemList.splice(i, 1)
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
    url: '/business_subsystems',
    type: 'post',
    response: config => {
      const { name, description, businessSystemId } = config.body
      var tmp = ''
      for (var i = 0; i < SystemList.length; i++) {
        if (businessSystemId === SystemList[i].id) {
          tmp = SystemList[i].name
        }
      }

      SubsystemList.push(Mock.mock({
        id: Mock.Random.string('lower', 32, 32),
        name: name,
        description: description,
        owner: 'admin',
        ownerName: '超级管理员',
        gmtCreate: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        creator: 'admin',
        creatorName: '超级管理员',
        businessSystemId: businessSystemId,
        businessSystemName: tmp
      }))

      return {
        code: 201,
        msg: '',
        data: null
      }
    }
  }
]

