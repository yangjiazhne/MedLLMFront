/*
 * @Author: Azhou
 * @Date: 2021-10-25 23:14:47
 * @LastEditors: Azhou
 * @LastEditTime: 2022-03-01 15:28:50
 */
import React, { useMemo, useState } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import { Button, Modal, Breadcrumb } from 'antd'
import { ExclamationCircleOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { deleteProjectDt } from '@/request/actions/project'
import { useSelector } from 'react-redux'
import styles from './index.module.scss'

const Header = projectHits => {
  let history = useHistory()
  // @ts-ignore

  const { projectDetails, user } = useSelector(state => ({
    projectDetails: state.project.projectDetails,
    user: state.user.user,
  }))

  const createByMe = useMemo(() => user.orgName === projectDetails.orgName, [user, projectDetails])

  const startTagging = () => {
    if (projectDetails.status === 'INVALID') {
      Modal.warning({ content: '数据集无效，无法标记，请联系管理员处理' })
      return
    }
    if (projectHits.length === 0) {
      Modal.warning({ content: '该数据集还未上传任何图片，请先上传图片' })
      return
    }
    if (projectDetails.imageType == 'mrxs') {
      history.push(
        `/projects/pathoSpace/${projectDetails.id}?status=notDone&model=human-annotation`
      )
    } else
      history.push(`/projects/space/${projectDetails.id}?status=notDone&model=human-annotation`)
  }

  const showTagged = () => {
    if (projectDetails.status === 'INVALID') {
      Modal.warning({ content: '数据集无效，无法标记，请联系管理员处理' })
      return
    }
    if (projectHits.length === 0) {
      Modal.warning({ content: '该数据集还未上传任何图片，请先上传图片' })
      return
    }
    if (projectDetails.imageType == 'mrxs') {
      history.push(`/projects/pathoSpace/${projectDetails.id}?status=done`)
    } else history.push(`/projects/space/${projectDetails.id}?status=done`)
  }

  if (!projectHits) return null

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/userHome/my-projects" style={{ color: 'blue' }}>
            {projectDetails.orgName}
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{projectDetails.name}</Breadcrumb.Item>
      </Breadcrumb>
      {createByMe && (
        <div>
          {/* <a className={styles.gradient2} onClick={showTagged}>
            查看已标注
          </a> */}
          <a className={styles.gradient} onClick={startTagging}>
            开始标注
          </a>
        </div>
      )}
    </div>
  )
}

export default Header
