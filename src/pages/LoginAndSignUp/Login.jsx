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
      <div className={styles.title}>登录</div>
      <Form onFinish={onFinish} form={form}>
        <div className={styles.inlineForm}>
          <div style={{ marginRight: '10px', width: '50%' }}>
            <span>邮箱号</span>
            <Form.Item
              name="email"
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
              <Input placeholder="me@Email.com" />
            </Form.Item>
          </div>
          <div style={{ marginRight: '10px', width: '50%' }}>
            <span>密码</span>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: '请输入你的密码!',
                },
              ]}
            >
              <Input.Password placeholder="请输入您的密码" />
            </Form.Item>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Button loading={loading} type="primary" htmlType="submit">
            登录
          </Button>
        </div>
      </Form>
      <div>
        <span style={{ marginRight: '10px' }}>还没有账号?</span>
        <Button onClick={goToSignUp} size="small" className="success-btn">
          去注册
        </Button>
      </div>
    </>
  )
}

export default Login
