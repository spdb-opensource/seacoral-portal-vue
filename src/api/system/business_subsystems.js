import request from '@/utils/request'

export function fetchBusinessSubSystems() {
  return request({
    url: '/business_subsystems',
    method: 'get'
  })
}

export function deleteBusinessSubSystem(system_id) {
  return request({
    url: `/business_subsystems/${system_id}`,
    method: 'delete'
  })
}

export function addBusinessSubSystem(data) {
  return request({
    url: `/business_subsystems`,
    method: 'post',
    data
  })
}

export function modifyBusinessSubSystem(system_id, data) {
  return request({
    url: `/business_subsystems/${system_id}`,
    method: 'put',
    data
  })
}
