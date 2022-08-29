import request from '@/utils/request'

export function fetchClusters() {
  return request({
    url: '/clusters',
    method: 'get'
  })
}

export function fetchClusterById(id) {
  return request({
    url: `/clusters/${id}`,
    method: 'get'
  })
}

export function updateClusters(id, data) {
  return request({
    url: `/clusters/${id}`,
    method: 'put',
    data
  })
}

export function deleteClusters(id) {
  return request({
    url: `/clusters/${id}`,
    method: 'delete'
  })
}

export function enableRemoteCluster(remote_id) {
  return request({
    url: `/clusters/${remote_id}/enabled`,
    method: 'put'
  })
}

export function disableRemoteCluster(remote_id) {
  return request({
    url: `/clusters/${remote_id}/disabled`,
    method: 'put'
  })
}

export function addRemoteCluster(data) {
  return request({
    url: '/clusters',
    method: 'post',
    data
  })
}

