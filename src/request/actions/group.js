import superagent from 'superagent'
import qs from 'qs'
import { BASE_URL, imgUploadPre, PYTHON_SERVER_HTTP } from '@/constants'
import { getToken } from '@/helpers/dthelper'

//创建组
export const createGroup = data => {
  const token = getToken()

  return new Promise((resolve, reject) => {
    superagent
      .post(BASE_URL + '/group/create')
      .send(data)
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        if (err)
          resolve({
            err: true,
            data: err.response.body.msg,
          })
        else
          resolve({
            err: false,
            data: res.body,
          })
      })
  })
}

//编辑组
export const updateGroup = data => {
  const token = getToken()

  return new Promise((resolve, reject) => {
    superagent
      .post(BASE_URL + '/group/update')
      .send(data)
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        if (err)
          resolve({
            err: true,
            data: err.response.body.msg,
          })
        else
          resolve({
            err: false,
            data: res.body,
          })
      })
  })
}

//删除组
export const deleteGroup = groupId => {
  const token = getToken()

  return new Promise((resolve, reject) => {
    superagent
      .post(BASE_URL + '/group/delete')
      .query({ groupId })
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        if (err)
          resolve({
            err: true,
            data: err.response.body.msg,
          })
        else
          resolve({
            err: false,
            data: res.body,
          })
      })
  })
}

//查询组
export const searchGroup = (projectId, groupId, groupName, groupDescription, page, size) => {
  const token = getToken()

  return new Promise((resolve, reject) => {
    superagent
      .get(BASE_URL + '/group/search')
      .query({projectId, groupId, groupName, groupDescription,page,size})
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        if (err)
          resolve({
            err: true,
            data: err.response.body.msg,
          })
        else
          resolve({
            err: false,
            data: res.body.data,
          })
      })
  })
}