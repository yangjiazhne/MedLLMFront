import React, { useState } from 'react'
import { Form, Input, Button, message, Modal } from 'antd'
import styles from './index.module.scss'
import { userLogin } from '@/request/actions/user'
import { isEmail } from '@/helpers/Utils'
import useQuery from '@/hooks/useQuery'

const Login = ({ goToSignUp, handleSave }) => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

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
      <div className={styles.title}>&nbsp;登录</div>
      <Form onFinish={onFinish} form={form} style={{width: '100%'}} className={styles.customForm}>
        <div className={styles.formInputItem}>
          <span>邮箱</span>
          <Form.Item
            name="email"
            className={styles.antFormItem}
            rules={[
              {
                type: 'email',
                message: '请输入合法的邮箱地址!',
              },
              {
                required: true,
                message: '请输入你的邮箱地址!',
              },
            ]}
          >
            <Input placeholder="me@Email.com"/>
          </Form.Item>
        </div>
        <div className={styles.formInputItem}>
          <span>密码</span>
          <Form.Item
            name="password"
            className={styles.antFormItem}
            rules={[
              {
                required: true,
                message: '请输入你的密码!',
              },
            ]}
          >
            <Input type='password' placeholder="请输入您的密码"/>
          </Form.Item>
        </div>
        <div className={styles.formBlankItem}></div>
        <div className={styles.formBtnItem}>
          <Button loading={loading} type="primary" htmlType="submit" style={{width:'100%'}}>
            登录
          </Button>
          <Button onClick={goToSignUp} size="small" className={"success-btn " + styles.subBtn}>
            去注册
          </Button>
        </div>
      </Form>
    </>
  )
}

export default Login
