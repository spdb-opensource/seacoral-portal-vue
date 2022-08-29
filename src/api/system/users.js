import request from '@/utils/request'

export function fetchUsers() {
  return request({
    url: '/users',
    method: 'get'
  })
}

export function fetchUsersById(username) {
  return request({
    url: `/users/${username}`,
    method: 'get'
  })
}

export function addUsers(data) {
  return request({
    url: `/users`,
    method: 'post',
    data
  })
}

export function updateUsers(username, data) {
  return request({
    url: `/users/${username}`,
    method: 'put',
    data
  })
}

export function enableUsers(username) {
  return request({
    url: `/users/${username}/enabled`,
    method: 'put'
  })
}

export function disableUsers(username) {
  return request({
    url: `/users/${username}/disabled`,
    method: 'put'
  })
}

export function deleteUsers(username) {
  return request({
    url: `/users/${username}`,
    method: 'delete'
  })
}

export function modifyPassword(username, data) {
  return request({
    url: `/users/${username}/pwd`,
    method: 'put',
    data
  })
}
