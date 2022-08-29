import request from '@/utils/request'

export function fetchDicts(query) {
  return request({
    url: '/dicts',
    method: 'get',
    params: query
  })
}

export function fetchDictTypes() {
  return request({
    url: '/dict_types',
    method: 'get'
  })
}

export function fetchDictTypesPools(id) {
  return request({
    url: `/dicts?dict_type_code=${id}`,
    method: 'get'
  })
}

export function modifyDictTypesPools(globalid, data, id) {
  return request({
    url: `/dicts/${id}`,
    method: 'put',
    data
  })
}

export function addDictTypesPools(remote_id, data) {
  return request({
    url: `/dicts`,
    method: 'post',
    data
  })
}
