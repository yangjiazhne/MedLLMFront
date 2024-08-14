import { Button, Dropdown, Menu, Progress, Tag } from 'antd'
import React, { useMemo } from 'react'
import styles from './index.module.scss'
import { Link } from 'react-router-dom'
import { DeleteOutlined, SmallDashOutlined,AppstoreOutlined } from '@ant-design/icons'
// @ts-ignore
import invalidIcon from '@/assets/invalid.png'
import { useHistory } from 'react-router'

const SingleProject = ({ groupDetail, deleteGroup }) => {
  const history = useHistory()
  return (
    <div className={styles.groupWrap}>
      <div style={{ textAlign: 'right', paddingRight: '10px' }}>
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item danger onClick={() => deleteGroup(groupDetail.imageGroupId)}>
                <DeleteOutlined style={{ color: 'red' }} /> 删除
              </Menu.Item>
            </Menu>
          }
        >
          <SmallDashOutlined />
        </Dropdown>
      </div>
      <div className={styles.title}>{groupDetail.imageGroupName}</div>
      <div className={styles.btnWrap}>
        <Button type="primary">
          <Link
            to={{
              pathname: '/userHome/projects/' + projectDetails.projectId,
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
