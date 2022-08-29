import request from '@/utils/request'

export function fetchImageTypes() {
  return request({
    url: '/selections/image_types',
    method: 'get'
  })
}

export function fetchImages() {
  return request({
    url: '/images',
    method: 'get'
  })
}

export function fetchImagesByType(type) {
  return request({
    url: '/images?type=${type}',
    method: 'get'
  })
}

export function addImage(data) {
  return request({
    url: '/images',
    method: 'post',
    data
  })
}

export function enableImage(image_id) {
  return request({
    url: `/images/${image_id}/enabled`,
    method: 'put'
  })
}

export function disableImage(image_id) {
  return request({
    url: `/images/${image_id}/disabled`,
    method: 'put'
  })
}

export function deleteImage(image_id) {
  return request({
    url: `/images/${image_id}`,
    method: 'delete'
  })
}

export function fetchImageConfig(image_id) {
  return request({
    url: `/images/${image_id}/cfgs`,
    method: 'get'
  })
}
