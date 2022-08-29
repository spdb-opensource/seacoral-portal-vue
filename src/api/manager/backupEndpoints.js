import request from '@/utils/request'

export function fetchBackupFileEndPoints() {
  return request({
    url: `/backupfiles/endpoint/`,
    method: 'get'
  })
}

export function fetchBackupFileEndPointById(id) {
  return request({
    url: `/backupfiles/endpoint?endpointId=${id}`,
    method: 'get'
  })
}

export function updateBackupFileEndPoint(id, data) {
  return request({
    url: `/backupfiles/endpoint/${id}`,
    method: 'put',
    data
  })
}

export function deleteBackupFileEndPoint(id) {
  return request({
    url: `/backupfiles/endpoint/${id}`,
    method: 'delete'
  })
}

export function addBackupFileEndPoint(data) {
  return request({
    url: '/backupfiles/endpoint',
    method: 'post',
    data
  })
}
