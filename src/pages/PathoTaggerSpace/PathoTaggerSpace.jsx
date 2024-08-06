// 临时测试用projectId: ff8081818dfe6c76018e227861da0027

import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { VIcon } from '@/components'
import Draggable from 'react-draggable'; 
import { hitShapeTypes, contorlTypes } from '@/constants'
import {
  Card,
  Empty,
  message,
  Modal,
  Spin,
  Tag,
  Button,
  Divider,
  Checkbox,
  Popover,
  Radio,
} from 'antd'
import { HomeOutlined, LeftOutlined, CloseOutlined } from '@ant-design/icons'

import useQuery from '@/hooks/useQuery'
import {
  fetchProjectDetail,
  fetchPathoProjectHits,
  fetchProjectHits,
  updateHitStatus,
  fetchProjectModels,
  getModelInfer,
  getPathoImgInfo,
} from '@/request/actions/project'
import { getTaskList } from '@/request/actions/task'
import { imgUploadPre } from '@/constants'
import { getCurrentResult, handleKeyDown, renderModelInfer } from './help'
import styles from './PathoTaggerSpace.module.scss'
import { RightBar, CanvasAnnotator, DoneTopBar, SliceList } from './components'
import { ExclamationCircleOutlined } from '@ant-design/icons'

const PathoTaggerSpace = () => {
  let queryInfo = useQuery()
  const dispatch = useDispatch()
  let history = useHistory()
  const {
    projectDetails, //项目详情
    projectHits, //项目的历史标记项
    pathoImgInfo, // 病理图片信息
    // currentHit, //当前标记项
    // currentIndex, //当前标记项在历史hits中的index
    currentCanvas, //当前画布canvas
    currentViewer,
    classifyInfo, //当前标记项的classification分类信息
    currentImgSize, //当前标记图片的大小
    pathoViewSize, //当前标记图片的视窗大小
  } = useSelector(
    // @ts-ignore
    state => state.project
  )

  let { projectId } = useParams()
  const currentProjectPid = projectId
  const [projectHitsFetchEnd, setProjectHitsFetchEnd] = useState(false) // 项目标记信息获取完成标记
  const [loading, setLoading] = useState(false) // 加载状态
  const [changeSession, setChangeSession] = useState(false) // 是否有未保存的标记信息
  const [isEdit, setIsEdit] = useState(false) // 是否是编辑状态 用于判断是否显示保存按钮 保存按钮只有在编辑状态下显示 且只有在notDone状态下显示 且只有在notDone状态下点击保存按钮才会保存 保存后状态变为done 且不再显示保存按钮 且不再是编辑状态 且不再显示编辑按钮 且不再显示标记信息
  const [filterValue, setFilterValue] = useState({
    status: '',
    model: '',
  }) // 过滤条件

  const [showTagBox, setShowTagBox] = useState(false)
  const [showSliceList, setShowSliceList] = useState(false)
  const [showMoreList, setShowMoreList] = useState(false)
  const [showSliceInfoBox, setShowSliceInfoBox] = useState(false)

  const currentInferPaths = useRef([]) // 当前的模型推理结果，临时存储，每次返回时都要先清空上一次的所有路径
  const boundsRef = useRef(null);
  //获取所有需要的项目信息
  const fetchData = async () => {
    if (!filterValue.status) return

    if (currentProjectPid) {
      setLoading(true)
      // 获取项目基本信息
      const detailRes = await fetchProjectDetail(currentProjectPid)

      await dispatch({
        type: 'UPDATE_PROJECT_DETAIL',
        payload: detailRes.data,
      })

      var hitsData = await fetchPathoProjectHits(currentProjectPid, {
        model: 'human-annotation',
        hitStatus: 'notDone',
        hitResultStatus: 'notDone',
      })
      // 临时修改为按照done重新获取，后面要修改这个接口的后端，如果status是‘any’就无论是done还是notDone都能获取
      if (hitsData.data.hits.length === 0) {
        hitsData = await fetchPathoProjectHits(currentProjectPid, {
          model: 'human-annotation',
          hitStatus: 'done',
          hitResultStatus: 'done',
        })
      }
      hitsData = hitsData.data.hits

      // if (filterValue.status === 'al') {
      //   hitsData = (
      //     await fetchPathoProjectHits(currentProjectPid, {
      //       model: filterValue.model,
      //       hitStatus: 'notDone',
      //       hitResultStatus: 'al',
      //     })
      //   ).data.hits
      // } else {
      //   hitsData = (
      //     await fetchPathoProjectHits(currentProjectPid, {
      //       model: filterValue.model,
      //       hitStatus: filterValue.status,
      //       hitResultStatus: filterValue.status,
      //     })
      //   ).data.hits
      // }

      setProjectHitsFetchEnd(true)

      let _boundingBoxMap
      if (hitsData && hitsData[0] && hitsData[0].hitResults && hitsData[0].hitResults.length > 0) {
        if (typeof hitsData[0].hitResults[0].result == 'string') {
          _boundingBoxMap = JSON.parse(hitsData[0].hitResults[0].result)
        } else {
          _boundingBoxMap = hitsData[0].hitResults[0].result
        }
        await dispatch({
          type: 'UPDATE_BOUNDING_BOX_MAP',
          payload: _boundingBoxMap,
        })
      }

      dispatch({
        type: 'UPDATE_PROJECT_HITS',
        // payload: getHits(hitsData, filterValue),
        payload: hitsData,
      })

      // 获取病理图信息
      let pathoImageInfo = await getPathoImgInfo(currentProjectPid)

      pathoImageInfo = {
        url: `${hitsData[0]?.data}/images/`,
        overlap: pathoImageInfo.data.Overlap,
        tileSize: pathoImageInfo.data.TileSize,
        format: pathoImageInfo.data.Format.toLowerCase(),
        size: {
          width: pathoImageInfo.data.Size.Width,
          height: pathoImageInfo.data.Size.Height,
        },
      }

      dispatch({
        type: 'UPDATE_PROJECT_PATHOIMGINFO',
        payload: pathoImageInfo,
      })

      // 设置标注页面初始状态
      dispatch({
        type: 'UPDATE_CURRENT_CONTROL_TYPE',
        payload: 'drag',
      })

      if (filterValue.status === 'done' && !isEdit) {
        dispatch({
          type: 'UPDATE_CURRENT_ENTITY',
          payload: '',
        })
      }

      setLoading(false)
    }
  }


  // 路由的query参数变化时重新获取参数
  useEffect(() => {
    const { status = '', model = '' } = queryInfo
    setFilterValue({
      status: status.toString(),
      model: model.toString(),
    })
  }, [queryInfo])

  useEffect(() => {
    if(showSliceList){
      setShowTagBox(false)
      setShowMoreList(false)
      setShowSliceInfoBox(false)
    }
  },[showSliceList])

  useEffect(() => {
    if(showTagBox){
      setShowSliceList(false)
      setShowMoreList(false)
      setShowSliceInfoBox(false)
    }
  },[showTagBox])

  useEffect(() => {
    if(showMoreList){
      setShowTagBox(false)
      setShowSliceList(false)
      setShowSliceInfoBox(false)
    }
  },[showMoreList])

  useEffect(() => {
    if(showSliceInfoBox){
      setShowTagBox(false)
      setShowSliceList(false)
      setShowMoreList(false)
    }
  },[showSliceInfoBox])

  useEffect(() => {
    fetchData()
    return () => {
      //  清除reduxproject状态
      dispatch({
        type: 'CLEAR_PROJECT_STATE',
      })
    }
  }, [filterValue])

  const handleChangeHitStatus = async action => {
    const result = getCurrentResult(currentCanvas)

    // const _model =filterValue['status'] === 'done' ? currentHit.hitResults[0].model : filterValue['model']

    const _model = isEdit ? 'human-annotation' : filterValue['model']

    let _hitResid = -1
    const projectHit = projectHits[0]
    if (projectHit.hitResults && projectHit.hitResults[0]) _hitResid = projectHit.hitResults[0].id

    const postData = {
      hitResId: _hitResid,
      hitId: projectHit.id,
      pid: projectDetails.id,
      status: '',
      result: result,
      predLabel: JSON.stringify(classifyInfo),
      model: _model,
    }
    let res
    switch (action) {
      case 'saveTempHit':
        postData.status = 'notDone'
        res = await updateHitStatus(postData)
        break
      case 'saveToDone':
        // 保存标注信息并to done
        postData.status = 'done'
        res = await updateHitStatus(postData)
        break
      case 'skipped':
      case 'deleted':
      case 'reQueued':
        postData.status = action
        res = await updateHitStatus(postData)
        break
      case 'logResult':
        // console.log('result: ', result)
        res = { err: false }
        break
    }
    if (res && !res.err) {
      // message.success('operate success!')
      if (action !== 'logResult') {
        setChangeSession(false)
        if (action !== 'saveToDone') {
          setIsEdit(false)
        }
      }
    } else {
      message.error(res.data)
    }
  }

  useEffect(() => {
    if(!showTagBox){
      dispatch({
        type: 'UPDATE_CURRENT_CONTROL_TYPE',
        payload: contorlTypes.DRAG,
      })
      dispatch({
        type: 'UPDATE_CURRENT_SHAPE',
        payload: hitShapeTypes.NONE,
      })
    }
  }, [showTagBox])

  const handleNextRow = action => {
    const step = action === 'next' ? 1 : -1

    if (changeSession) {
      Modal.confirm({
        title: 'Confirm',
        icon: <ExclamationCircleOutlined />,
        content: '当前画布还有标注信息未保存，确定继续操作吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: () =>
          // 清除标记信息
          dispatch({
            type: 'UPDATE_CURRENT_HIT_INDEX',
            payload: currentIndex + step,
          }),
      })
    } else {
      dispatch({
        type: 'UPDATE_CURRENT_HIT_INDEX',
        payload: currentIndex + step,
      })
    }
  }

  if (!projectHits) {
    return null
  }

  return (
    <Spin spinning={loading}>
      {projectHitsFetchEnd && projectHits.length === 0 && (
        <div className={styles.emptyPage}>
          <DoneTopBar filterValue={filterValue} />
          {filterValue['status'] === 'done' && (
            <Empty
              style={{ marginTop: '200px' }}
              description={<h2 className={styles.noItems}> 还没有GT标注数据 </h2>}
            />
          )}
          {filterValue['status'] === 'notDone' && (
            <Empty
              style={{ marginTop: '50px' }}
              description={
                <h2 className={styles.noItems}>
                  此项目已经标注完成，请到查看已标注页面进行查看或再次修改
                </h2>
              }
            />
          )}
          {filterValue['status'] === 'al' && (
            <Empty
              style={{ marginTop: '50px' }}
              description={<h2 className={styles.noItems}> 模型推理数据已全部确认 </h2>}
            />
          )}
        </div>
      )}
  
      {projectHitsFetchEnd && projectHits.length !== 0 && (
        <div className={styles.container} ref={boundsRef}>
            {/* <div className={styles.infoContainer}>
              <div slot="title">
                <Button
                  icon
                  title="Back"
                  style={{
                    width: '35px',
                    height: '30px',
                    padding: '4px 7px',
                    marginRight: '10px',
                  }}
                  onClick={() => {
                    history.push('/userHome/projects/' + currentProjectPid)
                  }}
                >
                  <LeftOutlined />
                </Button>
                <Button
                  icon
                  title="Home"
                  style={{
                    width: '35px',
                    height: '30px',
                    padding: '4px 7px',
                    marginRight: '10px',
                  }}
                  onClick={() => history.push('/userHome/my-projects')}
                >
                  <HomeOutlined />
                </Button>
              </div>
            </div> */}
          {showTagBox && 
            <Draggable handle='.RightBar_tagHeader__2afYV'
            bounds={boundsRef.current}>
            <div className={styles.tagBox}>
              <RightBar
                modelName={filterValue.model} // 当前模型名称
                space={filterValue.status === 'notDone' || isEdit} // 是否是标注状态
                isDone={filterValue.status === 'done'}
                saveRow={handleChangeHitStatus}
                setIsEdit={setIsEdit}
                setShowTagBox={setShowTagBox}
              />
            </div>
          </Draggable>}
          {showSliceList && (
            <Draggable handle='.SliceList_sliceListHeader__2GecI'>
              <div className={styles.SliceBox}>
                <SliceList
                  setShowSliceList={setShowSliceList}
                />
              </div>
            </Draggable>
          )}
          <div className={styles.viewContainer}>
            {projectHits.length !== 0 && pathoImgInfo.url !== '' && (
              <CanvasAnnotator
                setChangeSession={setChangeSession}
                setIsEdit={setIsEdit}
                space={filterValue.status === 'notDone' || isEdit}
              />
            )}
          </div>
        </div>
      )}

      <Popover
        content={<div style={{width: '250px', backgroundColor: '#272b33', padding:'10px', color: '#fff'}}>
          <p><b>切片信息 </b></p>
          <Divider style={{ marginTop: '0', marginBottom: '5px', backgroundColor: '#354052' }} />
          <p style={{ wordWrap: 'break-word', marginBottom: '4px' }}>
            <b>文件名: </b>
            {projectHits.length > 0 ? projectHits[0].data.split('/').pop() : 'temp'}
          </p>
          <p style={{ marginBottom: '4px' }}>
            <b>图片宽高: </b>
            {pathoImgInfo?.size?.width} x {pathoImgInfo?.size?.height}
          </p>
          <p style={{ marginBottom: '4px' }}>
            <b>视窗内图片大小: </b>
            {pathoViewSize.width} x {pathoViewSize.height}
          </p>
        </div>}
        trigger="click"
        overlayClassName={styles.morePop}
        open={showSliceInfoBox}
        placement="right"
        onOpenChange={(newOpen)=>{setShowSliceInfoBox(newOpen)}}
      >
        <div className={styles.sliceInfo}>
          <div onClick={()=>{setShowSliceInfoBox(!showSliceInfoBox)}} title='切片信息' className={styles.sliceInfoButton} 
              style={{backgroundColor: `${showSliceInfoBox ? 'rgba(37, 176, 229, .7)' : 'rgba(40, 49, 66, .6)'}`}}>
            <VIcon type="icon-binglixinxi" style={{ fontSize: '28px', marginTop:'10px' }}/>
          </div>
        </div>
      </Popover>
      <div className={styles.biaozhu}>
        <div onClick={()=>{setShowTagBox(!showTagBox)}} title='标注' className={styles.biaozhuButton} 
            style={{backgroundColor: `${showTagBox ? 'rgba(37, 176, 229, .7)' : 'rgba(40, 49, 66, .6)'}`}}>
          <VIcon type="icon-biaozhu" style={{ fontSize: '28px', marginTop:'8px' }}/>
        </div>
      </div>
      <div className={styles.sliceList}>
        <div onClick={()=>{setShowSliceList(!showSliceList)}} title='切片列表' className={styles.sliceListButton}
            style={{backgroundColor: `${showSliceList ? 'rgba(37, 176, 229, .7)' : 'rgba(40, 49, 66, .6)'}`}}>
          <VIcon type="icon-list" style={{ fontSize: '28px', marginTop:'10px' }}/>
        </div>
      </div>
      <Popover
        content={<div style={{display:'flex'}}>
          <div onClick={() => {
              const projectId = localStorage.getItem('currentProject')
              history.push('/userHome/projects/' + projectId)
            }}
            title='返回上一页'
            className={styles.moreListIcon}
            style={{borderTopLeftRadius: '5px', borderBottomLeftRadius: '5px'}}>
            <VIcon type="icon-pre" style={{ fontSize: '18px'}}/>
          </div>
          <div onClick={() => history.push('/userHome/my-projects')}
              title='返回主界面'
              className={styles.moreListIcon}>
            <VIcon type="icon-home" style={{ fontSize: '18px'}}/>
          </div>
          <div onClick={() => {currentViewer.setFullScreen(true)}}
              title='全屏'
              className={styles.moreListIcon}
              style={{borderTopRightRadius: '5px', borderBottomRightRadius: '5px'}}>
            <VIcon type="icon-fullscreen" style={{ fontSize: '18px'}}/>
          </div>
        </div>}
        trigger="click"
        overlayClassName={styles.morePop}
        open={showMoreList}
        placement="right"
        onOpenChange={(newOpen)=>{setShowMoreList(newOpen)}}
      >
        <div className={styles.moreList}>
          <div onClick={()=>{setShowMoreList(!showMoreList)}} title='更多功能' className={styles.moreListButton}
              style={{backgroundColor: `${showMoreList ? 'rgba(37, 176, 229, .7)' : 'rgba(40, 49, 66, .6)'}`}}>
            <VIcon type="icon-more" style={{ fontSize: '28px', marginTop:'10px' }}/>
          </div>
        </div>
      </Popover>
      {/* <div className={styles.currentImgSize}>
        <b>视窗内图片大小: </b>
        {pathoViewSize.width} x {pathoViewSize.height}
      </div> */}
    </Spin>
  )
}

export default PathoTaggerSpace
