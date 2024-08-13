/*
 * @Author: Azhou
 * @Date: 2021-11-12 16:39:08
 * @LastEditors: Azhou
 * @LastEditTime: 2022-03-01 16:56:02
 */
import React, { useEffect, useState } from 'react'
import { Navbar, FixedFooter } from '@/components/index'
import { useHistory } from 'react-router-dom'
import styles from './index.module.scss'
import Login from './Login'
import SignUp from './SignUp'
import { useDispatch, useSelector } from 'react-redux'
import LoginBG from 'src/assets/login_bg.jpg'
import './index.scss'

const LoginAndSignUp = () => {
  const [panelType, setPanelType] = useState('login')
  const history = useHistory()
  const dispatch = useDispatch()

  // @ts-ignore
  const { isLogin } = useSelector(state => state.user)

  // 登录/注册成功后的回调函数
  const handleSave = res => {
    const { id, token } = res
    window.sessionStorage.setItem('uid', id)
    window.sessionStorage.setItem('token', token)
    dispatch({
      type: 'UPDATE_USER_LOGIN',
      payload: true,
    })
  }

  useEffect(() => {
    if (isLogin) history.push('/userHome/my-projects')
  }, [isLogin])

  return (
    <>
      <Navbar />
      <div className={styles.loginWrap}>
        <div className={styles.loginBg} style={{background: `transparent url(${LoginBG}) center center no-repeat`}}></div>
        <div className={styles.loginModuleWrap}>
          {panelType === 'login' && (
            <Login goToSignUp={() => setPanelType('signUp')} handleSave={handleSave} />
          )}
          {panelType === 'signUp' && <SignUp goToLogin={() => setPanelType('login')} />}
        </div>
      </div>
      <FixedFooter />
    </>
  )
}

export default LoginAndSignUp
