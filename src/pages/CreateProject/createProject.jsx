import React, { useEffect, useState } from 'react'
import useQuery from '@/hooks/useQuery'
import { Form, Input, Button, Modal, Checkbox, Select, Spin, message, Progress } from 'antd'
import {
  editProject,
  fetchProjectDetail,
  uploadDataForm,
  createDCMProject,
  createPathoProject,
  mrxs2deepZoom,
} from '@/request/actions/project'
import { createDatasetTask } from '@/request/actions/task'

import { useHistory } from 'react-router'
import { userGetAllConfig } from '@/request/actions/user'
import styles from './index.module.scss'
import { Tabs, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

const { Option } = Select

// 仿照UploadRawData.jsx
const { TabPane } = Tabs
const { Dragger } = Upload

const fs = require('fs')

// 图片类型选择框
const options = [
  { label: '普通图片(.png, .jpg, .jpeg)', value: 'normal' },
  { label: 'DICOM(.dcm)', value: 'dicom' },
  { label: '病理图(.mrxs)', value: 'mrxs' },
]

const CreateProjectView = ({ handleUploadDone, ...restProps }) => {
  let { id: projectId } = useQuery()
  const history = useHistory()
  const [errorMsg, setErrorMsg] = useState()
  const [uploading, setUploading] = useState(false) // 仿照UploadRawData.jsx
  const [uploadProcess, setUploadProcess] = useState(0)

  const [medicalConfigs, setMedicalConfigs] = useState({
    imageOrganType: [],
    medicalImageFormat: [],
  })

  const [form] = Form.useForm()
  const { t } = useTranslation()


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

  const fetchData = async () => {
    if (projectId) {
      // 获取项目详情
      const { data: projectDetails } = await fetchProjectDetail(projectId)
      let { taskRules } = projectDetails

      taskRules = JSON.parse(taskRules)

      const { instructions } = taskRules

      form.setFields([
        { name: 'project_name', value: projectDetails.name },
        { name: 'instructions', value: instructions },
      ])
    }
    // 获取配置信息
    const configs = await userGetAllConfig()
    if (!configs.err) setMedicalConfigs(JSON.parse(configs.data.response))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const onFinish = async values => {
    const { project_name, instructions } = values
    const rules = { instructions }

    const ans = {
      name: project_name,
      rules: JSON.stringify(rules),
    }

    let res
    if (projectId) {
      res = await editProject(projectId, {
        ...ans,
        accessType: 'RESTRICTED',
      })
    } else {
      res = await uploadDataForm(ans)
      projectId = res.data.response
    }
    console.log(res)
    if (res.err) setErrorMsg(res.data)
    else {
      Modal.success({
        content: '信息提交成功',
        onOk: () => history.push('/userHome/projects/' + projectId.toString()),
      })
    }
    
  }

  const uploadTxt = async () => {
    console.log('暂未实现')
    window.alert('该方法暂未实现!')
  }

  return (
    <div style={{ margin: 'auto', width: '600px', textAlign: 'center' }}>
      {restProps.iDontNeedTitle ? (
        <></>
      ) : (
        <h1 style={{ marginBottom: '50px' }}>{projectId ? '编辑' : '创建'}数据集</h1>
      )}
      <Form
        form={form}
        layout="vertical"
        style={{ textAlign: 'left' }}
        initialValues={{ imageType: 'normal' }}
        onFinish={onFinish}
      >
        <Form.Item
          label="数据集名称"
          name="project_name"
          rules={[
            {
              required: true,
              message: '必须填写数据集名称',
            },
          ]}
        >
          <Input placeholder="汽车/动物 框选数据集" />
        </Form.Item>
        {/* <Form.Item
          label="标签"
          name="tagsList"
          rules={[
            {
              required: true,
              message: '必须填写标签',
            },
          ]}
        >
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="请添加标签, 以英文','划分, 支持复制"
            tokenSeparators={[',']}
          />
        </Form.Item> */}
        {/* <Form.Item label="任务类型" name="taskType">
          {pTaskType === '' && (
            <Select
              style={{ width: '100%' }}
              placeholder="请选择任务类型"
              onChange={isSelectedTask}
              defaultValue={'IMAGE_DETECTION_IMAGE_SEGMENTATION'}
              options={[
                {
                  label: '检测与分割',
                  value: 'IMAGE_DETECTION_IMAGE_SEGMENTATION',
                },
                {
                  label: '分类',
                  value: 'IMAGE_CLASSIFICATION',
                },
              ]}
            ></Select>
          )}
          {pTaskType !== '' && (
            <Select
              style={{ width: '100%' }}
              defaultValue={pTaskType}
              disabled
              options={[
                {
                  label: '检测与分割',
                  value: 'IMAGE_DETECTION_IMAGE_SEGMENTATION',
                },
                {
                  label: '分类',
                  value: 'IMAGE_CLASSIFICATION',
                },
              ]}
            ></Select>
          )}
        </Form.Item> */}
        {/* <Form.Item
          label="图片类型"
          name="imageType"
          rules={[
            {
              required: true,
              message: '必须选择图片类型',
            },
          ]}
        >
          {pImageType === '' && (
            <Select
              style={{ width: '100%' }}
              options={options}
              onChange={isSelectedDicom}
              defaultValue={'normal'}
            ></Select>
          )}
          {pImageType !== '' && (
            <Select
              style={{ width: '100%' }}
              options={options}
              defaultValue={pImageType}
              disabled
            ></Select>
          )}
        </Form.Item> */}
        {/* {pImageType === '' && (isDicomType || isMrxsType) && (
          <div style={{ marginBottom: '15px' }}>
            <p style={{ opacity: '0.7', fontSize: '14px' }}>
              请上传文本文件, 根据行数生成项目个数, 文本文件的每行为图片所在文件夹的绝对路径
            </p>
            <Dragger beforeUpload={beforeUpload} maxCount={1} accept=".txt" showUploadList={true}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域</p>
            </Dragger>
          </div>
        )} */}
        <Form.Item
          label="数据集简介"
          name="instructions"
          rules={[
            {
              required: true,
              message: '必须填写数据集简介',
            },
          ]}
        >
          <Input.TextArea
            rows={5}
            placeholder="汽车物体矩形框选数据集，包含汽车的矩形框标注，用于汽车识别。"
          />
        </Form.Item>
      </Form>
      <div
        style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        {uploading && <Spin tip={'项目正在创建中...'} style={{ margin: '20px auto' }}></Spin>}
        {(uploading || uploadProcess > 0) && (
          <Progress
            percent={Number(uploadProcess.toFixed(2))}
            style={{ width: '400px', margin: '20px auto' }}
          />
        )}
        <Button type="default" onClick={() => history.push('/userHome/my-projects')} disabled={uploading}
                style={{marginRight:'40px'}}>
          返回
        </Button>
        <Button type="primary" onClick={() => form.submit()} disabled={uploading}>
          提交
        </Button>
        <div style={{ color: 'red', marginTop: 8 }}>{errorMsg}</div>
      </div>
    </div>
  )
}

export default CreateProjectView
