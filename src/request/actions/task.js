/*
 * @Author: Azhou
 * @Date: 2021-11-12 16:39:08
 * @LastEditors: Azhou
 * @LastEditTime: 2022-03-01 16:52:31
 */
import superagent from 'superagent'
import { BASE_URL, PYTHON_SERVER_HTTP } from '@/constants'
import { getUidToken } from '@/helpers/dthelper'

// 获取模型列表
export const getModelList = () => {
  const { uid, token } = getUidToken()
  return new Promise((resolve, reject) => {
    superagent
      .get(PYTHON_SERVER_HTTP + 'getModelList')
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

// 发起分割任务
export const createPredictAllTask = data => {
  console.log(data)
  return new Promise((resolve, reject) => {
    superagent
      .post(PYTHON_SERVER_HTTP + 'predict_all')
      .send(data)
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

// 发起分割任务
export const postSegmentTask = data => {
  console.log(data)
  return new Promise((resolve, reject) => {
    superagent
      .post(PYTHON_SERVER_HTTP + 'predict_all')
      .send(data)
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

// 发起分类任务
export const postClassifyTask = data => {
  return new Promise((resolve, reject) => {
    superagent
      .post(PYTHON_SERVER_HTTP + 'predict_all')
      .send(data)
      .end((err, res) => {
        console.log(err, res)
        if (err)
          resolve({
            err: true,
            data: err ? err.response.body.message : res.body.info,
          })
        else
          resolve({
            err: false,
            data: res.body,
          })
      })
  })
}

// 发起检测任务
export const postYoloTask = data => {
  return new Promise((resolve, reject) => {
    superagent
      .post(PYTHON_SERVER_HTTP + 'predict_all')
      .send(data)
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

// 获取用户任务列表
export const getTaskList = () => {
  const { uid, token } = getUidToken()
  return new Promise((resolve, reject) => {
    superagent
      .get(PYTHON_SERVER_HTTP + 'getTaskStatus')
      .set('uid', uid)
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

// 获取用户数据集创建任务列表
export const getDatasetCreateTaskList = type => {
  const { uid, token } = getUidToken()
  return new Promise((resolve, reject) => {
    superagent
      .post(`${BASE_URL}getAllTasks`)
      .set('uid', uid)
      .set('token', token)
      .send({ type: type })
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

// 获取dicom数据集任务详情
export const getDicomTaskDetails = taskId => {
  const { uid, token } = getUidToken()
  return new Promise((resolve, reject) => {
    superagent
      .post(`${BASE_URL}getDicomProgress`)
      .set('uid', uid)
      .set('token', token)
      .send({ taskId: taskId })
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

// 获取mrxs数据集任务详情
export const getPathoTaskDetails = taskId => {
  const { uid, token } = getUidToken()
  return new Promise((resolve, reject) => {
    superagent
      .post(PYTHON_SERVER_HTTP + 'getMrxsProgress')
      .set('uid', uid)
      .set('token', token)
      .send({ taskId: taskId })
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

// 构造创建数据集任务
export const createDatasetTask = (type, totalProjects, name) => {
  const { uid, token } = getUidToken()
  return new Promise((resolve, reject) => {
    superagent
      .post(`${BASE_URL}createNewProjectTask`)
      .set('uid', uid)
      .set('token', token)
      .send({
        type: type,
        totalProjects: totalProjects,
        name: name,
      })
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

// 重新创建dicom数据集任务
export const reCreateDicomDataset = (projectId, taskId, dcmAddress) => {
  const { uid, token } = getUidToken()
  return new Promise((resolve, reject) => {
    superagent
      .post(`${BASE_URL}recreateProject`)
      .set('uid', uid)
      .set('token', token)
      .send({
        projectId: projectId,
        taskId: taskId,
        dcmAddress: dcmAddress,
      })
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

// 重新创建mrxs数据集任务
export const reCreatePathoDataset = (projectId, taskId, mrxsPath) => {
  const { uid, token } = getUidToken()
  return new Promise((resolve, reject) => {
    superagent
      .post(PYTHON_SERVER_HTTP + 'restartTask')
      .set('uid', uid)
      .set('token', token)
      .send({
        projectId: projectId,
        taskId: taskId,
        mrxsPath: mrxsPath,
      })
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
