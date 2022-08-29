import request from '@/utils/request'

export function fetchSites() {
  return request({
    url: '/sites',
    method: 'get'
  })
}

export function fetchSiteById(id) {
  return request({
    url: `/sites/${id}`,
    method: 'get'
  })
}

export function updateSite(id, data) {
  return request({
    url: `/sites/update/${id}`,
    method: 'put',
    data
  })
}

export function deleteSite(id) {
  return request({
    url: `/sites/${id}`,
    method: 'delete'
  })
}
