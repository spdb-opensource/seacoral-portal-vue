import request from '@/utils/request'

export function fetchBusinessSystems() {
  return request({
    url: '/business_systems',
    method: 'get'
  })
}

export function deleteBusinessSystem(system_id) {
  return request({
    url: `/business_systems/${system_id}`,
    method: 'delete'
  })
}

export function addBusinessSystem(data) {
  return request({
    url: `/business_systems`,
    method: 'post',
    data
  })
}

export function modifyBusinessSystem(system_id, data) {
  return request({
    url: `/business_systems/${system_id}`,
    method: 'put',
    data
  })
}
