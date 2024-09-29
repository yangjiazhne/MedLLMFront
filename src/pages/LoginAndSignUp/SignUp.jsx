import React, { useState } from 'react'
import { Form, Input, Button, message, Modal } from 'antd'
import styles from './index.module.scss'
import { userRegister } from '@/request/actions/user'
import { useTranslation } from 'react-i18next';

const SignUp = ({ goToLogin }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { t, i18n } = useTranslation();
  // 用户注册
  const onFinish = async values => {
    setLoading(true)
    const { username, email, password, phone, profilelink } = values
    const res = await userRegister(username, email, password, phone, profilelink)

    setLoading(false)
    if (!res.err) Modal.success({
      title: t('Signup.registerSuccess'), 
      content: res.data.msg,
      onOk: () => {goToLogin()}
     })
    else message.error(res.data)
  }
  return (
    <>
      <div className={styles.title} style={{letterSpacing: i18n.language === 'en' ? '5px' : '20px'}}>&nbsp;{t('Signup.title')}</div>
      <Form onFinish={onFinish} form={form} style={{width: '100%'}} className={styles.customForm}>
        <div className={styles.formInputItem}>
          <span>{t('Signup.username')}</span>
          <Form.Item
            name="username"
            className={styles.antFormItem}
            rules={[
              {
                required: true,
                message: t('Signup.usernameRequired'),
              },
            ]}
          >
            <Input placeholder={t('Signup.usernameRequired')}/>
          </Form.Item>
        </div>
        <div className={styles.formInputItem}>
          <span>{t('Signup.email')}</span>
          <Form.Item
            name="email"
            className={styles.antFormItem}
            rules={[
              {
                type: 'email',
                message: t('Signup.emailInvalid'),
              },
              {
                required: true,
                message: t('Signup.emailRequired'),
              },
            ]}
          >
            <Input placeholder="me@Email.com"/>
          </Form.Item>
        </div>
        <div className={styles.formInputItem}>
          <span>{t('Signup.password')}</span>
          <Form.Item
            name="password"
            className={styles.antFormItem}
            rules={[
              {
                required: true,
                message: t('Signup.passwordRequired'),
              },
            ]}
          >
            <Input type="password" placeholder={t('Signup.passwordRequired')}/>
          </Form.Item>
        </div>
        <div className={styles.formInputItem}>
          <span>{t('Signup.phone')}</span>
          <Form.Item
            name="phone"
            className={styles.antFormItem}
          >
            <Input placeholder={t('Signup.phonePlaceholder')}/>
          </Form.Item>
        </div>
        <div className={styles.formInputItem}>
          <span>{t('Signup.profileLink')}</span>
          <Form.Item
            name="profilelink"
            className={styles.antFormItem}
          >
            <Input placeholder={t('Signup.profileLinkPlaceholder')}/>
          </Form.Item>
        </div>
        <div className={styles.formBtnItem}>
          <Button onClick={goToLogin} className={"success-btn " + styles.subBtn}>
            {t('Signup.goToLogin')}
          </Button>
          <Button loading={loading} type="primary" htmlType="submit" style={{width:'100%'}}>
            {t('Signup.signupButton')}
          </Button>
        </div>
      </Form>
    </>
  )
}


export default SignUp
