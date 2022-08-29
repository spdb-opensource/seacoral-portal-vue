import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const prodUrl = process.env.VUE_APP_BASE_PATH + process.env.VUE_APP_BASE_API
const devUrl = process.env.VUE_APP_BASE_API
let curUrl = ''
process.env.NODE_ENV === 'development' ? curUrl = devUrl : curUrl = prodUrl
const service = axios.create({
  baseURL: curUrl, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 20000 // request timeout
})

// const cmService = axios.create({
//   baseURL: process.env.VUE_APP_CM_PATH, // url = base url + request url
//   headers: { 'X-Token': getToken() },
//   // withCredentials: true, // send cookies when cross-domain requests
//   timeout: 20000 // request timeout
// })

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-Token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    if (!response.data.code) {
      return response
    }

    const res = response.data

    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 200 && res.code !== 204 && res.code !== 201) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    if (typeof error.response === 'object' && error.response.hasOwnProperty('data') && error.response.data.hasOwnProperty('msg')) {
      Message({
        message: error.response.data.msg,
        type: 'error',
        duration: 5 * 1000
      })
    } else {
      Message({
        message: error.message,
        type: 'error',
        duration: 5 * 1000
      })
    }
    return Promise.reject(error)
  }
)

// export default service
export { service as default }
