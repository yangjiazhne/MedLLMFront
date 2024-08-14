import React from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Modal, Breadcrumb } from 'antd'
import { useSelector } from 'react-redux'
import styles from './index.module.scss'

const Header = currentGroupImages => {
  let history = useHistory()
  
  const { projectDetails } = useSelector(
    // @ts-ignore
    state => state.project
  )

  const startTagging = () => {
    // if (currentGroupImages.length === 0) {
    //   Modal.warning({ content: '该数据集还未上传任何图片，请先上传图片' })
    //   return
    // }
    history.push(
      `/projects/pathoSpace/${projectDetails.projectId}`
    )
  }

  if (!currentGroupImages) return null

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/userHome/my-projects" style={{ color: 'blue' }}>
            {'userHome'}
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{projectDetails.projectName}</Breadcrumb.Item>
      </Breadcrumb>
      <div>
        <a className={styles.gradient} onClick={startTagging}>
          开始标注
        </a>
      </div>
    </div>
  )
}

export default Header
