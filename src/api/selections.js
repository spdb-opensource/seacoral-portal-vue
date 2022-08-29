import request from '@/utils/request'

export function fetchRegions() {
  return request({
    url: '/selections/regions',
    method: 'get'
  })
}

export function fetchRemoteStorageVendors() {
  return request({
    url: '/selections/san_vendors',
    method: 'get'
  })
}

export function fetchRemoteStorageTypes() {
  return request({
    url: '/selections/san_types',
    method: 'get'
  })
}

export function fetchAreas() {
  return request({
    url: '/selections/areas',
    method: 'get'
  })
}

export function getAppsConfig() {
  return request({
    url: '/selections/apps',
    method: 'get'
  })
}

export function getDataScopesConfig() {
  return request({
    url: '/selections/data_scopes',
    method: 'get'
  })
}

export function getNtpSever() {
  return request({
    url: '/selections/ntp_server',
    method: 'get'
  })
}

export function getCharacterSets() {
  return request({
    url: '/selections/character_sets',
    method: 'get'
  })
}

export function getBackupTypes() {
  return request({
    url: '/selections/backup_types',
    method: 'get'
  })
}

export function getDirTypes() {
  return request({
    url: '/selections/backup_storage_types',
    method: 'get'
  })
}

export function getEnabled() {
  return request({
    url: '/selections/enabled',
    method: 'get'
  })
}

export function getRebuildStrategys() {
  return request({
    url: '/selections/rebuild_strategys',
    method: 'get'
  })
}

export function getEnabledHostsById(host_id) {
  return request({
    url: `/selections/hosts/${host_id}/enabled`,
    method: 'get'
  })
}
