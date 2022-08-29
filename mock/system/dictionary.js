import Mock from 'mockjs'

export const DictionaryList = []
const DictTypesMap = new Map()
const count = 25

for (let i = 0; i < count; i++) {
  DictionaryList.push(Mock.mock({
    id: Mock.Random.string('lower', 6, 12),
    name: Mock.Random.string('lower', 4, 10),
    code: Mock.Random.string('lower', 6, 12)
  }))
}

for (let j = 0; j < DictionaryList.length; j++) {
  const tmpList = []
  for (let i = 0; i < Mock.Random.integer(1, 20); i++) {
    tmpList.push(Mock.mock({
      id: Mock.Random.string('lower', 6, 12),
      name: Mock.Random.string('lower', 4, 10),
      code: Mock.Random.string('lower', 6, 12),
      dictTypeCode: DictionaryList[j].code,
      sequence: Mock.Random.integer(1, 100),
      creator: 'admin',
      gmtCreate: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')

    }))
  }
  DictTypesMap.set(DictionaryList[j].code.toString(), tmpList)
}

export const ArchList = [
  {
    id: '@increment',
    code: 'single',
    name: '单节点',
    sequence: 1,
    gmtCreate: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    creator: 'admin'
  },
  {
    id: '@increment',
    code: 'master_slave_half_sync',
    name: '主备(半同步)',
    sequence: 2,
    gmtCreate: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    creator: 'admin'
  },
  {
    id: '@increment',
    code: 'master_slave_async',
    name: '主备(异步)',
    sequence: 3,
    gmtCreate: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    creator: 'admin'
  },
  {
    id: '@increment',
    code: 'clone',
    name: '克隆',
    sequence: 4,
    gmtCreate: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    creator: 'admin'
  }
]

export default [
  {
    url: '/dicts',
    type: 'get',
    response: config => {
      const { dict_type_code } = config.query

      if (dict_type_code === 'arch_type') {
        return {
          code: 200,
          data: ArchList
        }
      }
    }
  },
  {
    url: '/dict_types',
    type: 'get',
    response: () => {
      return {
        code: 200,
        data: DictionaryList
      }
    }
  },
  {
    url: '/dicts?dict_type_code=[0-9a-zA-Z]',
    type: 'get',
    response: config => {
      const url_strs = config.originalUrl.split('/')
      const remote_id = url_strs[url_strs.length - 2]
      return {
        code: 200,
        data: DictTypesMap.get(remote_id)
      }
    }
  },

  {
    url: '/dicts',
    type: 'post',
    response: config => {
      const { code, dictTypeCode, name, sequence } = config.body
      DictTypesMap.get(dictTypeCode).push(Mock.mock({
        id: Mock.Random.string('lower', 6, 12),
        code: code,
        name: name,
        sequence: sequence,
        dictTypeCode: dictTypeCode,
        creator: 'admin',
        gmtCreate: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      }))
      return {
        code: 201,
        msg: '',
        data: null
      }
    }
  },

  {
    url: '/dicts/[a-zA-Z0-9]',
    type: 'put',
    response: config => {
      const tmpList = DictTypesMap.get(config.body.dictTypeCode)
      for (const v of tmpList) {
        if (v.id.toString() === config.body.id.toString()) {
          v.name = config.body.name
          v.sequence = config.body.sequence
          break
        }
      }
      return {
        code: 200,
        msg: ''
      }
    }
  }
]

