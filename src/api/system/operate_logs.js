import request from '@/utils/request'

export function fetchOperateLogs(objType, start, end) {
  if (!objType) {
    objType = ''
  }
  return request({
    url: `/operate_logs?objType=${objType}&start=${start}&end=${end}`,
    method: 'get'
  })
}
