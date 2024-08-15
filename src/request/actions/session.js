import superagent from 'superagent'
import qs from 'qs'
import { BASE_URL, imgUploadPre, PYTHON_SERVER_HTTP } from '@/constants'
import { getToken } from '@/helpers/dthelper'

//查询会话
export const searchSession = (imageId, sessionId) => {
    const token = getToken()
  
    return new Promise((resolve, reject) => {
      superagent
        .get(BASE_URL + '/session/search')
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
              data: res.body.data,
            })
        })
    })
  }