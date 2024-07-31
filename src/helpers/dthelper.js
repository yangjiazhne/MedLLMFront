import { PYTHON_SERVER_WS } from '@/constants'
import { DUMMY_UID, DUMMY_TOKEN } from './Utils'

export const clearSessionStorage = () => {
  window.sessionStorage.removeItem('uid')
  window.sessionStorage.removeItem('token')
}

export const getUidToken = () => {
  let token = window.sessionStorage.getItem('token')
  let uid = window.sessionStorage.getItem('uid')
  if (!uid || !token || uid === null || token === null) {
    uid = DUMMY_UID
    token = DUMMY_TOKEN
  }
  return { uid, token }
}

export const connectWS = ()=>{
  var ws = new WebSocket(`${PYTHON_SERVER_WS}auto_label_test`)
    ws.onopen = () => {
      console.log('websocket连接成功')
    }
    ws.onerror = () => {
      console.log('连接失败')
    }
    ws.onclose = () => {
      console.log('websocket已关闭')
    }
    ws.onmessage = event => {
      console.log(event.data)
      ws.close()
    }
    return ws
}
