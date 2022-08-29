import Mock from 'mockjs'

const List = []

export const regionMap = new Map()
regionMap.set('SH', '上海')
regionMap.set('BJ', '北京')
regionMap.set('GZ', '广州')

for (const [code, name] of regionMap.entries()) {
  List.push(Mock.mock({
    id: '@increment',
    code: code,
    name: name,
    sequence: '@increment',
    gmtCreated: '2019-01-01 00:00:00',
    creator: 'admin'
  }))
}

export default [
  {
    url: '/selections/regions',
    type: 'get',
    response: config => {
      return List
    }
  }
]

