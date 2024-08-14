import React, { useEffect, useState } from 'react'
import useQuery from '@/hooks/useQuery'
import { Form, Input, Button, Modal, Checkbox, Select, Spin, message, Progress } from 'antd'
import {
  editProject,
  createProject,
  deleteProject,
  searchProject
} from '@/request/actions/project'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router'

// 图片类型选择框
const options = [
  { label: '病理图(.mrxs, .tif)', value: 1 },
]

const CreateGroupView = () => {
  let { id: projectId } = useQuery()
  const history = useHistory()
  const [uploading, setUploading] = useState(false)
  const [pImageType, setPImageType] = useState(1)
  const [form] = Form.useForm()

  const { currentUserProjects } = useSelector(
    // @ts-ignore
    state => state.user
  )

  const fetchData = async () => {
    if (projectId) {
      // 获取项目详情
      const result = await searchProject(projectId)
      const projectDetails = result.data.content[0]

      setPImageType(projectDetails.imageType.imageTypeId)

      form.setFields([
        { name: 'project_name', value: projectDetails.projectName },
        { name: 'instructions', value: projectDetails.description }
      ])
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const onFinish = async values => {
    const { project_name, instructions } = values

    const projectRes = await searchProject(null,project_name)
    const matchingProject = projectRes.data.content

    if(matchingProject.length!==0 && matchingProject[0].projectId.toString() !== projectId){
      Modal.error({
        title: '该数据集名称已存在！',
        content: '请更换一个数据集名称',
      });
      return
    }

    setUploading(true)
    let res
    if (projectId) {
      res = await editProject([{
        projectId: Number(projectId),
        newProjectName: project_name,
        newProjectDescription: instructions
      }])
    } else {
      res = await createProject([{
        projectName: project_name,
        projectDescription: instructions,
        imageTypeId: pImageType
      }])
    }
    setUploading(false)
    if (res.err) message.error(res?.data || '创建失败')
    else {
      Modal.success({
        content: '信息提交成功',
        onOk: () => {
          if (projectId) {
            history.push('/userHome/projects/' + projectId.toString())
          }else{
            history.push('/userHome/my-projects')
          }
        },
      })
    }
    
  }

  return (
    <div style={{ margin: 'auto', width: '600px', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '50px' }}>{projectId ? '编辑' : '创建'}数据集</h1>
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
        <Form.Item
          label="图片类型"
          name="imageType"
          rules={[
            {
              required: true,
              message: '必须选择图片类型',
            },
          ]}
        >
          {pImageType === 0 && (
            <Select
              style={{ width: '100%' }}
              options={options}
              defaultValue={1}
            ></Select>
          )}
          {pImageType !== 0 && (
            <Select
              style={{ width: '100%' }}
              options={options}
              defaultValue={pImageType}
              disabled
            ></Select>)}
        </Form.Item>
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
        <Spin spinning={uploading} tip={'项目正在创建中...'} style={{ margin: '20px auto' }}>
          <Button type="default" onClick={() =>{
            if(projectId){
              history.push('/userHome/projects/' + projectId.toString())
            }else{
              history.push('/userHome/my-projects')
            }
          }} disabled={uploading}
                  style={{marginRight:'40px'}}>
            返回
          </Button>
          <Button type="primary" onClick={() => form.submit()} disabled={uploading}>
            提交
          </Button>
        </Spin>
      </div>
    </div>
  )
}

export default CreateGroupView
