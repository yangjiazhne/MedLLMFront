/*
 * @Author: Azhou
 * @Date: 2021-11-12 16:39:08
 * @LastEditors: Azhou
 * @LastEditTime: 2022-03-01 15:23:53
 */
import { Button, Dropdown, Menu, Progress, Tag } from 'antd'
import React, { useMemo } from 'react'
import styles from './index.module.scss'
import { Link } from 'react-router-dom'
import { DeleteOutlined, SmallDashOutlined,AppstoreOutlined } from '@ant-design/icons'
// @ts-ignore
import invalidIcon from '@/assets/invalid.png'
import { useHistory } from 'react-router'

const SingleProject = ({ projectDetails, deleteProject }) => {
  const history = useHistory()
  return (
    <div className={styles.projectWrap}>
      <div style={{ textAlign: 'right', paddingRight: '10px' }}>
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item danger onClick={() => deleteProject(projectDetails.projectId)}>
                <DeleteOutlined style={{ color: 'red' }} /> 删除
              </Menu.Item>
              <Menu.Item onClick={() => history.push('/userHome/projects/' + projectDetails.projectId.toString())}>
                <AppstoreOutlined style={{ color: '#1890ff' }} /> 详情
              </Menu.Item>
            </Menu>
          }
        >
          <SmallDashOutlined />
        </Dropdown>
      </div>
      <div className={styles.title}>{projectDetails.projectName}</div>
      <div className={styles.desc}>
        <Tag color="purple">
          {projectDetails.imageType.imageTypeName} {'数据集'}
        </Tag>
      </div>
      <div className={styles.btnWrap}>
        <Button type="primary">
          <Link
            to={{
              pathname: '/userHome/groups/' + projectDetails.projectId,
            }}
          >
            {'查看'}
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default SingleProject
