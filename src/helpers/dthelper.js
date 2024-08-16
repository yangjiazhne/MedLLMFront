import { DUMMY_UID, DUMMY_TOKEN } from './Utils'

export const clearSessionStorage = () => {
  window.sessionStorage.removeItem('token')
}

export const getToken = () => {
  let token = window.sessionStorage.getItem('token')
  if ( !token  || token === null) {
    token = DUMMY_TOKEN
  }
  return token
}

