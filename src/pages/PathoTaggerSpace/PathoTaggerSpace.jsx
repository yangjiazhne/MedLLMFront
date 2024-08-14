// 临时测试用projectId: ff8081818dfe6c76018e227861da0027

import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { VIcon } from '@/components'

import { hitShapeTypes, contorlTypes } from '@/constants'
import { Empty,message,Modal,Spin,Divider,Popover} from 'antd'

import useQuery from '@/hooks/useQuery'
import { searchGroup } from '@/request/actions/group'
import { searchImage, fetchImageTileInfo } from '@/request/actions/image'
import { searchProject } from '@/request/actions/project'
import { searchLLMTaskType } from '@/request/actions/task'
import { imgUploadPre } from '@/constants'
import { getCurrentResult } from './help'
import styles from './PathoTaggerSpace.module.scss'
import { RightBar, CanvasAnnotator, SliceList, SideLLMChatWindow, ResultListWindow } from './components'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import useDidUpdateEffect from '@/hooks/useDidUpdateEffect'

const PathoTaggerSpace = () => {
  let queryInfo = useQuery()
  const dispatch = useDispatch()
  let history = useHistory()
  const {
    projectDetails, //项目详情
    currentGroupImages,
    currentGroup, // 当前组
    currentImage, // 当前选中的图像
    pathoImgInfo, // 病理图片信息
    currentCanvas, //当前画布canvas
    currentViewer, 
    pathoViewSize, //当前标记图片的视窗大小
  } = useSelector(
    // @ts-ignore
    state => state.project
  )
  // @ts-ignore
  let { projectId } = useParams()
  const currentProjectPid = projectId
  const [projectHitsFetchEnd, setProjectHitsFetchEnd] = useState(false) // 项目标记信息获取完成标记
  const [loading, setLoading] = useState(false) // 加载状态
  const [changeSession, setChangeSession] = useState(false) // 是否有未保存的标记信息

  const [showTagBox, setShowTagBox] = useState(false)
  const [showSliceList, setShowSliceList] = useState(false)
  const [showMoreList, setShowMoreList] = useState(false)
  const [showSliceInfoBox, setShowSliceInfoBox] = useState(false)

  const [searchValue, setSearchValue] = useState('')  //搜索框
  const [currentPage, setCurrentPage] = useState(1)   //控制当前页数
  const [currentPageSize, setCurrentPageSize] = useState(8)   //每页显示数据集个数

  //获取所有需要的项目信息
  const fetchData = async () => {

    if (currentProjectPid) {
      setLoading(true)
      // 获取项目基本信息
      const detailRes = await searchProject(currentProjectPid)

      await dispatch({
        type: 'UPDATE_PROJECT_DETAIL',
        payload: detailRes.data.content[0],
      })

      const page = currentPage - 1
      const size = currentPageSize

      // 获取项目当前分页的组
      const projectGroupsRes= await searchGroup(currentProjectPid,null,null,null,page,size)
      dispatch({
        type: 'UPDATE_CURRENT_PROJECT_GROUPS',
        payload: projectGroupsRes.data.content,
      })
      const totalpages = Math.floor(projectGroupsRes.data.totalElements / currentPageSize) + 1
      dispatch({
        type: 'UPDATE_CURRENT_GROUP_LENGTH',
        payload: totalpages,
      })
      dispatch({
        type: 'UPDATE_CURRENT_GROUP',
        payload: projectGroupsRes.data.content[0],
      })

      // 获取index为0的组下所有的图片信息
      const imageRes = await searchImage(projectGroupsRes.data.content[0].imageGroupId)
      dispatch({
        type: 'UPDATE_CURRENT_GROUP_IMAGES',
        payload: imageRes.data.content
      })

      //当前分组下有图像
      if(imageRes.data.content.length !== 0){
        //当前hit为索引为0的图片
        dispatch({
          type: 'UPDATE_CURRENT_IMAGE',
          payload: imageRes.data.content[0],
        })
      }

      //获取病理图信息
      const pathoImageInfo = await fetchImageTileInfo(24,25)
      dispatch({
        type: 'UPDATE_PROJECT_PATHOIMGINFO',
        payload: pathoImageInfo,
      })

      // 获取任务列表
      const taskList = await searchLLMTaskType()
      dispatch({
        type: 'UPDATE_CURRENT_LLM_TASK_TYPE',
        payload: taskList.data
      })

      setProjectHitsFetchEnd(true)

      // 设置标注页面初始状态
      dispatch({
        type: 'UPDATE_CURRENT_CONTROL_TYPE',
        payload: 'drag',
      })

      setLoading(false)
    }
  }

  const fetchGroupData = async() => {
    const page = currentPage - 1
    const size = currentPageSize

    // 获取项目当前分页的组
    const projectGroupsRes= await searchGroup(currentProjectPid,null,searchValue,null,page,size)
    dispatch({
      type: 'UPDATE_CURRENT_PROJECT_GROUPS',
      payload: projectGroupsRes.data.content,
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

  //切换搜索词时，页数重置为1
  useDidUpdateEffect(() => {
    if (currentPage !== 1) setCurrentPage(1)
    else fetchGroupData()
  }, [searchValue])

  useDidUpdateEffect(() => {
    fetchGroupData()
  }, [currentPage, currentPageSize])

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
    }else{
      dispatch({
        type: 'UPDATE_CURRENT_CONTROL_TYPE',
        payload: contorlTypes.DRAG,
      })
      dispatch({
        type: 'UPDATE_CURRENT_SHAPE',
        payload: hitShapeTypes.NONE,
      })
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


  // const handleChangeHitStatus = async action => {
  //   const result = getCurrentResult(currentCanvas)

  //   let _hitResid = -1
  //   const projectHit = projectHits[0]
  //   if (projectHit.hitResults && projectHit.hitResults[0]) _hitResid = projectHit.hitResults[0].id

  //   const postData = {
  //     hitResId: _hitResid,
  //     hitId: projectHit.id,
  //     pid: projectDetails.id,
  //     status: '',
  //     result: result,
  //   }
  //   let res
  //   switch (action) {
  //     case 'saveTempHit':
  //       postData.status = 'notDone'
  //       res = await updateHitStatus(postData)
  //       break
  //     case 'saveToDone':
  //       // 保存标注信息并to done
  //       postData.status = 'done'
  //       res = await updateHitStatus(postData)
  //       break
  //   }
  //   if (res && !res.err) {
  //     if (action !== 'logResult') {
  //       setChangeSession(false)
  //       if (action !== 'saveToDone') {
  //         setIsEdit(false)
  //       }
  //     }
  //   } else {
  //     message.error(res.data)
  //   }
  // }



  // if (!projectHits) {
  //   return null
  // }

  const [LLMChatHistory, setLLMChatHistoryInner] = useState([])
  const LLMChatHistoryTmp = useRef([])
  const setLLMChatHistory = function(res) {
    LLMChatHistoryTmp.current = [...res]
    setLLMChatHistoryInner(res)
  }
  
  // useEffect(() => (setLLMChatHistory([
  //   {
  //     id: 0,
  //     role: "user",
  //     msg: "This is a message from user side."
  //   }, {
  //     id: 1,
  //     role: "assistant",
  //     msg: "This is a message from LLM side."
  //   }, {
  //     id: 2,
  //     role: "assistant",
  //     msg: "This is a message from LLM side and clickable.",
  //     click: true
  //   }
  // ])), [])

  const appendChatContent = function (msg, role="user", click=false) {
    let chatHistory = LLMChatHistoryTmp.current
    let maxId = -1
    for(let chatItem of chatHistory) {
      maxId = Math.max(chatItem.id, maxId)
    }
    let thisChat = {
      id: maxId,
      role,
      msg,
      click
    }
    chatHistory.push(thisChat)
    setLLMChatHistory(chatHistory)
  }

  const onMessageCallback = function (content) {
    console.log("get message send callback", content)
    appendChatContent(content)
    appendChatContent(`LLM reply of \"${content}\"`, "assistant", content.indexOf("click") !== -1)
  }

  const onMessageClick = function (message) {
    console.log("get message clicked", message)
  }

  const [resultBtnList, setResultBtnList] = useState([])
  const onBtnClick = function (resItem) {
    console.log("resItem clicked", resItem)
  }

  useEffect(() => {
    setResultBtnList([
      {
        type: 'primary',
        text: '分级：xxx&xx分期'
      }, {
        type: 'warning',
        text: '分型：粗粱型&xxx'
      }, {
        type: 'base',
        text: 'MVI：10个'
      }, {
        type: 'base',
        text: '预后：5年生存期',
        borderColor: 'green'
      }, {
        type: 'primary',
        text: '分级：xxx&xx分期'
      }, 
      // {
      //   type: 'warning',
      //   text: '分型：粗粱型&xxx'
      // }, {
      //   type: 'base',
      //   text: 'MVI：10个'
      // }, {
      //   type: 'base',
      //   text: '预后：5年生存期',
      //   borderColor: 'green'
      // },{
      //   type: 'primary',
      //   text: '分级：xxx&xx分期'
      // }, {
      //   type: 'warning',
      //   text: '分型：粗粱型&xxx'
      // }, {
      //   type: 'base',
      //   text: 'MVI：10个'
      // }, {
      //   type: 'base',
      //   text: '预后：5年生存期',
      //   borderColor: 'green'
      // },
    ])
  }, []);

  return (
    <Spin spinning={loading}>
      {projectHitsFetchEnd && (
        <div className={styles.container}>
          {showTagBox && 
              <RightBar
                setShowTagBox={setShowTagBox}
              />}
          {showSliceList && (
                <SliceList
                  setShowSliceList={setShowSliceList}
                  setSearchValue={setSearchValue}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  setCurrentPageSize={setCurrentPageSize}
                />
          )}
          <div className={styles.viewContainer}>
            {pathoImgInfo.url !== '' && (
              <>
                <CanvasAnnotator
                  setChangeSession={setChangeSession}
                />
              
                <ResultListWindow btnList={resultBtnList} onBtnClick={onBtnClick}/>
                <SideLLMChatWindow
                    chatHistory={LLMChatHistory}
                    onMessageSend={onMessageCallback}
                    onMessageClick={onMessageClick}
                >
                </SideLLMChatWindow>
              </>
            )}
          </div>
        </div>
      )}

      {projectHitsFetchEnd && (
        <>
          {pathoImgInfo.url !== '' && (
            <>
              <Popover
                  content={<div style={{width: '250px', backgroundColor: '#272b33', padding:'10px', color: '#fff'}}>
                    <p><b>切片信息 </b></p>
                    <Divider style={{ marginTop: '0', marginBottom: '5px', backgroundColor: '#354052' }} />
                    <p style={{ wordWrap: 'break-word', marginBottom: '4px' }}>
                      <b>文件名: </b>
                      {currentImage.imageName}
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
            </>
          )}
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
        </>
      )}
      {/* <div className={styles.currentImgSize}>
        <b>视窗内图片大小: </b>
        {pathoViewSize.width} x {pathoViewSize.height}
      </div> */}
    </Spin>
  )
}

export default PathoTaggerSpace
