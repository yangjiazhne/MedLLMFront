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
      <div className={styles.title}>&nbsp;登录</div>
      <Form onFinish={onFinish} form={form} style={{width: '100%'}}>
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
          <Button type="text" style={{margin: '20px 0', color: '#fff'}} onClick={() => setIsModalVisible(true)}>
            忘记密码?
          </Button>
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
