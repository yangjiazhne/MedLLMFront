import superagent from 'superagent'
import qs from 'qs'
import { BASE_URL, imgUploadPre, PYTHON_SERVER_HTTP } from '@/constants'
import { getToken } from '@/helpers/dthelper'

//查询数据集
export const searchSession = (sessionId, imageId) => {
    const token = getToken()
  
    return new Promise((resolve, reject) => {
      superagent
        .post(BASE_URL + '/session/search')
        .query({sessionId, imageId})
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