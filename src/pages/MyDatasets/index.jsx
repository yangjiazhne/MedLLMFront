import React, { useEffect, useState, useRef } from 'react'
import styles from './index.module.scss'
import { Button, Empty, message, Modal, Spin, Tabs, Table, Select, Divider } from 'antd'
import type { TableProps } from 'antd'
import { ExclamationCircleOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons'
import { getHomeData, getUserProjects } from '@/request/actions/user'
import { VButton } from '@/components'
import { useHistory } from 'react-router-dom'
import { logOut } from '@/helpers/Utils'
import { deleteProjectDt, getPublicDatasets } from '@/request/actions/project'
import SingleProject from './SingleProject'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import SearchBar from './SearchBar'
import type { PaginationProps } from 'antd'
import { ConfigProvider, Pagination } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import useDidUpdateEffect from '@/hooks/useDidUpdateEffect'
import { fetchProjectHits, fetchPathoProjectHits } from '@/request/actions/project'
import { saveAs } from 'file-saver'
import { imgUploadPre } from '@/constants'
import JSZip from 'jszip'
import { Helmet } from 'react-helmet'

const { TabPane } = Tabs

const MyProjects = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const zip = new JSZip()

  const { currentUserProjects, currentUserProjectsLength } = useSelector(
    // @ts-ignore
    state => state.user
  )

  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('my')

  //控制当前页数
  const [currentPage, setCurrentPage] = useState(1)
  //每页显示数据集个数
  const [currentPageSize, setCurrentPageSize] = useState(9)
  //当前模糊搜索关键词
  const [keyword, setKeyWord] = useState('')

  const containerRef = useRef(null)
  const [childrenCount, setChildrenCount] = useState(0)
  const { t } = useTranslation()

  // 经过筛选的数据集列表
  const [filteredProjects, setFilteredProjects] = useState([])

  // 数据集类别筛选
  const [imageTypeFilter, setImageTypeFilter] = useState('all')
  const [taskTypeFilter, setTaskTypeFilter] = useState('all')

  const quickDownload = async () => {
    setLoading(true)
    const queryData = {
      start: 0,
      count: 1000,
    }
    if (keyword !== '') queryData.keyword = keyword
    if (imageTypeFilter !== 'all') queryData.imageType = imageTypeFilter
    if (taskTypeFilter !== 'all') queryData.taskType = taskTypeFilter
    let res = await getUserProjects(queryData)
    if (!res.err) {
      let allUserProjectDetail = res.data.allUserProjectDetail
      for (let i = 0 ; i < allUserProjectDetail.length ; i++) {
        let projectDetails = allUserProjectDetail[i]
        let hitsRes = await fetchProjectHits(projectDetails.id, {
          status: 'done',
          start: 0,
          count: projectDetails.totalHits,
        })
        const projectName = projectDetails.name
        console.log(projectName)
        const hits = hitsRes.data.hits
        if (hits.length !== projectDetails.totalHits) continue
        // 存在服务器uploads文件夹中的标记项
        const isUploadHits = hits.filter(v => v.data.indexOf('/uploads') !== -1)
        if (!isUploadHits?.length) {
          Modal.info({
            title: '注意',
            content: '没有上传过的标记项，无法下载',
          })
          return
        }
        // 转换hit result
        const finalDownloadHits = isUploadHits.map(item => {
          const resultArr = item.hitResults[0]?.result
          return { ...item, finalHitResults: resultArr }
        })
        // 批量下载
        const jsonInfo = finalDownloadHits.map(hit => {
          let splitData = hit.data.split(imgUploadPre)[1].split('/')
          let fileName = splitData[splitData.length - 1]
          if (fileName.includes('___')) fileName = fileName.split('___')[1]
          if (fileName.includes('.thumbnail')) fileName = fileName.split('.thumbnail')[0]
          return {
            dataUrl: hit.data.split(imgUploadPre)[1],
            fileName: fileName,
            hitResults: hit.hitResults,
          }
        })
        let jsonFileName = projectName + '.json'
        let fileToSave = new Blob([JSON.stringify(jsonInfo, null, 4)], {
          type: 'application/json',
        })
        zip.file(jsonFileName, fileToSave, {blob: true})
      }
      zip.generateAsync({ type: "blob" }).then(blob => {
        saveAs(blob, "test.zip")
      });
    }
    setLoading(false)
  }

  const refreshData = async () => {
    setLoading(true)
    let res
    const queryData = {
      start: (currentPage - 1) * currentPageSize,
      count: currentPageSize,
    }
    if (keyword !== '') queryData.keyword = keyword
    if (imageTypeFilter !== 'all') queryData.imageType = imageTypeFilter
    if (taskTypeFilter !== 'all') queryData.taskType = taskTypeFilter

    if (activeTab === 'my') {
      console.log(queryData)
      res = await getUserProjects(queryData)
    }
    if (activeTab === 'public') {
      res = await getPublicDatasets(queryData)
    }
    setLoading(false)
    if (!res.err) {
      if (activeTab === 'my') {
        dispatch({
          type: 'UPDATE_CURRENT_USER_PROJECTS',
          payload: res.data.allUserProjectDetail,
        })
        dispatch({
          type: 'UPDATE_CURRENT_USER_PROJECTS_LENGTH',
          payload: res.data.allUserProjectLength,
        })
      }
      if (activeTab === 'public') {
        dispatch({
          type: 'UPDATE_CURRENT_USER_PROJECTS',
          payload: res.data.allPublicProjectDetail,
        })
        dispatch({
          type: 'UPDATE_CURRENT_USER_PROJECTS_LENGTH',
          payload: res.data.allPublicProjectLength,
        })
      }
    } else {
      Modal.error({
        title: '提示',
        content: '您的登录已过期，请重新登陆',
        onOk: () => logOut(history),
      })
    }

    if (containerRef && containerRef.current) {
      setChildrenCount(containerRef.current.children.length)
    }
  }

  const deleteProject = projectId => {
    Modal.confirm({
      title: '确认',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除该数据集吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const res = await deleteProjectDt(projectId)
        if (!res.err) {
          message.success('数据集删除成功')
          refreshData()
        } else {
          message.error(res?.data || '删除失败')
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

  useEffect(() => {
    let _filterProjects = currentUserProjects.filter(project => {
      if (imageTypeFilter !== 'all' && project.imageType !== imageTypeFilter) return false
      if (taskTypeFilter !== 'all' && project.taskType !== taskTypeFilter) return false
      return true
    })
    setFilteredProjects(_filterProjects)
  }, [currentUserProjects])

  //切换keyword时，页数重置为1
  useDidUpdateEffect(() => {
    if (currentPage !== 1) setCurrentPage(1)
    else refreshData()
  }, [keyword])

  //切换activateTab, 搜索框重置为空，页数重置为1
  useDidUpdateEffect(() => {
    if (keyword !== '') setKeyWord('')
    else if (currentPage !== 1) setCurrentPage(1)
    else refreshData()
  }, [activeTab])

  return (
    <Spin spinning={loading}>
      <div className={styles.titleWrap}>
        <div className={styles.title}>{t('datasets')}</div>
        <div style={{ width: '5px' }} />
        <VButton
          size="small"
          color="#308014"
          onClick={() => history.push('/userHome/import')}
          icon={<PlusOutlined />}
        >
          {t('New')}
        </VButton>
        <VButton
            size="small"
            color="#308014"
            onClick={quickDownload}
            style={{marginLeft: '10px'}}
        >
          {"批量下载"}
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
            <SingleProject key={index} deleteProject={deleteProject} projectDetails={project} />
          ))}
          <ConfigProvider locale={zhCN}>
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
          description={<h2 className={styles.noItems}>数据集列表为空</h2>}
        >
          {activeTab === 'my' && (
            <Button type="primary" onClick={() => history.push('/userHome/import')}>
              请创建一个数据集
            </Button>
          )}
        </Empty>
      )}
    </Spin>
  )
}

export default MyProjects
