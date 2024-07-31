import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { changePassword, getHomeData } from '@/request/actions/user'
import { useDispatch, useSelector } from 'react-redux'
import styles from './index.module.scss'
import { Dropdown, Input, Menu, Modal, Tooltip } from 'antd'
import { logOut } from '@/helpers/Utils'
import { ArrowLeftOutlined, DownOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [showError, setShowError] = useState(false)
  const [password, setPassword] = useState('')
  const [language, setLanguage] = useState('zh')

  // @ts-ignore
  const { isLogin, user } = useSelector(state => state.user)

  const { t, i18n } = useTranslation();

  useEffect(( ) => {
    i18n.changeLanguage(language);
  }, [language])

  useEffect(() => {
    // 获取用户信息并存储到redux
    if (isLogin) fetchData()
  }, [isLogin])

  useEffect(() => {
    const uid = window.sessionStorage.getItem('uid')
    const token = window.sessionStorage.getItem('token')
    // 已登录状态
    if (uid && token) {
      dispatch({
        type: 'UPDATE_USER_LOGIN',
        payload: true,
      })
    }
  }, [])

  
  const fetchData = async () => {
    // 获取用户信息和用户的所有数据集
    const res = await getHomeData()
    if (!res.err) {
      const { userDetails, projects, orgName } = res.data
      dispatch({
        type: 'UPDATE_USER_DETAIL',
        payload: {
          ...userDetails,
          orgName,
        },
      })
      // const _projects = projects.map(v => v.projectDetails)
      // dispatch({
      //   type: 'UPDATE_USER_PROJECTS',
      //   payload: _projects,
      // })
    } else {
      Modal.error({
        title: '提示',
        content: '您的登录已过期，请重新登陆',
        onOk: () => logOut(history),
      })
    }
  }

  const logout = () => {
    Modal.confirm({
      title: '提示',
      content: '确定要退出登录吗',
      onOk: () => logOut(history),
    })
  }

  const onChangePwd = async () => {
    if (password.length < 7) {
      setShowError(true)
      return
    }
    setShowError(false)
    const res = await changePassword(user.email, password)
    if (!res.err) {
      setIsModalVisible(false)
      Modal.success({
        content: 'password change success, you need login again with your new password',
        onOk: () => logOut(history),
      })
    }
  }

  const goToIntroduction = () => {
    window.open(`${window.location.protocol}//${window.location.host}/Introduction.pdf`, '_blank')
  }

  return (
    <div className={styles.navbarWrap}>
      <div className={styles.navbar}>
        {/*<ArrowLeftOutlined className={styles.backIcon} onClick={history.goBack} />*/}
        <div className={styles.navbarTitleWrap}>
          <span className={styles.navbarTitle}>{t("title")}</span>
          <Tooltip title="点击查看使用说明" className={styles.navbarIcon}>
            <QuestionCircleOutlined style={{ color: 'rgb(5 12 241)' }} onClick={goToIntroduction} />
          </Tooltip>
        </div>
      </div>
      <div className={styles.navbarMenu}>
        {/*<div className={styles.navbarMenuItem} visible={false}>*/}
        {/*  <Dropdown*/}
        {/*    visible={false}*/}
        {/*    overlay={*/}
        {/*      <Menu>*/}
        {/*        <Menu.Item onClick={() => setLanguage('zh')}>中文</Menu.Item>*/}
        {/*        <Menu.Item onClick={() => setLanguage('en')}>English</Menu.Item>*/}
        {/*      </Menu>*/}
        {/*    }*/}
        {/*  >*/}
        {/*    <span >*/}
        {/*      {t('language')}*/}
        {/*      <DownOutlined style={{ marginLeft: '5px' }} />*/}
        {/*    </span>*/}
        {/*  </Dropdown>*/}
        {/*</div>*/}
        <div className={styles.navbarMenuItem}>
          {user?.uid && (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item onClick={() => setIsModalVisible(true)}>{t('change password')}</Menu.Item>
                  <Menu.Item onClick={logout}>{t('logout')}</Menu.Item>
                </Menu>
              }
            >
              <span>
                {t('greeting') + `, ${user?.firstName}`}
                <DownOutlined style={{ marginLeft: '5px' }} />
              </span>
            </Dropdown>
          )}
        </div>
      </div>
      
        
      <Modal
        title="Reset Password"
        destroyOnClose
        visible={isModalVisible}
        onOk={onChangePwd}
        onCancel={() => setIsModalVisible(false)}
      >
        {showError && <p style={{ color: 'red' }}>Password should be at least 7 letters long</p>}

        <Input
          placeholder="please input new password"
          type="password"
          onChange={e => setPassword(e.target.value)}
          value={password}
        />
      </Modal>
    </div>
  )
}

export default Navbar
