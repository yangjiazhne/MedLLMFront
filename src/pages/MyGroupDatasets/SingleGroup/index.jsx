import { Button, Dropdown, Menu, Progress, Tag, message } from 'antd'
import React, { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styles from './index.module.scss'
import { Link } from 'react-router-dom'
import { searchGroup } from '@/request/actions/group'
import { DeleteOutlined, SmallDashOutlined,AppstoreOutlined,VerticalAlignTopOutlined } from '@ant-design/icons'
// @ts-ignore
import invalidIcon from '@/assets/invalid.png'
import { useHistory } from 'react-router'
import { useTranslation } from 'react-i18next'

const SingleProject = ({ groupDetail, deleteGroup, projectId }) => {
  const history = useHistory()
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()
  const taskPercent = useMemo(() => {
    if (groupDetail.totalImages === 0) return 0
    return Number(((groupDetail.finishImages / groupDetail.totalImages) * 100).toFixed(2))
  }, [groupDetail])

  return (
    <div className={styles.groupWrap}>
      <div style={{ textAlign: 'right', paddingRight: '10px' }}>
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item danger onClick={() => deleteGroup(groupDetail.imageGroupId)}>
                <DeleteOutlined style={{ color: 'red' }} /> {t('GroupHome.singleGroup.delete')}
              </Menu.Item>
              <Menu.Item onClick={() => history.push(`/userHome/project-file/${projectId}?type=Raw`)}>
                <VerticalAlignTopOutlined style={{ color: '#1890ff' }} /> {t('GroupHome.singleGroup.upload')}
              </Menu.Item>
            </Menu>
          }
        >
          <SmallDashOutlined />
        </Dropdown>
      </div>
      <div className={styles.title}>{groupDetail.imageGroupName}</div>
      <Progress
        percent={taskPercent}
        format={percent => `${groupDetail.finishImages} / ${groupDetail.totalImages}`}
        style={{ width: '80%', margin: '10px 10px 20px 10px' }}
      />
      <div className={styles.btnWrap}>
        <Button type="primary" onClick={async()=>{
          if(groupDetail.totalImages===0){
            message.warning(t('GroupHome.singleGroup.empty'));
            return
          }
          const projectGroupsRes= await searchGroup(projectId)
          const index = projectGroupsRes.data.content.findIndex(group => group.imageGroupId === groupDetail.imageGroupId);
          const _page = Math.floor((index + 1) / 8)
          dispatch({
            type: 'UPDATE_DEFAULT_GROUP_INFO',
            payload: {
              group: groupDetail,
              page: _page
            }
          })
          history.push(
            `/projects/pathoSpace/${projectId}`
          )
        }}>
          {t('GroupHome.singleGroup.view')}
        </Button>
      </div>
    </div>
  )
}
export default SingleProject
