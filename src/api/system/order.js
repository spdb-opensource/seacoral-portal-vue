import request from '@/utils/request'

export function fetchOrder() {
  return request({
    url: '/order_groups',
    method: 'get'
  })
}

export function fetchViewOrder(id) {
  return request({
    url: `/order_groups/${id}`,
    method: 'get'
  })
}

export function deleteOrder(system_id) {
  return request({
    url: `/order_groups/${system_id}`,
    method: 'delete'
  })
}

export function addOrder(data) {
  return request({
    url: `/order_groups`,
    method: 'post',
    data
  })
}

export function modifyOrder(system_id, data) {
  return request({
    url: `/order_groups/${system_id}`,
    method: 'put',
    data
  })
}

export function executeOrder(system_id) {
  return request({
    url: `/order_groups/${system_id}/execute`,
    method: 'put'
  })
}

export function auditOrder(system_id, data) {
  return request({
    url: `/order_groups/${system_id}/audit`,
    method: 'put',
    data
  })
}
