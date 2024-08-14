import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
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


  const logout = () => {
    Modal.confirm({
      title: '提示',
      content: '确定要退出登录吗',
      onOk: () => logOut(history),
    })
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
                  {/* <Menu.Item onClick={() => setIsModalVisible(true)}>{t('change password')}</Menu.Item> */}
                  <Menu.Item onClick={logout}>{t('logout')}</Menu.Item>
                </Menu>
              }
            >
              <span>
                {/* {t('greeting') + `, ${user?.firstName}`} */}
                <DownOutlined style={{ marginLeft: '5px' }} />
              </span>
            </Dropdown>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar
