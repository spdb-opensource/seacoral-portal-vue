import request from '@/utils/request'

export function fetchPrivilegesEnabledAndGlobal() {
  return request({
    url: '/privileges?enabled=true&global=true',
    method: 'get'
  })
}

export function fetchPrivilegesEnabledAndLocal() {
  return request({
    url: '/privileges?enabled=true&global=false',
    method: 'get'
  })
}
