import { DeleteOutlined, FileZipOutlined, UploadOutlined } from '@ant-design/icons'
import { createImage } from '@/request/actions/image'
import { Form, Select, Button, message, Progress, Tabs, Upload, Spin, Modal } from 'antd'
import bytes from 'bytes'
import React, { useState, useEffect } from 'react'
import styles from './index.module.scss'
import { useHistory } from 'react-router'
import { useParams } from 'react-router-dom'
const { TabPane } = Tabs
const { Dragger } = Upload
import { searchGroup} from '@/request/actions/group'
import { logOut } from '@/helpers/Utils'
import { useTranslation } from 'react-i18next'

const UploadMrxsFile = ({ handleUploadDone }) => {
  const [form] = Form.useForm()
  const [txtFile, setTxtFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProcess, setUploadProcess] = useState(0)
  const [tabValue, setTabValue] = useState('txt')
  const [errorMsg, setErrorMsg] = useState()
  const history = useHistory()
  const [options, setOptions] = useState([])
  //@ts-ignore
  let {projectId} = useParams()
  const { t, i18n } = useTranslation()
  // 获取项目所有的组
  const fetchGroup = async() => {
    const projectGroupsRes= await searchGroup(projectId)

    if(projectGroupsRes.err){
      Modal.error({
        title: t('LoginExpired.title'),
        content: t('LoginExpired.content'),
        onOk: () => logOut(history),
      })
    }
  
    const groups = projectGroupsRes.data.content 

    const value = groups.map(group => ({
      value: group.imageGroupId,
      label: group.imageGroupName
    }));

    setOptions(value)
  }

  useEffect(() => {
    fetchGroup()
  }, [])

  const beforeUpload = file => {
    if (tabValue === 'txt') {
        setTxtFile(file)
    } 
    return false
  }

  const readFile = async file => {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result)
      }

      reader.onerror = () => {
        reject(reader.error)
      }

      reader.readAsText(file)
    })
  }

  const handleSubmit = async values => {
    const { group } = values
    
    // 上传txt文件
    if (tabValue === 'txt') {
        if (!txtFile) {
          message.error('Please choose a txt file')
          return
        }
        setUploading(true)
        const content = await readFile(txtFile)
        const lines = content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line !== '')
        const total = lines.length
        if (total < 1) {
          Modal.error({
            content: t('ProjectDetail.uploadData.success'),
          })
          setUploading(false)
          return 0
        }
        const res = await createImage({
          imageGroupId: group,
          imageTypeId: 1,
          imageUrls: lines
        })
        setUploading(false)
        if (res.err) setErrorMsg(res.data)
        else {
          Modal.success({
            content: t('ProjectDetail.uploadData.failed'),
            onOk: () => {
              history.push('/userHome/projects/' + projectId.toString())
            },
          })
        }
    }
  }

  return (
    <div style={{ textAlign: 'center', width: '80%', margin: 'auto' }}>
      <h3 style={{ margin: '20px 0' }}> {t('ProjectDetail.uploadData.title')} </h3>
      <Tabs
        defaultActiveKey="images"
        onChange={key => {
          setTabValue(key)
          setUploadProcess(0)
        }}
      >
        <TabPane  tab={t('ProjectDetail.uploadData.tab')} key="txt" disabled={uploading}>
          <div style={{ margin: '20px auto', width: '500px', textAlign: 'left' }}>
              <Form
                form={form}
                layout="vertical"
                style={{ textAlign: 'left' }}
                initialValues={{ imageType: 'normal' }}
                onFinish={handleSubmit}
              >
                <Form.Item
                  label={t('ProjectDetail.uploadData.name')}
                  name="group"
                  rules={[
                    {
                      required: true,
                      message: t('ProjectDetail.uploadData.nameRequired'),
                    },
                  ]}
                >
                    <Select
                      style={{ width: '100%' }}
                      options={options}
                    ></Select>
                </Form.Item>
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ opacity: '0.7', fontSize: '14px' }}>
                    {t('ProjectDetail.uploadData.uploadDesc')}
                  </p>
                  <Dragger
                    beforeUpload={beforeUpload}
                    showUploadList={true}
                    maxCount={1} 
                    accept=".txt"
                  >
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined />
                    </p>
                    <p className="ant-upload-text">{t('ProjectDetail.uploadData.upload')}</p>
                  </Dragger>
                </div>
              </Form>
          </div>
        </TabPane>
      </Tabs>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin tip={t('ProjectDetail.uploadData.parse')} style={{margin: '20px auto'}} spinning={uploading}>
          <Button type="default" onClick={() => history.push('/userHome/projects/' + projectId.toString())} disabled={uploading}
              style={{marginRight:'40px'}}>
            {t('ProjectDetail.uploadData.back')}
          </Button>
          <Button type="primary" onClick={() => form.submit()} disabled={uploading}>
            {t('ProjectDetail.uploadData.submit')}
          </Button>
        </Spin>
      </div>
    </div>
  )
}

export default UploadMrxsFile
