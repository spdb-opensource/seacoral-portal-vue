import request from '@/utils/request'

export function fetchDatabasesById(serv_group_id) {
  return request({
    url: `/serv_grps/mysql/${serv_group_id}/databases`,
    method: 'get'
  })
}

export function fetchDatabaseByName(serv_group_id, database_name) {
  return request({
    url: `/serv_grps/mysql/${serv_group_id}/databases/${database_name}`,
    method: 'get'
  })
}

export function addDatabase(serv_group_id, data) {
  return request({
    url: `/serv_grps/mysql/${serv_group_id}/databases`,
    method: 'post',
    data
  })
}

export function deleteDatabases(serv_group_id, database_name) {
  return request({
    url: `/serv_grps/mysql/${serv_group_id}/databases/${database_name}`,
    method: 'delete'
  })
}
