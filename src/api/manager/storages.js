import request from '@/utils/request'

export function fetchRemoteStorages() {
  return request({
    url: '/storages/remotes',
    method: 'get'
  })
}

export function addRemoteStorage(data) {
  return request({
    url: '/storages/remotes',
    method: 'post',
    data
  })
}

export function enableRemoteStorage(remote_id) {
  return request({
    url: `/storages/remotes/${remote_id}/enabled`,
    method: 'put'
  })
}

export function disableRemoteStorage(remote_id) {
  return request({
    url: `/storages/remotes/${remote_id}/disabled`,
    method: 'put'
  })
}

export function deleteRemoteStorage(id) {
  return request({
    url: `/storages/remotes/${id}`,
    method: 'delete'
  })
}

export function fetchRemoteStoragePools(id) {
  return request({
    url: `/storages/remotes/${id}/pools`,
    method: 'get'
  })
}

export function addRemoteStoragePools(remote_id, data) {
  return request({
    url: `/storages/remotes/${remote_id}/pools`,
    method: 'post',
    data
  })
}

export function enableRemoteStoragePools(remote_id, pool_id) {
  return request({
    url: `/storages/remotes/${remote_id}/pools/${pool_id}/enabled`,
    method: 'put'
  })
}

export function disableRemoteStoragePools(remote_id, pool_id) {
  return request({
    url: `/storages/remotes/${remote_id}/pools/${pool_id}/disabled`,
    method: 'put'
  })
}

export function deleteRemoteStoragePools(remote_id, pool_id) {
  return request({
    url: `/storages/remotes/${remote_id}/pools/${pool_id}`,
    method: 'delete'
  })
}
