import React, { useState } from 'react'
import { Form, Input, Button, message, Modal } from 'antd'
import styles from './index.module.scss'
import { userLogin } from '@/request/actions/user'
import { isEmail } from '@/helpers/Utils'
import useQuery from '@/hooks/useQuery'
import { useTranslation } from 'react-i18next';

const Login = ({ goToSignUp, handleSave }) => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const { t, i18n } = useTranslation();
  const onFinish = async values => {
    setLoading(true)
    const { email, password } = values
    let res = await userLogin(email, password)
    
    setLoading(false)
    if (!res.err) handleSave(res.data)
    else message.error(res.data || '服务器错误')
  }

  return (
    <>
      <div className={styles.title} style={{letterSpacing: i18n.language === 'en' ? '5px' : '20px'}}>&nbsp;{t('Login.title')}</div>
      <Form onFinish={onFinish} form={form} style={{width: '100%'}} className={styles.customForm}>
        <div className={styles.formInputItem}>
          <span>{t('Login.email')}</span>
          <Form.Item
            name="email"
            className={styles.antFormItem}
            rules={[
              {
                type: 'email',
                message: t('Login.emailInvalid'),
              },
              {
                required: true,
                message: t('Login.emailRequired'),
              },
            ]}
          >
            <Input placeholder="me@Email.com"/>
          </Form.Item>
        </div>
        <div className={styles.formInputItem}>
          <span>{t('Login.password')}</span>
          <Form.Item
            name="password"
            className={styles.antFormItem}
            rules={[
              {
                required: true,
                message: t('Login.passwordRequired'),
              },
            ]}
          >
            <Input type='password' placeholder={t('Login.passwordRequired')}/>
          </Form.Item>
        </div>
        <div className={styles.formBlankItem}></div>
        <div className={styles.formBtnItem}>
          <Button loading={loading} type="primary" htmlType="submit" style={{width:'100%'}}>
            {t('Login.loginButton')}
          </Button>
          <Button onClick={goToSignUp} size="small" className={"success-btn " + styles.subBtn}>
            {t('Login.goToSignUp')}
          </Button>
        </div>
      </Form>
    </>
  )
}

export default Login
