import React, { useState } from 'react'
import { Form, Input, Button, message, Modal } from 'antd'
import styles from './index.module.scss'
import { dtLogin, resetPassword } from '@/request/actions/user'
import { isEmail } from '@/helpers/Utils'
import useQuery from '@/hooks/useQuery'

const Login = ({ goToSignUp, handleSave }) => {
  const { type } = useQuery()
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [form] = Form.useForm()

  const onFinish = async values => {
    setLoading(true)
    const { email, password } = values
    let res = await dtLogin(email, password, type)

    setLoading(false)
    if (!res.err) handleSave(res.data)
    else message.error(res.data || '服务器错误')
  }

  const handleReset = async () => {
    if (!isEmail(resetEmail)) {
      message.error('邮箱错误!')
      return
    }
    const res = await resetPassword(resetEmail)
    if (!res.err) Modal.success({ content: res.data.msg })
    else message.error(res.data)
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
      <Button type="link" style={{ margin: '20px 0' }} onClick={() => setIsModalVisible(true)}>
        忘记密码?
      </Button>
      <div>
        <span style={{ marginRight: '10px' }}>还没有账号?</span>
        <Button onClick={goToSignUp} size="small" className="success-btn">
          去注册
        </Button>
      </div>
      <Modal
        title="重置密码"
        destroyOnClose
        visible={isModalVisible}
        onOk={handleReset}
        onCancel={() => setIsModalVisible(false)}
      >
        <p>请输入您的邮箱，我们会将相关信息发送到您的账户:</p>
        <Input
          placeholder="me@Email.com"
          onChange={e => setResetEmail(e.target.value)}
          value={resetEmail}
        />
      </Modal>
    </>
  )
}

export default Login
