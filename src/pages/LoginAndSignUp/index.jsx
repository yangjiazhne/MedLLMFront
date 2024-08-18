import React, { useEffect, useState } from 'react'
import { Navbar, FixedFooter } from '@/components/index'
import { useHistory } from 'react-router-dom'
import styles from './index.module.scss'
import Login from './Login'
import SignUp from './SignUp'
import { useDispatch, useSelector } from 'react-redux'
import LoginBG from '@/assets/login_bg.jpg'

const LoginAndSignUp = () => {
  const [panelType, setPanelType] = useState('login')
  const history = useHistory()
  const dispatch = useDispatch()

  // @ts-ignore
  const { isLogin } = useSelector(state => state.user)

  // 登录/注册成功后的回调函数
  const handleSave = res => {
    const token = res.data
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
        
          {panelType === 'login' && (
            <div className={styles.loginModuleWrap} style={{marginBottom: '50px'}}> 
              <Login goToSignUp={() => setPanelType('signUp')} handleSave={handleSave} />
            </div>
          )}
          {panelType === 'signUp' && (
            <div className={styles.loginModuleWrap}>
              <SignUp goToLogin={() => setPanelType('login')} />
            </div>
          )}

      </div>
      <FixedFooter />
    </>
  )
}

export default LoginAndSignUp
