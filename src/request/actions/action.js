import superagent from 'superagent'
import qs from 'qs'
import { BASE_URL, imgUploadPre, PYTHON_SERVER_HTTP } from '@/constants'
import { getToken } from '@/helpers/dthelper'

//查询数据集
export const chatAction = (text, image, x, y, width, height) => {
    const token = getToken()
  
    return new Promise((resolve, reject) => {
      superagent
        .post(BASE_URL + '/chat')
        .query({text, image, x, y, width, height})
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