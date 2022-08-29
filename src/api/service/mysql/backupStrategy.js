import request from '@/utils/request'

export function fetchBackupStrategy(serv_group_id) {
  return request({
    url: `/backupfiles/strategy?serv_group_id=${serv_group_id}`,
    method: 'get'
  })
}

export function addBackupStrategy(serv_group_id, data) {
  return request({
    url: `/backupfiles/strategy/${serv_group_id}`,
    method: 'post',
    data
  })
}

export function deleteBackupStrategy(back_strategy_id) {
  return request({
    url: `/backupfiles/deleteStrategy/${back_strategy_id}`,
    method: 'delete'
  })
}
