import request from '@/utils/request'

export function startUnit(serv_grps_id, unit_id) {
  return request({
    url: `/serv_grps/mysql/${serv_grps_id}/units/${unit_id}/start`,
    method: 'put'
  })
}

export function stopUnit(serv_grps_id, unit_id) {
  return request({
    url: `/serv_grps/mysql/${serv_grps_id}/units/${unit_id}/stop`,
    method: 'put'
  })
}

export function backupUnit(serv_grps_id, unit_id, data) {
  return request({
    url: `/serv_grps/mysql/${serv_grps_id}/units/${unit_id}/backup`,
    method: 'put',
    data
  })
}

export function isolateUnit(unit_id) {
  return request({
    url: `/units/${unit_id}/isolate`,
    method: 'put'
  })
}

export function recoverUnit(unit_id) {
  return request({
    url: `/units/${unit_id}/recover`,
    method: 'put'
  })
}

export function updateUnitVersion(unit_id, image_id) {
  return request({
    url: `/units/${unit_id}/image?image_id=${image_id}`,
    method: 'put'
  })
}

export function getTasksById(task_id) {
  return request({
    url: `/serv_grps/mysql/tasks/${task_id}`,
    method: 'get'
  })
}

export function setSemiSync(serv_grps_id, unit_id) {
  return request({
    url: `/serv_grps/mysql/${serv_grps_id}/replication/semi_sync`,
    method: 'put',
    data: {
      unit_id: unit_id
    }
  })
}

export function setSource(serv_grps_id, unit_id) {
  return request({
    url: `/serv_grps/mysql/${serv_grps_id}/replication/set_source`,
    method: 'put',
    data: {
      unit_id: unit_id
    }
  })
}

