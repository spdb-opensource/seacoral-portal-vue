import Mock from 'mockjs'

export const oprateLogsList = []
const count = 100

for (let i = 0; i < count; i++) {
  oprateLogsList.push(Mock.mock({
    id: Mock.Random.string('lower', 32, 32),
    objType: '登录',
    action: '登录',
    objName: 'admin',
    description: '登录',
    success: Mock.Random.boolean(),
    gmtCreate: Mock.Random.now('week'),
    uptime: 4,
    creator: 'admin'
  }))
}

export default [
  {
    url: '/operate_logs',
    type: 'get',
    response: config => {
      const { objType, start, end } = config.query
      const tempList = []
      const startTime = new Date(parseInt(start)).getTime()
      const endTime = new Date(parseInt(end)).getTime()
      oprateLogsList.forEach(element => {
        const time = new Date(element.gmtCreate).getTime()
        if (time > startTime && time < endTime) {
          if (objType && objType !== '') {
            if (element.objType.includes(objType)) {
              tempList.push(element)
            }
          } else {
            tempList.push(element)
          }
        }
      })
      return {
        code: 200,
        data: tempList
      }
    }
  }
]

