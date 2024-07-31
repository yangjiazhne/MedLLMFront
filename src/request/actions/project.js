/*
 * @Author: Azhou
 * @Date: 2021-05-20 20:35:24
 * @LastEditors: Azhou
 * @LastEditTime: 2022-11-22 16:38:07
 */
import superagent from 'superagent'
import qs from 'qs'
import { BASE_URL, imgUploadPre, PYTHON_SERVER_HTTP } from '@/constants'
import { getUidToken } from '@/helpers/dthelper'

export const getProjectId = input => {
  const { uid, token } = getUidToken()
  return new Promise((resolve, reject) => {
    superagent
      .post(BASE_URL + 'getProjectId')
      .send(input)
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

// 获取病理图信息
export const getPathoImgInfo = pid => {
  const { uid, token } = getUidToken()
  return new Promise((resolve, reject) => {
    superagent
      .post(PYTHON_SERVER_HTTP + 'getImgMetadata')
      .send({ projectId: pid })
      .set('uid', uid)
      .set('token', token)
      .end((err, res) => {
        if (err)
          resolve({
            err: true,
            data: err.response?.body?.message,
          })
        else
          resolve({
            err: false,
            data: res.body,
          })
      })
  })
}

// create project first step: upload base information
export const uploadDataForm = data => {
  const { uid, token } = getUidToken()

  return new Promise((resolve, reject) => {
    superagent
      .post(BASE_URL + 'createProject')
      .send(data)
      .set('uid', uid)
      .set('token', token)
      .end((err, res) => {
        //   console.log('end err is ', err.response.body)
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

// 批量创建dicom项目
export const createDCMProject = (name, taskType, rules, imageType, taskId, dcmAddressList) => {
  const { uid, token } = getUidToken()

  return new Promise((resolve, reject) => {
    superagent
      .post(BASE_URL + 'createDCMProjectByAddressList')
      .send({
        name: name,
        taskType: taskType,
        rules: rules,
        imageType: imageType,
        taskId: taskId,
        dcmAddressList: dcmAddressList,
      })
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

// 批量创建patho项目
export const createPathoProject = (
  name,
  taskType,
  rules,
  imageType,
  taskId,
  mrxsPaths,
  tileSize = 2048,
  overlap = 0
) => {
  const { uid, token } = getUidToken()

  return new Promise((resolve, reject) => {
    superagent
      .post(PYTHON_SERVER_HTTP + 'batchCreateDeepZoomForPatho')
      .send({
        name: name,
        taskType: taskType,
        rules: rules,
        imageType: imageType,
        taskId: taskId,
        mrxsPaths: mrxsPaths,
        tileSize: tileSize,
        overlap: overlap,
      })
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

// 编辑项目基本信息
export const editProject = (pid, data) => {
  const { uid, token } = getUidToken()

  return new Promise((resolve, reject) => {
    superagent
      .post(BASE_URL + pid + '/updateProject')
      .send(data)
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

export const uploadFileDT = (file, pid, progressCallback, type) => {
  const { uid, token } = getUidToken()
  console.log(BASE_URL + pid + '/upload')
  const data = new FormData()
  data.append('file', file)
  data.append('filename', file.name)
  return new Promise(resolve => {
    if (type) {
      superagent
        .post(BASE_URL + pid + '/upload')
        .set('itemStatus', 'preTagged')
        .set('format', type)
        .set('uid', uid)
        .set('token', token)
        .set('uploadFormat', type)
        .attach('file', file)
        .on('progress', function (event) {
          if (progressCallback) progressCallback(event)
        })
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
    } else {
      superagent
        .post(BASE_URL + pid + '/upload')
        .set('uid', uid)
        .set('token', token)
        // .set('Content-Type', 'multipart/form-data')
        .attach('file', file)
        .on('progress', function (event) {
          if (progressCallback) progressCallback(event)
        })
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
    }
  })
}

export const deleteProjectDt = pid => {
  const { uid, token } = getUidToken()

  return new Promise(resolve => {
    superagent
      .post(BASE_URL + pid + '/deleteProject')
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

export const fetchProjectDetail = pid => {
  const { uid, token } = getUidToken()
  console.log(pid)
  return new Promise(resolve => {
    superagent
      .post(BASE_URL + 'getProjectDetails/' + pid)
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

export const fetchProjectModels = pid => {
  const { uid, token } = getUidToken()
  return new Promise(resolve => {
    superagent
      .post(BASE_URL + pid + '/getProjectModels')
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

export const fetchProjectHits = (pid, queryData) => {
  const { uid, token } = getUidToken()
  const url = `${BASE_URL}getHits/${pid}?${qs.stringify(queryData)}`
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
        else {
          let _resData = { ...res.body }
          let hits = res.body.hits.map(ele => {
            // 是上传到服务器上的图片，非网络图片，加上地址前缀
            if (ele.data.indexOf('/uploads') !== -1) {
              ele = {
                ...ele,
                data: imgUploadPre + ele.data,
              }
            }
            // 添加一个缩略图字段
            ele.thumbnailImg = ele.data
            ele.dataIsThumbnailImg = false

            // 序列化标记的result
            if (ele.hitResults) {
              ele.hitResults.forEach(hitResult => {
                try {
                  hitResult.result = JSON.parse(hitResult.result)
                  hitResult.predLabel = JSON.parse(hitResult.predLabel)
                } catch (err) {}
              })
            } else ele.hitResults = []

            return ele
          })
          _resData.hits = hits
          resolve({
            err: false,
            data: _resData,
          })
        }
      })
  })
}

export const fetchPathoProjectHits = (currentProjectPid, queryData) => {
  const { uid, token } = getUidToken()
  const url = `${BASE_URL}getPathoHits/${currentProjectPid}?${qs.stringify(queryData)}`
  console.log(url)
  return new Promise(resolve => {
    superagent
      .post(url)
      .set('uid', uid)
      .set('token', token)
      .end((err, res) => {
        if (err) {
          console.log(err.response.body.message)
          resolve({
            err: true,
            data: err.response.body.message,
          })
        } else {
          let _resData = { ...res.body }
          console.log(res.body)
          let hits = res.body.hits.map(ele => {
            // 是上传到服务器上的图片，非网络图片，加上地址前缀
            if (ele.data.indexOf('/uploads') !== -1) {
              ele = {
                ...ele,
                data: imgUploadPre + ele.data,
              }
            }
            // 序列化标记的result
            if (ele.hitResults) {
              ele.hitResults.forEach(hitResult => {
                try {
                  hitResult.result = JSON.parse(hitResult.result)
                  hitResult.predLabel = JSON.parse(hitResult.predLabel)
                } catch (err) {}
              })
            } else ele.hitResults = []
            return ele
          })
          _resData.hits = hits
          resolve({
            err: false,
            data: _resData,
          })
        }
      })
  })
}

export const updateHitStatus = payload => {
  const { uid, token } = getUidToken()
  const { hitResId, hitId, pid, status, result, predLabel, model } = payload
  return new Promise(resolve => {
    superagent
      .post(BASE_URL + pid + '/addHitResult?hitId=' + hitId)
      .send({ hitResId, status, result, predLabel, model })
      .set('uid', uid)
      .set('token', token)
      .end((err, res) => {
        if (err)
          resolve({
            err: true,
            data: err.response?.body?.message,
          })
        else
          resolve({
            err: false,
            data: res.body,
          })
      })
  })
}

export const getModelInfer = payload => {
  const { uid, token } = getUidToken()
  const { hitId, modelList, taskType } = payload
  return new Promise(resolve => {
    superagent
      .post(BASE_URL + 'getInferResult')
      .send({ hitId, modelList, taskType })
      .set('uid', uid)
      .set('token', token)
      .end((err, res) => {
        if (err)
          resolve({
            err: true,
            data: err.response?.body?.message,
          })
        else
          resolve({
            err: false,
            data: res.body,
          })
      })
  })
}

// 获取公开数据集
export const getPublicDatasets = queryData => {
  const { uid, token } = getUidToken()
  const url = `${BASE_URL}getPublicProject/?${qs.stringify(queryData)}`
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
