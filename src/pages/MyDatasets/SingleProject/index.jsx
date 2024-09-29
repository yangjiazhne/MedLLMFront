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
import { useTranslation } from 'react-i18next'

const SingleProject = ({ projectDetails, deleteProject }) => {
  const history = useHistory()
  const { t } = useTranslation()
  return (
    <div className={styles.projectWrap}>
      <div style={{ textAlign: 'right', paddingRight: '10px' }}>
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item danger onClick={() => deleteProject(projectDetails.projectId)}>
                <DeleteOutlined style={{ color: 'red' }} /> {t('ProjectHome.singleProject.delete')}
              </Menu.Item>
              <Menu.Item onClick={() => history.push('/userHome/projects/' + projectDetails.projectId.toString())}>
                <AppstoreOutlined style={{ color: '#1890ff' }} /> {t('ProjectHome.singleProject.detail')}
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
          {t('ProjectHome.singleProject.imageType')}
        </Tag>
      </div>
      <div className={styles.btnWrap}>
        <Button type="primary">
          <Link
            to={{
              pathname: '/userHome/groups/' + projectDetails.projectId,
            }}
          >
            {t('ProjectHome.singleProject.view')}
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default SingleProject
