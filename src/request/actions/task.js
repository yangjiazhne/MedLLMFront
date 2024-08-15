import superagent from 'superagent'
import qs from 'qs'
import { BASE_URL, imgUploadPre, PYTHON_SERVER_HTTP } from '@/constants'
import { getToken } from '@/helpers/dthelper'

//查询大模型任务类型
export const searchLLMTaskType = (llmTaskTypeId, isPreProcessTask, llmTaskTypeName, description) => {
    const token = getToken()
  
    return new Promise((resolve, reject) => {
      superagent
        .get(BASE_URL + '/task/searchLLMTaskType')
        .query({llmTaskTypeId, isPreProcessTask, llmTaskTypeName, description})
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

// 大模型问答
export const liveQA = (data) => {
    const token = getToken()
  
    return new Promise((resolve, reject) => {
      superagent
        .post(BASE_URL + '/task/liveQA')
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
              data: res.body.data,
            })
        })
    })
  }