import Mock from 'mockjs'

export const CfgList = []
const count = 10

for (let i = 0; i < count; i++) {
  CfgList.push(Mock.mock({
    id: '@increment',
    'canset|1': [true, false],
    'mustRestart|1': [true, false],
    key: Mock.Random.string('lower', 6, 12),
    value: Mock.Random.integer(0, 10),
    defaultValue: 0,
    description: '',
    range: ''
  }))
}

export default [
  {
    url: '/cfg',
    type: 'get',
    response: config => {
      return {
        code: 200,
        data: CfgList
      }
    }
  }

]

