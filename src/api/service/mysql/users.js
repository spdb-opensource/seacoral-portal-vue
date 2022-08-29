import request from '@/utils/request'

export function addUserDirect(serv_group_id, data) {
  return request({
    url: `/serv_grps/mysql/${serv_group_id}/users`,
    method: 'post',
    data
  })
}

export function updateUserDirect(serv_group_id, username, data) {
  return request({
    url: `/serv_grps/mysql/${serv_group_id}/saveUpdateUser/${username}`,
    method: 'put',
    data
  })
}

export function updateUserPassword(serv_group_id, username, data) {
  return request({
    url: `/serv_grps/mysql/${serv_group_id}/changeUserPwd/${username}`,
    method: 'put',
    data
  })
}

export function fetchUsers(serv_group_id) {
  return request({
    url: `/serv_grps/mysql/${serv_group_id}/users`,
    method: 'get'
  })
}

export function fetchUser(serv_group_id, username) {
  return request({
    url: `/serv_grps/mysql/${serv_group_id}/users/${username}?ip=%25`,
    method: 'get'
  })
}

export function deleteUser(serv_group_id, username) {
  return request({
    url: `/serv_grps/mysql/${serv_group_id}/users/${username}?ip=%25`,
    method: 'delete'
  })
}

