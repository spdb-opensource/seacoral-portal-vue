import request from '@/utils/request'

export function fetchBackupList(serv_group_id) {
  return request({
    url: `/backupfiles?serv_group_id=${serv_group_id}&userName=false`,
    method: 'get'
  })
}

// export function fetchBackupFiles() {
//   return request({
//     url: `/backupfiles?status=Complete&userName=true`,
//     method: 'get'
//   })
// }

export function fetchBackupFiles(site_id, serv_group_id, valid) {
  return request({
    url: `/backupfiles?site_id=${site_id}&serv_group_id=${serv_group_id}&valid=${valid}`,
    method: 'get'
  })
}

export function deleteBackupList(backup_id) {
  return request({
    url: `/backupfiles/${backup_id}`,
    method: 'delete'
  })
}

export function restoreBackupFiles(data) {
  return request({
    url: `/backupfiles/restore`,
    method: 'put',
    data
  })
}

