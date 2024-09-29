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
import { logOut } from '@/helpers/Utils'
import { useTranslation } from 'react-i18next'

const CreateProjectView = () => {
  let { id: projectId } = useQuery()
  const history = useHistory()
  const [uploading, setUploading] = useState(false)
  const [pImageType, setPImageType] = useState(1)
  const [form] = Form.useForm()

  const { currentUserProjects } = useSelector(
    // @ts-ignore
    state => state.user
  )
  const { t, i18n } = useTranslation()
  // 图片类型选择框
  const options = [
    { label: `${t('ProjectHome.createProject.mrxs')} (.mrxs, .tif)`, value: 1 },
  ]

  const fetchData = async () => {
    if (projectId) {
      // 获取项目详情
      const result = await searchProject(projectId)
      if(result.err){
        Modal.error({
          title: t('LoginExpired.title'),
          content: t('LoginExpired.content'),
          onOk: () => logOut(history),
        })
      }
      
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

    const projectRes = await searchProject()

    const allProjects = projectRes.data.content

    const matchingProject = allProjects.find(p => p.projectName === project_name)
    
    if((matchingProject && matchingProject.length !== 0 && !projectId) || (matchingProject && matchingProject.length !== 0 && projectId && matchingProject[0].projectId.toString() !== projectId)){
      Modal.error({
        title: t('ProjectHome.createProject.projectExistTitle'),
        content: t('ProjectHome.createProject.projectExistContent'),
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
    if (res.err) message.error(res?.data || t('ProjectHome.createProject.error'))
    else {
      Modal.success({
        content: t('ProjectHome.createProject.success'),
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
      <h1 style={{ marginBottom: '50px' }}>{projectId ? t('ProjectHome.createProject.edit') : t('ProjectHome.createProject.create')}{t('ProjectHome.createProject.project')}</h1>
      <Form
        form={form}
        layout="vertical"
        style={{ textAlign: 'left' }}
        initialValues={{ imageType: 'normal' }}
        onFinish={onFinish}
      >
        <Form.Item
          label={t('ProjectHome.createProject.title')}
          name="project_name"
          rules={[
            {
              required: true,
              message: t('ProjectHome.createProject.nameRequired'),
            },
          ]}
        >
          <Input placeholder= {t('ProjectHome.createProject.nameInput')} />
        </Form.Item>
        <Form.Item
          label={t('ProjectHome.createProject.imageType')}
          name="imageType"
          rules={[
            {
              required: true,
              message: t('ProjectHome.createProject.imageTypeRequired'),
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
          label={t('ProjectHome.createProject.description')}
          name="instructions"
          rules={[
            {
              required: true,
              message: t('ProjectHome.createProject.descriptionRequired'),
            },
          ]}
        >
          <Input.TextArea
            rows={5}
            placeholder={t('ProjectHome.createProject.descInput')}
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
        <Spin spinning={uploading} tip={t('ProjectHome.createProject.creating')} style={{ margin: '20px auto' }}>
          <Button type="default" onClick={() =>{
            if(projectId){
              history.push('/userHome/projects/' + projectId.toString())
            }else{
              history.push('/userHome/my-projects')
            }
          }} disabled={uploading}
                  style={{marginRight:'40px'}}>
            {t('ProjectHome.createProject.back')}
          </Button>
          <Button type="primary" onClick={() => form.submit()} disabled={uploading}>
            {t('ProjectHome.createProject.submit')}
          </Button>
        </Spin>
      </div>
    </div>
  )
}

export default CreateProjectView
