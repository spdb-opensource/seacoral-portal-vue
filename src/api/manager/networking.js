import request from '@/utils/request'

export function fetchNetworking() {
  return request({
    url: '/networkings',
    method: 'get'
  })
}

export function fetchNetworkingById(id) {
  return request({
    url: `/networkings/${id}`,
    method: 'get'
  })
}

export function addNetworking(data) {
  return request({
    url: `/networkings`,
    method: 'post',
    data
  })
}

export function updateNetworking(id, data) {
  return request({
    url: `/networkings/${id}`,
    method: 'put',
    data
  })
}

export function enableNetworking(id) {
  return request({
    url: `/networkings/${id}/enabled`,
    method: 'put'
  })
}

export function disableNetworking(id) {
  return request({
    url: `/networkings/${id}/disabled`,
    method: 'put'
  })
}

export function deleteNetworking(id) {
  return request({
    url: `/networkings/${id}`,
    method: 'delete'
  })
}

export function getTopologiesTypes() {
  return request({
    url: `/selections/topologie_types`,
    method: 'get'
  })
}

export function getClustersBysite(site_id) {
  return request({
    url: `/selections/clusters?site_id=${site_id}&enabled=true`,
    method: 'get'
  })
}
