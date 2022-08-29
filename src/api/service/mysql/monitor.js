import request from '@/utils/request'

export function fetchMonitorData(params, data) {
  return request({
    url: params,
    method: 'put',
    data
  })
}
