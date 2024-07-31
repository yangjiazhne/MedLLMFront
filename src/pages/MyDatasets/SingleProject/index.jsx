/*
 * @Author: Azhou
 * @Date: 2021-11-12 16:39:08
 * @LastEditors: Azhou
 * @LastEditTime: 2022-03-01 15:23:53
 */
import { Button, Dropdown, Menu, Progress, Tag } from 'antd'
import React, { useMemo } from 'react'
import styles from './index.module.scss'
import { Link, useHistory } from 'react-router-dom'
import { DeleteOutlined, SmallDashOutlined } from '@ant-design/icons'
// @ts-ignore
import invalidIcon from '@/assets/invalid.png'
import { useTranslation } from 'react-i18next'

const SingleProject = ({ projectDetails, deleteProject }) => {
  const { t } = useTranslation()

  const taskPercent = useMemo(() => {
    if (projectDetails.totalHits === 0) return 0
    return Number(((projectDetails.totalHitsDone / projectDetails.totalHits) * 100).toFixed(2))
  }, [projectDetails])

  return (
    <div className={styles.projectWrap}>
      {projectDetails.status === 'INVALID' && (
        <img src={invalidIcon} className={styles.invalid} alt="invalid" />
      )}

      <div style={{ textAlign: 'right', paddingRight: '10px' }}>
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item danger onClick={() => deleteProject(projectDetails.id)} disabled={true}>
                <DeleteOutlined style={{ color: 'red' }} /> {t('delete')}
              </Menu.Item>
            </Menu>
          }
        >
          <SmallDashOutlined />
        </Dropdown>
      </div>
      <div className={styles.title}>{projectDetails.name}</div>
      <Progress
        percent={taskPercent}
        format={percent => `${projectDetails.totalHitsDone} / ${projectDetails.totalHits}`}
        style={{ width: '80%', margin: '10px 0' }}
      />
      <div className={styles.desc}>
        <Tag color="cyan">
          {projectDetails.totalHits} {t('hits')}
        </Tag>
        <Tag color="purple">
          {t(projectDetails.imageType)} {'数据集'}
        </Tag>
        {projectDetails.public && <Tag color="green">public</Tag>}
      </div>
      <div className={styles.btnWrap}>
        <Button type="primary">
          <Link
            to={{
              pathname: '/userHome/projects/' + projectDetails.id,
            }}
          >
            {t('details')}
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default SingleProject
