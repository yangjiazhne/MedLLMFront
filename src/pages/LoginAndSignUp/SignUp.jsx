import React, { useState } from 'react'
import { Form, Input, Button, message, Modal } from 'antd'
import styles from './index.module.scss'
import { userRegister } from '@/request/actions/user'

const SignUp = ({ goToLogin }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // 用户注册
  const onFinish = async values => {
    setLoading(true)
    const { firstName, lastName, email, password } = values
    const res = await userRegister(firstName+lastName, email, password)

    setLoading(false)
    if (!res.err) Modal.success({
      title: '注册成功', 
      content: res.data.msg,
      onOk: () => {goToLogin()}
     })
    else message.error(res.data)
  }
  return (
    <Form onFinish={onFinish} form={form}>
      <div className={styles.inlineForm}>
        <div style={{ marginRight: '10px', width: '50%' }}>
          <span>名</span>
          <Form.Item
            name="firstName"
            rules={[
              {
                required: true,
                message: '请输入你的名!',
              },
              {
                min: 2,
                message: '至少输入两个英文字符',
              },
            ]}
          >
            <Input placeholder="名" />
          </Form.Item>
        </div>
        <div style={{ marginRight: '10px', width: '50%' }}>
          <span>姓</span>
          <Form.Item
            name="lastName"
            rules={[
              {
                required: true,
                message: '请输入你的姓!',
              },
              {
                min: 2,
                message: '至少输入两个英文字符',
              },
            ]}
          >
            <Input placeholder="姓" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.blockForm}>
        <span>邮箱地址</span>
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
      <div className={styles.blockForm}>
        <span>密码</span>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: '请输入你的密码!',
            },
            {
              min: 7,
              message: '至少输入7位',
            },
          ]}
        >
          <Input.Password placeholder="请输入密码" />
        </Form.Item>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Button loading={loading} type="primary" htmlType="submit">
          注册
        </Button>
        <Button type="link" onClick={goToLogin}>
          返回登录
        </Button>
      </div>
    </Form>
  )
}

export default SignUp
