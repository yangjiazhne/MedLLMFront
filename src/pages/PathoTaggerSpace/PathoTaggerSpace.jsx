import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { VIcon } from '@/components'

import { hitShapeTypes, contorlTypes } from '@/constants'
import { Empty,message,Modal,Spin,Divider,Popover,Button,Progress } from 'antd'

import useQuery from '@/hooks/useQuery'
import { searchGroup } from '@/request/actions/group'
import { searchImage, fetchImageTileInfo } from '@/request/actions/image'
import { searchProject } from '@/request/actions/project'
import { searchSession } from '@/request/actions/session'
import { liveQA, searchLLMTaskType } from '@/request/actions/task'
import { SERVER_WS } from '@/constants'
import { getCurrentResult, renderModelInfer } from './help'
import styles from './PathoTaggerSpace.module.scss'
import { RightBar, CanvasAnnotator, SliceList, SideLLMChatWindow, ResultListWindow, DraggableWindow } from './components'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Stomp, Client } from '@stomp/stompjs';
import { getToken } from '@/helpers/dthelper'
import useDidUpdateEffect from '@/hooks/useDidUpdateEffect'
import { logOut } from '@/helpers/Utils'
import { useTranslation } from 'react-i18next';

const PathoTaggerSpace = () => {
  let queryInfo = useQuery()
  const dispatch = useDispatch()
  let history = useHistory()
  const { t, i18n } = useTranslation()
  const {
    projectDetails, //项目详情
    currentGroupImages,
    currentGroup, // 当前组
    currentImage, // 当前选中的图像
    pathoImgInfo, // 病理图片信息
    currentCanvas, //当前画布canvas
    currentViewer, 
    currentQuestion,
    defaultGroupInfo,
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

  const [isQuestion, setIsQuestion] = useState(false)
  const [historyChat, setHistoryChat] = useState([])
  const [isClickGetHistory, setIsClickGetHistory] = useState(false)
  const [newMessageReminderShow, setNewMessageReminderShow] = useState(false)
  const [isWaitAnswer, setIsWaitAnswer] = useState(false)

  const [searchValue, setSearchValue] = useState('')  //搜索框
  const [currentPage, setCurrentPage] = useState(1)   //控制当前页数
  const [currentPageSize, setCurrentPageSize] = useState(8)   //每页显示数据集个数

  const [progress, setProgress] = useState(0);  //数据集转化进度

  // 从 localStorage 加载保存的语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'zh'; // 默认语言为中文
    i18n.changeLanguage(savedLanguage);
  }, [i18n]);

  //获取所有需要的项目信息
  const fetchData = async () => {

    if (currentProjectPid) {
      setLoading(true)
      // 获取项目基本信息
      const detailRes = await searchProject(currentProjectPid)

      if(detailRes.err){
        Modal.error({
          title: '提示',
          content: '您的登录已过期，请重新登陆',
          onOk: () => logOut(history),
        })
      }

      await dispatch({
        type: 'UPDATE_PROJECT_DETAIL',
        payload: detailRes.data.content[0],
      })

      let page
      if(defaultGroupInfo){
        setCurrentPage(defaultGroupInfo.page + 1)
        page = defaultGroupInfo.page
      }else{
        page = currentPage - 1
      }

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

      let imageRes

      if(defaultGroupInfo){
        dispatch({
          type: 'UPDATE_CURRENT_GROUP',
          payload: defaultGroupInfo.group,
        })
        // 获取index为0的组下所有的图片信息
        imageRes = await searchImage(defaultGroupInfo.group.imageGroupId)
        dispatch({
          type: 'UPDATE_CURRENT_GROUP_IMAGES',
          payload: imageRes.data.content
        })
      }else{
        dispatch({
          type: 'UPDATE_CURRENT_GROUP',
          payload: projectGroupsRes.data.content[0],
        })
  
        // 获取index为0的组下所有的图片信息
        imageRes = await searchImage(projectGroupsRes.data.content[0].imageGroupId)
        dispatch({
          type: 'UPDATE_CURRENT_GROUP_IMAGES',
          payload: imageRes.data.content
        })
      }

      //当前分组下有图像
      if(imageRes.data.content.length !== 0){
        // 获取session信息
        //获取历史会话
        const sessionListRes = await searchSession(imageRes.data.content[0].imageId)

        imageRes.data.content[0].status = sessionListRes.data[0].status

        if(sessionListRes.data.length > 0){
          const sessionList = sessionListRes.data[0].qaPairHistoryList.map(item => [
            {
              role: "user",
              msg: item.question,
            },
            {
              role: "assistant",
              msg: item.answer,
              visualResult: item.visualResult,
              region: item.region
            }
          ]).reduce((acc, curr) => acc.concat(curr), []);

          setHistoryChat(sessionList)
        }

        //当前hit为索引为0的图片
        dispatch({
          type: 'UPDATE_CURRENT_IMAGE',
          payload: imageRes.data.content[0],
        })
        //获取病理图信息
        try{
          const pathoImageInfo = await fetchImageTileInfo(projectId,imageRes.data.content[0].imageId)
          dispatch({
            type: 'UPDATE_PROJECT_PATHOIMGINFO',
            payload: pathoImageInfo,
          })
        }catch (error) {
          dispatch({
            type: 'UPDATE_PROJECT_PATHOIMGINFO',
            payload: {
              url: '',
              overlap: '',
              tileSize: '',
              format: '',
              size: {
                width: 0,
                height: 0,
              },
            }
          })
        }
      }
      
      // 获取任务列表
      const taskList = await searchLLMTaskType()
      const updatedTasks = taskList.data.map(task => {
        switch (task.llmTaskTypeId) {
            case 2:
                task.llmTaskTypeName = "PathoSpace.preInferResult.lesion"
                break;
            case 3:
                task.llmTaskTypeName = "PathoSpace.preInferResult.vascular"
                break;
            case 4:
                task.llmTaskTypeName = "PathoSpace.preInferResult.neural"
                break;
            case 5:
                task.llmTaskTypeName = "PathoSpace.preInferResult.lymphatic"
                break;
            case 6:
                task.llmTaskTypeName = "PathoSpace.preInferResult.hepatic"
                break;
            case 7:
                task.llmTaskTypeName = "PathoSpace.preInferResult.cell"
                break;
            default:
                // 保持原值不变
                break;
        }
        return task;
    });
      dispatch({
        type: 'UPDATE_CURRENT_LLM_TASK_TYPE',
        payload: updatedTasks
      })

      if(defaultGroupInfo){
        dispatch({
          type: 'UPDATE_DEFAULT_GROUP_INFO',
          payload: null
        })
      }

      setProjectHitsFetchEnd(true)

      // 设置标注页面初始状态
      dispatch({
        type: 'UPDATE_CURRENT_CONTROL_TYPE',
        payload: 'drag',
      })

      setLoading(false)
    }
  }

  const refreshImage = async (imageId) => {

    //获取历史会话
    const sessionListRes = await searchSession(imageId)

    const image = currentImage

    image.status = sessionListRes.data[0].status

    dispatch({
      type: 'UPDATE_CURRENT_IMAGE',
      payload: image,
    })

    const pathoImageInfo = await fetchImageTileInfo(projectId, imageId)
    dispatch({
        type: 'UPDATE_PROJECT_PATHOIMGINFO',
        payload: pathoImageInfo,
    })
  }

  const fetchMetaDataXML = async (imageId) => {
    try{
      const pathoImageInfo = await fetchImageTileInfo(projectId,imageId)
      dispatch({
        type: 'UPDATE_PROJECT_PATHOIMGINFO',
        payload: pathoImageInfo,
      })
    }catch (error) {
      
    }
  }

  useDidUpdateEffect(() => {
    if(pathoImgInfo.url === ''){
      fetchMetaDataXML(currentImage.imageId)
    }
  },[progress])

  useEffect(() => {
    if(currentImage?.status === 0 || currentImage?.status === 1){
      setProgress(0)
      const userToken = getToken()

      const stompClient = Stomp.over(function () {
        return new WebSocket((`${SERVER_WS}task-progress?token=${encodeURIComponent(userToken)}`))
      })

      stompClient.debug = () => {}   //让控制台不输出多余的调试信息

      let subscription;
      
      const taskId = `medllm_pathology_image_convert_${currentImage.imageId}`

      // 连接到 WebSocket 服务器
      stompClient.connect({}, frame => {
        // 订阅特定任务的进度
        subscription = stompClient.subscribe(`/topic/task_progress/${taskId}`, message => {
          const data = JSON.parse(message.body);
          console.log(data)
          setProgress(Math.round(data.progress * 100))
          if(data.result !== ''){
            refreshImage(currentImage.imageId)
          }
        });
      }, error => {
        console.error('WebSocket connection error:', error);
      });

      // 清理函数
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
        if (stompClient) {
          stompClient.disconnect();
        }
      }
    }
  }, [currentImage])

  const fetchSession = async () => {
      //获取历史会话
      const sessionListRes = await searchSession(currentImage.imageId)

      currentImage.status = sessionListRes.data[0].status

      if(sessionListRes.data.length > 0){
        const sessionList = sessionListRes.data[0].qaPairHistoryList.map(item => [
          {
            role: "user",
            msg: item.question,
          },
          {
            role: "assistant",
            msg: item.answer,
            visualResult: item.visualResult,
            region: item.region
          }
        ]).reduce((acc, curr) => acc.concat(curr), []);

        setHistoryChat(sessionList)
      }
  }

  // 获取历史记录并将其存到现有聊天记录之前
  const appendChatHistory = () => {
    // 将获取到的历史记录存储到现有聊天记录之前
    setLLMChatHistory([...historyChat, ...LLMChatHistoryTmp.current]);
  };

  const fetchGroupData = async() => {
    if(!loading){
      const page = currentPage - 1
      const size = currentPageSize
  
      // 获取项目当前分页的组
      const projectGroupsRes= await searchGroup(currentProjectPid,null,searchValue,null,page,size)
      dispatch({
        type: 'UPDATE_CURRENT_PROJECT_GROUPS',
        payload: projectGroupsRes.data.content,
      })
    }
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

  const fetchLLmAnswer = async (content) => {
    setIsQuestion(false)
    setIsWaitAnswer(true)

    const activeObject = currentCanvas.getActiveObject()

    let res;
    let width, height, top, left;

    if(activeObject){
      const scale = pathoImgInfo.size.width / 1000

      width = activeObject.width * scale
      height = activeObject.height * scale
      top = activeObject.top * scale
      left = activeObject.left * scale

      res = await liveQA({
        "llmTaskTypeId": 1,
        "imageId": currentImage.imageId,
        "question": content,
        "left": left,
        "top": top,
        "width": width,
        "height": height
      })
    }else{
      width = pathoImgInfo.size.width
      height = pathoImgInfo.size.height
      top = 0
      left = 0
      res = await liveQA({
        "llmTaskTypeId": 1,
        "imageId": currentImage.imageId,
        "question": content,
        "left": left,
        "top": top,
        "width": width,
        "height": height
      })
    }

    setIsWaitAnswer(false)
    appendChatContent(res.data.answer, "assistant", res.data.visualResult, res.data.region)

    const scale = 1000 / pathoImgInfo.size.width

    if(res.data.visualResult.length > 0){
      renderModelInfer(res.data.visualResult, scale, "#00FF00", dispatch)
    }

  }

  const isDrawRegion = (content) => {
    Modal.confirm({
      content: '是否框选区域进行提问？',
      okText: '是',
      cancelText: '否',
      onOk: () => {
        setShowTagBox(false)
        setShowSliceList(false)
        setShowMoreList(false)
        setShowSliceInfoBox(false)
        dispatch({
          type: 'UPDATE_CURRENT_SHAPE',
          payload: hitShapeTypes.LLMREGION,
        })
        dispatch({
          type: 'UPDATE_CURRENT_CONTROL_TYPE',
          payload: contorlTypes.DEFAULT,
        })
        message.info("请框选一个区域")
      },
      onCancel: () => {
        fetchLLmAnswer(content)
      },
    })
  }

  const appendChatContent = function (msg, role="user", visualResult, region) {
    let chatHistory = LLMChatHistoryTmp.current
    let maxId = -1
    for(let chatItem of chatHistory) {
      maxId = Math.max(chatItem.id, maxId)
    }
    let thisChat = {
      id: maxId,
      role,
      msg,
      visualResult,
      region
    }
    chatHistory.push(thisChat)
    setLLMChatHistory(chatHistory)
  }

  const onMessageCallback = function (content) {
    setIsQuestion(true)
    dispatch({
      type: 'UPDATE_CURRENT_QUESTION',
      payload: content
    })
    // isDrawRegion(content)
    appendChatContent(content)
    fetchLLmAnswer(content)
  }

  const onMessageClick = function (message) {
    const scale = 1000 / pathoImgInfo.size.width

    if(message.region.height !== Number(pathoImgInfo.size.height) && message.region.width !== Number(pathoImgInfo.size.width)){
      renderModelInfer([message.region], scale, "#00FF00", dispatch)
    }

    if(message.visualResult.length > 0){
      renderModelInfer(message.visualResult, scale, "#00FF00", dispatch)
    }
  }

  const [resultBtnList, setResultBtnList] = useState([])
  const onBtnClick = async (resItem) => {
    appendChatContent(resItem.item.prompt)
    setIsWaitAnswer(true)
    const width = pathoImgInfo.size.width
    const height = pathoImgInfo.size.height
    const top = 0
    const left = 0
    const res = await liveQA({
        "llmTaskTypeId": resItem.item.llmTaskTypeId,
        "imageId": currentImage.imageId,
        "question": resItem.item.prompt,
        "left": left,
        "top": top,
        "width": width,
        "height": height
      })
    setIsWaitAnswer(false)
    appendChatContent(res.data.answer, "assistant", res.data.visualResult, res.data.region)
    const scale = 1000 / pathoImgInfo.size.width

    if(res.data.visualResult.length > 0){
      renderModelInfer(res.data.visualResult, scale, "#00FF00", dispatch)
    }

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
                  setHistoryChat={setHistoryChat}
                  setLLMChatHistory={setLLMChatHistory}
                  setIsClickGetHistory={setIsClickGetHistory}
                  setNewMessageReminderShow={setNewMessageReminderShow}
                />
          )}
          {pathoImgInfo.url !== '' && (<div className={styles.viewContainer}>
                <CanvasAnnotator
                  setChangeSession={setChangeSession}
                  isQuestion={isQuestion}
                  setIsQuestion={setIsQuestion}
                  appendChatContent={appendChatContent}
                  setIsWaitAnswer={setIsWaitAnswer}
                />
              
                {(currentImage?.status === 3) &&(
                  <ResultListWindow btnList={resultBtnList} onBtnClick={onBtnClick}/>
                )}
                {(currentImage?.status === 2 || currentImage?.status === 3) && (
                  <>
                    <SideLLMChatWindow
                        chatHistory={LLMChatHistory}
                        onMessageSend={onMessageCallback}
                        onMessageClick={onMessageClick}
                        historyChat={historyChat}
                        appendChatHistory={appendChatHistory}
                        isClickGetHistory={isClickGetHistory}
                        setIsClickGetHistory={setIsClickGetHistory}
                        newMessageReminderShow={newMessageReminderShow}
                        setNewMessageReminderShow={setNewMessageReminderShow}
                        isWaitAnswer={isWaitAnswer}
                    >
                    </SideLLMChatWindow>
                    {/* <DraggableWindow
                      chatHistory={LLMChatHistory}
                      onMessageSend={onMessageCallback}
                      onMessageClick={onMessageClick}
                      historyChat={historyChat}
                      appendChatHistory={appendChatHistory}
                      isClickGetHistory={isClickGetHistory}
                      setIsClickGetHistory={setIsClickGetHistory}
                      newMessageReminderShow={newMessageReminderShow}
                      setNewMessageReminderShow={setNewMessageReminderShow}
                      isWaitAnswer={isWaitAnswer}
                    >
                    </DraggableWindow> */}
                  </>
                )}
          </div>)}
          {!currentImage && (
              <div style={{width: '100%', height: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Empty description={ <span>{t('PathoSpace.emptyText')}</span>} imageStyle={{height: 200, width:400}}>
                  <Button type="primary" onClick={()=>{setShowSliceList(true)}}>{t('PathoSpace.changeGroup')}</Button>
                </Empty>
              </div>
            )}
        </div>
      )}

      {projectHitsFetchEnd && (
        <>
          {pathoImgInfo.url !== '' && currentImage && (
            <>
              <Popover
                  content={<div style={{width: '250px', backgroundColor: '#272b33', padding:'10px', color: '#fff'}}>
                    <p><b>{t('PathoSpace.tagInfo.sliceInfo')} </b></p>
                    <Divider style={{ marginTop: '0', marginBottom: '5px', backgroundColor: '#354052' }} />
                    <p style={{ wordWrap: 'break-word', marginBottom: '4px' }}>
                      <b>{t('PathoSpace.tagInfo.FileName')} </b>
                      {currentImage.imageName}
                    </p>
                    <p style={{ marginBottom: '4px' }}>
                      <b>{t('PathoSpace.tagInfo.ImageSize')} </b>
                      {pathoImgInfo?.size?.width} x {pathoImgInfo?.size?.height}
                    </p>
                    <p style={{ marginBottom: '4px' }}>
                      <b>{t('PathoSpace.tagInfo.WindowSize')} </b>
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
                    <div onClick={()=>{ if(isQuestion){
                                           message.warning(t('PathoSpace.chooseArea'));
                                           return
                                        }
                                        setShowSliceInfoBox(!showSliceInfoBox)}} 
                          title={t('PathoSpace.tagInfo.sliceInfo')} className={styles.sliceInfoButton} 
                        style={{backgroundColor: `${showSliceInfoBox ? 'rgba(37, 176, 229, .7)' : 'rgba(40, 49, 66, .6)'}`}}>
                      <VIcon type="icon-binglixinxi" style={{ fontSize: '28px', marginTop:'10px' }}/>
                    </div>
                  </div>
              </Popover>
              {(currentImage?.status === 2 || currentImage?.status === 3) && (
                <div className={styles.biaozhu}>
                  <div onClick={()=>{if(isQuestion){
                                          message.warning(t('PathoSpace.chooseArea'));
                                          return
                                      }
                                    setShowTagBox(!showTagBox)}} 
                        title={t('PathoSpace.tagList.annotation')} className={styles.biaozhuButton} 
                      style={{backgroundColor: `${showTagBox ? 'rgba(37, 176, 229, .7)' : 'rgba(40, 49, 66, .6)'}`}}>
                    <VIcon type="icon-biaozhu" style={{ fontSize: '28px', marginTop:'8px' }}/>
                  </div>
                </div>
              )}
            </>
          )}
          <div className={styles.sliceList}>
            <div onClick={()=>{if(isQuestion){
                                    message.warning(t('PathoSpace.chooseArea'));
                                    return
                                }
                                setShowSliceList(!showSliceList)}} 
                  title={t('PathoSpace.sliceList.sliceList')} className={styles.sliceListButton}
                style={{backgroundColor: `${showSliceList ? 'rgba(37, 176, 229, .7)' : 'rgba(40, 49, 66, .6)'}`}}>
              <VIcon type="icon-list" style={{ fontSize: '28px', marginTop:'10px' }}/>
            </div>
          </div>
          <Popover
            content={<div style={{display:'flex'}}>
              <div onClick={() => {
                  const projectId = localStorage.getItem('currentProject')
                  history.push('/userHome/groups/' + projectId)
                }}
                title={t('PathoSpace.moreList.returnPrePage')}
                className={styles.moreListIcon}
                style={{borderTopLeftRadius: '5px', borderBottomLeftRadius: '5px'}}>
                <VIcon type="icon-pre" style={{ fontSize: '18px'}}/>
              </div>
              <div onClick={() => history.push('/userHome/my-projects')}
                  title={t('PathoSpace.moreList.returnHomePage')}
                  className={styles.moreListIcon}>
                <VIcon type="icon-home" style={{ fontSize: '18px'}}/>
              </div>
              {currentViewer && (
                <div onClick={() => {currentViewer.setFullScreen(true)}}
                    title={t('PathoSpace.moreList.fullScreen')}
                    className={styles.moreListIcon}
                    style={{borderTopRightRadius: '5px', borderBottomRightRadius: '5px'}}>
                  <VIcon type="icon-fullscreen" style={{ fontSize: '18px'}}/>
                </div>
              )}
            </div>}
            trigger="click"
            overlayClassName={styles.morePop}
            open={showMoreList}
            placement="right"
            onOpenChange={(newOpen)=>{setShowMoreList(newOpen)}}
          >
            <div className={styles.moreList}>
              <div onClick={()=>{if(isQuestion){
                                    message.warning(t('PathoSpace.chooseArea'));
                                    return
                                 }
                            setShowMoreList(!showMoreList)}} 
                   title={t('PathoSpace.moreList.moreFeatures')} className={styles.moreListButton}
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
      {(currentImage?.status === 0 || currentImage?.status === 1) && (
        <div className={styles.convertProgress}>
          <div style={{color:'#fff', fontWeight:'bold'}}>
            <span>{t('PathoSpace.progress')}</span>
            <Progress percent={progress} style={{width: '400px'}}/>
          </div>
        </div>
      )}
    </Spin>
  )
}

export default PathoTaggerSpace
