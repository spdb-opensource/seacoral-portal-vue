import request from '@/utils/request'

export function roleChangeSlaveAction(serv_group_id, data) {
  return request({
    url: `/serv_grps/mysql/${serv_group_id}/replication/set_source`,
    method: 'put',
    data
  })
}

export function unitRoleChangeSlaveAction(slaveId, data) {
  return request({
    url: `/serv_grps/mysql/roleChangeSlave/${slaveId}`,
    method: 'put',
    data
  })
}

export function roleChangeAction(data) {
  return request({
    url: `/serv_grps/mysql/roleChange`,
    method: 'put',
    data
  })
}
