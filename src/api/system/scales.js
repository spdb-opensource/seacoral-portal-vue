import request from '@/utils/request'

export function fetchScales(query) {
  return request({
    url: '/scales',
    method: 'get',
    params: query
  })
}

export function fetchScalesById(id) {
  return request({
    url: `/scales/${id}`,
    method: 'get'
  })
}

export function addScales(data) {
  return request({
    url: `/scales`,
    method: 'post',
    data
  })
}

export function updateScales(id, data) {
  return request({
    url: `/scales/${id}`,
    method: 'put',
    data
  })
}

export function enableScales(id) {
  return request({
    url: `/scales/${id}/enabled`,
    method: 'put'
  })
}

export function disableScales(id) {
  return request({
    url: `/scales/${id}/disabled`,
    method: 'put'
  })
}

export function deleteScales(id) {
  return request({
    url: `/scales/${id}`,
    method: 'delete'
  })
}
