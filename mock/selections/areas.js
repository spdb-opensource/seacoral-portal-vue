import Mock from 'mockjs'

export const AreaList = []

export const areaMap = new Map()
areaMap.set('code1', '区域一')
areaMap.set('code2', '区域二')
areaMap.set('code3', '区域三')
areaMap.set('code4', '区域四')
areaMap.set('code5', '区域五')

for (const [code, name] of areaMap.entries()) {
  AreaList.push(Mock.mock({
    code: code,
    name: name,
    sequence: '@increment'
  }))
}

export default [
  {
    url: '/selections/areas',
    type: 'get',
    response: config => {
      return AreaList
    }
  }
]

