import React, { useEffect, useState, useRef } from 'react'
import styles from './index.module.scss'
import { Button, Empty, message, Modal, Spin, Tabs, Table, Select, Divider } from 'antd'
import { ExclamationCircleOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons'
import { VButton } from '@/components'
import { useHistory } from 'react-router-dom'
import { logOut } from '@/helpers/Utils'
import {
  editProject,
  createProject,
  deleteProject,
  searchProject
} from '@/request/actions/project'
import SingleProject from './SingleProject'
import { useSelector, useDispatch } from 'react-redux'
import SearchBar from './SearchBar'
import type { PaginationProps } from 'antd'
import { ConfigProvider, Pagination } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import enUS from 'antd/es/locale/en_US';
import useDidUpdateEffect from '@/hooks/useDidUpdateEffect'
import { useTranslation } from 'react-i18next'

const MyProjects = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const { currentUserProjects, currentUserProjectsLength } = useSelector(
    // @ts-ignore
    state => state.user
  )

  const { t, i18n } = useTranslation()
  const [loading, setLoading] = useState(false)

  //控制当前页数
  const [currentPage, setCurrentPage] = useState(1)
  //每页显示数据集个数
  const [currentPageSize, setCurrentPageSize] = useState(9)
  //当前模糊搜索关键词
  const [keyword, setKeyWord] = useState('')

  const containerRef = useRef(null)

  const refreshData = async () => {
    setLoading(true)
    
    const page =  currentPage - 1
    const size =  currentPageSize
    let projectName = null

    if(keyword !== '') projectName = keyword

    const res = await searchProject(null,projectName,page,size)
    console.log(res)
    setLoading(false)
    if (!res.err) {
      dispatch({
        type: 'UPDATE_CURRENT_USER_PROJECTS',
        payload: res.data.content,
      })
      dispatch({
        type: 'UPDATE_CURRENT_USER_PROJECTS_LENGTH',
        payload: res.data.totalElements,
      })
    } else {
      Modal.error({
        title: t('LoginExpired.title'),
        content: t('LoginExpired.content'),
        onOk: () => logOut(history),
      })
    }
  }

  const deleteProjectModal = projectId => {
    Modal.confirm({
      title: t('ProjectHome.deleteProject.title'),
      icon: <ExclamationCircleOutlined />,
      content: t('ProjectHome.deleteProject.content'),
      okText: t('ProjectHome.deleteProject.okText'),
      cancelText: t('ProjectHome.deleteProject.cancelText'),
      onOk: async () => {
        const res = await deleteProject(projectId)
        if (!res.err) {
          message.success(t('ProjectHome.deleteProject.success'))
          refreshData()
        } else {
          message.error(res?.data || t('ProjectHome.deleteProject.error'))
        }
      },
    })
  }

  const onChange: PaginationProps['onChange'] = pageNumber => {
    setCurrentPage(pageNumber)
  }

  useEffect(() => {
    refreshData()
  }, [currentPage, currentPageSize])

  //切换keyword时，页数重置为1
  useDidUpdateEffect(() => {
    if (currentPage !== 1) setCurrentPage(1)
    else refreshData()
  }, [keyword])

  return (
    <Spin spinning={loading}>
      <div className={styles.titleWrap}>
        <div className={styles.title}>{t('ProjectHome.title')}</div>
        <div style={{ width: '5px' }} />
        <VButton
          size="small"
          color="#308014"
          onClick={() => history.push('/userHome/import')}
          icon={<PlusOutlined />}
        >
          {t('ProjectHome.newProjecrt')}
        </VButton>
      </div>
      <div style={{ width: '95%', display: 'flex' }}>
        <div style={{ paddingTop: '6px', marginLeft: 'auto' }}>
          <SearchBar setKeyWord={setKeyWord}></SearchBar>
        </div>
      </div>
      <Divider />
      {currentUserProjects?.length > 0 ? (
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingLeft: '90px'
          }}
          ref={containerRef}
        >
          {currentUserProjects.map((project, index) => (
            <SingleProject key={index} deleteProject={deleteProjectModal} projectDetails={project} />
          ))}
          <ConfigProvider locale={i18n.language === 'en' ? enUS : zhCN}>
            <Pagination
              current={currentPage}
              showQuickJumper
              showSizeChanger
              onShowSizeChange={(current, size) => {
                setCurrentPage(current)
                setCurrentPageSize(size)
              }}
              pageSizeOptions={['9', '10', '20', '30', '50']} // 修改这里
              defaultCurrent={1}
              defaultPageSize={9}
              total={currentUserProjectsLength}
              onChange={onChange}
              style={{
                alignSelf: 'center',
                width: '50%',
                justifyContent: 'center',
                marginLeft: '35%',
              }}
            />
          </ConfigProvider>
        </div>
      ) : (
        <Empty
          style={{ marginTop: '50px' }}
          description={<h2 className={styles.noItems}>{t('ProjectHome.empty')}</h2>}
        >
          <Button type="primary" onClick={() => history.push('/userHome/import')}>
            {t('ProjectHome.createButton')}
          </Button>
        </Empty>
      )}
    </Spin>
  )
}

export default MyProjects
