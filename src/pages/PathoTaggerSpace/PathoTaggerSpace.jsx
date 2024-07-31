// 临时测试用projectId: ff8081818dfe6c76018e227861da0027

import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { VIcon } from '@/components'
import Draggable from 'react-draggable'; 
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
import { HomeOutlined, LeftOutlined } from '@ant-design/icons'

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
import { RightBar, CanvasAnnotator, DoneTopBar } from './components'
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

  const currentInferPaths = useRef([]) // 当前的模型推理结果，临时存储，每次返回时都要先清空上一次的所有路径

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

      var hitsData = []
      if (filterValue.status === 'al') {
        hitsData = (
          await fetchPathoProjectHits(currentProjectPid, {
            model: filterValue.model,
            hitStatus: 'notDone',
            hitResultStatus: 'al',
          })
        ).data.hits
      } else {
        hitsData = (
          await fetchPathoProjectHits(currentProjectPid, {
            model: filterValue.model,
            hitStatus: filterValue.status,
            hitResultStatus: filterValue.status,
          })
        ).data.hits
      }

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
    console.log(showTagBox)
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
        <div className={styles.container}>
            <div className={styles.infoContainer}>
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
            </div>
          {showTagBox && <Draggable>
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

      <div className={styles.biaozhu}>
        <div onClick={()=>{setShowTagBox(!showTagBox)}} title='标注' className={styles.biaozhuButton}>
          <VIcon type="icon-biaozhu" style={{ fontSize: '28px', marginTop:'8px' }}/>
        </div>
      </div>
    </Spin>
  )
}

export default PathoTaggerSpace
