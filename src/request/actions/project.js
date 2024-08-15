import superagent from 'superagent'
import qs from 'qs'
import { BASE_URL, imgUploadPre, PYTHON_SERVER_HTTP } from '@/constants'
import { getToken } from '@/helpers/dthelper'

//创建数据集
export const createProject = data => {
  const token = getToken()

  return new Promise((resolve, reject) => {
    superagent
      .post(BASE_URL + '/project/create')
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

//编辑数据集
export const editProject = data => {
  const token = getToken()

  return new Promise((resolve, reject) => {
    superagent
      .post(BASE_URL + '/project/update')
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

//删除数据集
export const deleteProject = projectId => {
  const token = getToken()

  return new Promise((resolve, reject) => {
    superagent
      .post(BASE_URL + '/project/delete')
      .query({projectId})
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

//查询数据集
export const searchProject = (projectId, projectName,page,size) => {
  const token = getToken()
  return new Promise((resolve, reject) => {
    superagent
      .get(BASE_URL + '/project/search')
      .query({projectId, projectName,page,size})
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        if (err)
          resolve({
            err: true,
            data: err,
          })
        else
          resolve({
            err: false,
            data: res.body.data,
          })
      })
  })
}
