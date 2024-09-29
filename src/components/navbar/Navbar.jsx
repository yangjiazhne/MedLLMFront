import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import styles from './index.module.scss'
import { Dropdown, Input, Menu, Modal, Tooltip } from 'antd'
import { logOut } from '@/helpers/Utils'
import { ArrowLeftOutlined, DownOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next';
import Icon from '@/assets/icon.jpg'

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

  // 从 localStorage 加载保存的语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'zh'; // 默认语言为中文
    setLanguage(savedLanguage);
    i18n.changeLanguage(savedLanguage);
  }, [i18n]);

  // 每当语言变化时，更新 localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
    i18n.changeLanguage(language);
  }, [language, i18n]);

  useEffect(() => {
    const token = window.sessionStorage.getItem('token')
    // 已登录状态
    if (token) {
      dispatch({
        type: 'UPDATE_USER_LOGIN',
        payload: true,
      })
    }
  }, [])


  const logout = () => {
    Modal.confirm({
      title: t('Logout.title'),
      content: t('Logout.content'),
      okText: t('Logout.okText'),
      cancelText: t('Logout.cancelText'),
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
          <img src={Icon}/>
          <span className={styles.navbarTitle}>{t("Navbar.title")}</span>
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
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item onClick={() => setLanguage('zh')}>中文</Menu.Item>
                <Menu.Item onClick={() => setLanguage('en')}>English</Menu.Item>
              </Menu>
            }
          >
            <span >
              {t("Navbar.language")}
              <DownOutlined style={{ marginLeft: '5px' }}/>
            </span>
          </Dropdown>
        </div>
        <div className={styles.navbarMenuItem}>
          {isLogin && (<div onClick={logout}>{t("Navbar.logout")}</div>)}
        </div>
      </div>
    </div>
  )
}

export default Navbar
