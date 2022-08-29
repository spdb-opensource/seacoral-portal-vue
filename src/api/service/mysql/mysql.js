import request from '@/utils/request'

export function fetchServices() {
  return request({
    url: '/serv_grps/mysql',
    method: 'get'
  })
}

export function fetchServiceById(serv_group_id) {
  return request({
    url: `/serv_grps/mysql/${serv_group_id}`,
    method: 'get'
  })
}

export function fetchMySQLcfgsById(serv_group_id) {
  return request({
    url: `/serv_grps/mysql/cfgs/${serv_group_id}`,
    method: 'get'
  })
}

export function updateParam(serv_group_id, data) {
  return request({
    url: `/serv_grps/mysql/editCfgs/${serv_group_id}`,
    method: 'put',
    data })
}

export function fetchMySQLScales() {
  return request({
    url: `/scales?type=mysql`,
    method: 'get'
  })
}

export function startServiceGroup(serv_group_id) {
  return request({
    url: `/serv_grps/mysql/${serv_group_id}/start`,
    method: 'put'
  })
}

export function stopServiceGroup(serv_group_id) {
  return request({
    url: `/serv_grps/mysql/${serv_group_id}/stop`,
    method: 'put'
  })
}

export function deleteServiceGroup(serv_group_id, service_name) {
  return request({
    url: `/serv_grps/mysql/${serv_group_id}/${service_name}`,
    method: 'delete'
  })
}

export function updateExpansion(serv_group_id, orderGroupId, data) {
  return request({
    url: `/serv_grps/mysql/${serv_group_id}/scale/${orderGroupId}`,
    method: 'put',
    data
  })
}

export function updateBackup(serv_group_id, data) {
  return request({
    url: `/serv_grps/mysql/${serv_group_id}/backup`,
    method: 'put',
    data
  })
}

export function updateImage(serv_group_id, data) {
  return request({
    url: `/serv_grps/mysql/${serv_group_id}/image`,
    method: 'put',
    data
  })
}

export function getMySQLVersionEnabled() {
  return request({
    url: '/images?type=mysql&enabled=true',
    method: 'get'
  })
}

export function getMySQLInstanceInfo(unit_id) {
  return request({
    url: `/serv_grps/mysql/instances/${unit_id}/info`,
    method: 'get'
  })
}

export function updateMySQLInstance(data) {
  return request({
    url: '/serv_grps/mysql/instances',
    method: 'put',
    data
  })
}

export function rebuildMySQL(data) {
  return request({
    url: '/serv_grps/mysql/rebuild',
    method: 'put',
    data
  })
}

export function getPodShell(site_name, pod_id, type) {
  return request({
    // url: `/api/v1/pod/default/${pod_id}/shell/${service_type}`
    // url: `/networkings/shell/${pod_id}/${service_type}`
    url: `/networkings/shell/${site_name}/${pod_id}/${type}`
  })
}

export function getMgmpath() {
  return request({
    // url: `/api/v1/pod/default/${pod_id}/shell/${service_type}`
    url: `/networkings/mgmpath`
  })
}
