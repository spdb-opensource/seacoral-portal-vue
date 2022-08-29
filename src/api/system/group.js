import request from '@/utils/request'

export function fetchGroup() {
  return request({
    url: '/groups',
    method: 'get'
  })
}

export function deleteGroup(system_id) {
  return request({
    url: `/groups/${system_id}`,
    method: 'delete'
  })
}

export function addGroup(data) {
  return request({
    url: `/groups`,
    method: 'post',
    data
  })
}

export function modifyGroup(system_id, data) {
  return request({
    url: `/groups/${system_id}`,
    method: 'put',
    data
  })
}
