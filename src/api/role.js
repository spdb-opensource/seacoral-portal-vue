import request from '@/utils/request'

export function getRoutes() {
  return request({
    url: '/routes',
    method: 'get'
  })
}

export function getRoles() {
  return request({
    url: '/roles',
    method: 'get'
  })
}

export function getRoleById(role_id) {
  return request({
    url: '/roles/' + role_id,
    method: 'get'
  })
}

export function getAppsConfigById(role_id) {
  return request({
    url: '/roles/' + role_id + '/cfgs/apps',
    method: 'get'
  })
}

export function getDataScopesById(role_id) {
  return request({
    url: '/roles/' + role_id + '/cfgs/data_scopes',
    method: 'get'
  })
}

export function updateApps(role_id, data) {
  return request({
    url: '/roles/' + role_id + '/cfgs/apps',
    method: 'put',
    data
  })
}

export function updateDataScopes(role_id, data) {
  return request({
    url: '/roles/' + role_id + '/cfgs/data_scopes',
    method: 'put',
    data
  })
}

export function updateOthers(role_id, data) {
  return request({
    url: '/roles/' + role_id + '/cfgs/others',
    method: 'put',
    data
  })
}

export function getOthersById(role_id) {
  return request({
    url: '/roles/' + role_id + '/cfgs/others',
    method: 'get'
  })
}

export function addRole(data) {
  return request({
    url: '/roles',
    method: 'post',
    data
  })
}

export function updateRole(id, data) {
  return request({
    url: `/roles/${id}`,
    method: 'put',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: `/roles/${id}`,
    method: 'delete'
  })
}
