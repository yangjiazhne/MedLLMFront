/*
 * @Author: Azhou
 * @Date: 2021-05-12 15:02:24
 * @LastEditors: Azhou
 * @LastEditTime: 2021-11-25 11:47:17
 */

import { BASE_URL } from '@/constants'
import { getUidToken } from '@/helpers/dthelper'
import superagent from 'superagent'
import qs from 'qs'

// 用户注册
export const createUserWithPassword = (fname, lname, email, password) => {
  const { uid, token } = getUidToken()

  return new Promise((resolve, reject) => {
    try {
      superagent
        .post(BASE_URL + 'createUserWithPassword')
        .send({ firstName: fname, secondName: lname, email, authType: 'emailSignUp' })
        .set('uid', uid)
        .set('token', token)
        .set('password', password)
        .end((err, res) => {
          if (err || !res.body.success)
            resolve({
              err: true,
              data: res?.body?.message || res.body.msg,
            })
          else
            resolve({
              err: false,
              data: res.body,
            })
        })
    } catch (err) {
      reject(err)
    }
  })
}

// 用户正常登录
export const dtLogin = (email, password, type) => {
  const { uid, token } = getUidToken()

  return new Promise((resolve, reject) => {
    try {
      superagent
        .post(BASE_URL + 'login')
        .set('uid', uid)
        .set('token', token)
        .set('email', email)
        .set('password', password)
        .set('encrypted', type === 'temp' ? 'true' : 'false')
        .end((err, res) => {
          if (err)
            resolve({
              err: true,
              data: res.body.message,
            })
          else
            resolve({
              err: false,
              data: res.body,
            })
        })
    } catch (err) {
      reject(err)
    }
  })
}

export const getUserProjects = queryData => {
  const { uid, token } = getUidToken()
  const url = `${BASE_URL}getUserProjects/?${qs.stringify(queryData)}`
  return new Promise(resolve => {
    superagent
      .post(url)
      .set('uid', uid)
      .set('token', token)
      .end((err, res) => {
        if (err)
          resolve({
            err: true,
            data: err.response.body.message,
          })
        else
          resolve({
            err: false,
            data: res.body,
          })
      })
  })
}

// 用户通过邮箱重置密码
export const resetPassword = email => {
  const { uid, token } = getUidToken()

  return new Promise((resolve, reject) => {
    try {
      superagent
        .post(BASE_URL + 'resetPassword')
        .set('uid', uid)
        .set('token', token)
        .set('email', email)
        .end((err, res) => {
          if (err || !res.body.success)
            resolve({
              err: true,
              data: res?.body?.message || res.body.msg,
            })
          else
            resolve({
              err: false,
              data: res.body,
            })
        })
    } catch (err) {
      reject(err)
    }
  })
}

// 用户修改密码
export const changePassword = (email, password) => {
  const { uid, token } = getUidToken()

  return new Promise((resolve, reject) => {
    try {
      superagent
        .post(BASE_URL + 'updateAdminPassword')
        .set('uid', uid)
        .set('token', token)
        .set('email', email)
        .set('password', password)
        .end((err, res) => {
          if (err)
            resolve({
              err: true,
              data: res.body.message,
            })
          else
            resolve({
              err: false,
              data: res.body,
            })
        })
    } catch (err) {
      reject(err)
    }
  })
}

// 获取用户信息
export const getHomeData = cache => {
  let url = 'getUserHome'
  if (cache) {
    url = 'getUserHome?cache=false'
  }
  const { uid, token } = getUidToken()
  return new Promise((resolve, reject) => {
    superagent
      .post(BASE_URL + url)
      .set('uid', uid)
      .set('token', token)
      .end((err, res) => {
        if (err)
          resolve({
            err: true,
            data: res?.body?.message || '服务器错误',
          })
        else
          resolve({
            err: false,
            data: res.body,
          })
      })
  })
}

// 用户获取配置信息
export const userGetAllConfig = () => {
  const { uid, token } = getUidToken()
  return new Promise((resolve, reject) => {
    try {
      superagent
        .get(BASE_URL + 'getMedicalConfig')
        .set('uid', uid)
        .set('token', token)
        .end((err, res) => {
          if (err)
            resolve({
              err: true,
              data: res?.body?.message || '服务器错误',
            })
          else
            resolve({
              err: false,
              data: res.body,
            })
        })
    } catch (err) {
      reject(err)
    }
  })
}
