import React, { useEffect, useState } from 'react'
import { Navbar, FixedFooter } from '@/components/index'
import { useHistory } from 'react-router-dom'
import styles from './index.module.scss'
import Login from './Login'
import SignUp from './SignUp'
import { useDispatch, useSelector } from 'react-redux'

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
        <div className={styles.leftText}>
          <span>极致简易的数据标注</span>
          <span>邀请您的团队，在短短几分钟内就可生成高质量的标注数据</span>
          <span>注册即代表您统一我们的隐私政策协议</span>
        </div>
        <div className={styles.rightPanel}>
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
