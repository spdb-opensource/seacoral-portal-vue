import request from '@/utils/request'

export function fetchHosts() {
  return request({
    url: '/hosts',
    method: 'get'
  })
}

export function enableHost(host_id) {
  return request({
    url: `/hosts/${host_id}/enabled`,
    method: 'put'
  })
}

export function disableHost(host_id) {
  return request({
    url: `/hosts/${host_id}/disabled`,
    method: 'put'
  })
}

export function deleteHost(host_id, data) {
  return request({
    url: `/hosts/${host_id}/delete`,
    method: 'put',
    data
  })
}

export function addHost(data) {
  return request({
    url: `/hosts`,
    method: 'post',
    data
  })
}

export function modifyHost(host_id, data) {
  return request({
    url: `/hosts/${host_id}`,
    method: 'put',
    data
  })
}

export function monitorHost(data) {
  return request({
    url: `/hosts/agents/install`,
    method: 'put',
    data
  })
}
