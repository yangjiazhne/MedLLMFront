/*
 * @Author: Azhou
 * @Date: 2021-06-21 15:11:53
 * @LastEditors: Azhou
 * @LastEditTime: 2022-03-01 15:49:54
 */
import React, { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { getModelList } from '@/request/actions/task'
import { useDispatch, useSelector } from 'react-redux'
import { getInferResult, getPathoSegRef } from '@/request/actions/tagger'
import { getUidToken } from '@/helpers/dthelper'
import { controls, iconBtns, shapes, segAlgos, desTra, desInte, desInfer } from './config'
import { renderModelInfer } from './help'
import styles from './index.module.scss'
import {
  Slider,
  Select,
  Tag,
  Input,
  Tooltip,
  Modal,
  Divider,
  Button,
  notification,
  Carousel,
  Drawer,
  message,
} from 'antd'
import { ExclamationCircleOutlined, CloseOutlined } from '@ant-design/icons'
import { hitShapeTypes, traPathGenerateWay, intePathGenerateWay, taskTypes } from '@/constants'
import { arraysEqualIgnoreOrder } from '@/helpers/Utils'
import { VButton, VIcon } from '@/components'

const { Option } = Select

const RightBar = ({ space, isDone, saveRow, setIsEdit, setShowTagBox, modelName }) => {
  const {
    projectHits, // 项目图片信息
    projectDetails, // 项目详情
    entities, //
    entityColorMap,
    classifyInfo,
    boundingBoxMap,
    strokeWidth,
    currentCanvas,
    currentEntity,
    currentShape,
    currentTraPathWay,
    currentIntePathWay,
    currentControlType,
    currentModelInfo,
    currentModelInference,
    pathoViewSize,
  } = useSelector(
    // @ts-ignore
    state => state.project
  )
  const dispatch = useDispatch()
  const history = useHistory()

  const [modelList, setModelList] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const [algorithmDesc, setAlgorithmDesc] = useState('')
  const showDrawer = type => {
    setAlgorithmDesc(type)
  }
  const onCloseDrawer = () => {
    setAlgorithmDesc('')
  }

  // 这里是获取模型列表的函数，暂时先不加入推理任务，前端先放在这里
  const fetchModelList = async () => {
    const res = await getModelList()
    if (!res.err) {
      const allModelList = res.data.data
      const tags = JSON.parse(projectDetails.taskRules).tags.split(',')
      // 筛选符合条件的model
      const availableModelList = allModelList.filter(model => {
        return (
          taskTypes[model.type].value === projectDetails.task_type &&
          arraysEqualIgnoreOrder(tags, model.labels)
        )
      })
      setModelList(availableModelList)
      if (availableModelList.length > 0) {
        dispatch({
          type: 'UPDATE_CURRENT_MODEL_INFERENCE',
          payload: availableModelList[0].modelName,
        })
      }
    }
  }

  useEffect(() => {
    fetchModelList()
  }, [projectDetails])

  const clearAllObjects = () => {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: '是否清除所有标注信息?',
      okText: '是',
      cancelText: '否',
      onOk: () => {
        if (boundingBoxMap.length > 0) {
          dispatch({
            type: 'UPDATE_BOUNDING_BOX_MAP',
            payload: [],
          })
        }
        // 先清除画布上的标注，再重新渲染
        currentCanvas.remove(...currentCanvas.getObjects())
        currentCanvas.renderAll()
      },
    })
  }

  const reDoObjects = () => {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: '请确认修改GT标注信息',
      okText: '是',
      cancelText: '否',
      onOk() {
        setIsEdit(true)
      },
      onCancel() {
        // if (boundingBoxMap.length > 0) {
        //   dispatch({
        //     type: 'UPDATE_BOUNDING_BOX_MAP',
        //     payload: [],
        //   })
        // }
        // currentCanvas.remove(...currentCanvas.getObjects())
        // currentCanvas.renderAll()
        // setIsEdit(true)
      },
    })
  }

  const showReDoModal = () => {
    if (projectDetails.task_type.indexOf('IMAGE_CLASSIFICATION') !== -1) {
      setIsEdit(true)
    } else if (
      projectDetails.task_type.indexOf('IMAGE_SEGMENTATION') !== -1 ||
      projectDetails.task_type.indexOf('IMAGE_DETECTION') !== -1
    ) {
      reDoObjects()
    }
    dispatch({
      type: 'UPDATE_CURRENT_ENTITY',
      payload: entities[0],
    })
  }
  // 更新控制方式
  const handleControlTypeChange = control => {
    dispatch({
      type: 'UPDATE_CURRENT_CONTROL_TYPE',
      payload: control.value,
    })
  }

  // const tagRender = props => {
  //   const { label, closable, onClose } = props
  //   const onPreventMouseDown = event => {
  //     event.preventDefault()
  //     event.stopPropagation()
  //   }
  //   return (
  //     <Tag
  //       color={entityColorMap[label]}
  //       onMouseDown={onPreventMouseDown}
  //       closable={closable}
  //       onClose={onClose}
  //       style={{ marginRight: 3 }}
  //     >
  //       {label}
  //     </Tag>
  //   )
  // }

  // 控制功能按钮生成方法
  const BtnCtrlRender = ({ icon, label, onClick, active }) => {
    return (
      <div
        style={{ backgroundColor: active ? '#2185d0' : 'grey', width: '50px' }}
        onClick={onClick}
        className={styles.btnCtrlWrap}
      >
        {icon}
        <span style={{ marginTop: '3px', fontSize: '10px' }}>{label}</span>
      </div>
    )
  }

  // 绘制功能按钮生成方法
  const BtnDrawRender = ({ icon, label, title, onClick, active }) => {
    return (
      <div
        style={{ backgroundColor: active ? '#2185d0' : 'grey', width: '40px' }}
        onClick={onClick}
        className={styles.btnDrawWrap}
        title={title}
      >
        {icon}
        <span style={{ marginTop: '3px', fontSize: '10px' }}>{label}</span>
      </div>
    )
  }

  // 交互式算法标注按钮生成方法
  const SegBtnDrawRender = ({ label, title, onClick, active }) => {
    return (
      <div
        style={{ backgroundColor: active ? '#2185d0' : 'grey', width: '80px', height: '30px' }}
        onClick={onClick}
        className={styles.btnDrawWrap}
        title={title}
      >
        <span style={{ fontSize: '14px' }}>{label}</span>
      </div>
    )
  }

  // 有关推理结果显示和选择的方法，目前没有完成
  const renderInferResult = async () => {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: '病理图整图推理所需时间较长（40分钟左右），推理任务进度以任务形式展示，是否继续？',
      okText: '是',
      cancelText: '否',
      onOk: async () => {
        // 这里需要做成假的，首先要构造一个任务，显示一个假进度条
        const { uid, token } = getUidToken()
        const data = {
          uid: uid,
          modelName: currentModelInference,
          datasetName: projectDetails.name,
          projectId: projectDetails.id,
          tasktype:
            taskTypes[modelList?.find(model => model.modelName === currentModelInference)?.type]
              ?.label,
        }
        const res = await getPathoSegRef(data)
        if (res.err) {
          message.error('推理任务创建失败: ' + res.data)
        } else {
          message.success('推理任务创建成功')
          Modal.confirm({
            title: '提示',
            icon: <ExclamationCircleOutlined />,
            content: '推理任务创建成功，是否前往任务中心查看任务进度？',
            okText: '是',
            cancelText: '否',
            onOk: () => {
              history.push(`/userHome/task-list`)
            },
          })
        }
      },
    })
  }

  const getInferclass = () => {
    //dispatch({
    //  type: 'UPDATE_CURRENT_CLASSIFY_INFO',
    //  payload: {
    //    ...classifyInfo,
    //   label: classRes.label,
    //  },
    //})
    console.log('尚未完成')
  }

  return (
    <div className={styles.rightBar}>
      <div className={styles.innerContainer}>
        <div className={styles.partContainer}>
          <p className={styles.partTitle}>标注</p>
          <CloseOutlined />
          <p className={styles.subTitle}>画布控制</p>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {controls.map(control => (
              <BtnCtrlRender
                key={control.label}
                active={currentControlType === control.value}
                icon={control.icon}
                label={control.label}
                onClick={() => handleControlTypeChange(control)}
              />
            ))}
          </div>
          <Divider style={{ marginTop: '10px', marginBottom: '0' }} />
          {true && (
            <div className={styles.selectEntity}>
              <p className={styles.subTitle}>{space ? '选择类别' : '类别列表'}</p>
              <Input
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                placeholder="搜索类别标签"
                allowClear
              />
              <div className={styles.entityWrap}>
                {Object.keys(entityColorMap).map((item, index) => {
                  if (
                    searchQuery.length === 0 ||
                    item.toUpperCase().includes(searchQuery.toUpperCase())
                  )
                    return (
                      <div
                        className={styles.entityItemWrap}
                        onClick={() => {
                          if (space) {
                            dispatch({
                              type: 'UPDATE_CURRENT_ENTITY',
                              payload: currentEntity !== item ? item : '',
                            })
                          }
                        }}
                        tabIndex={index}
                        key={item}
                        id={item}
                        style={{
                          backgroundColor: `${currentEntity === item ? '#2185d0' : 'white'}`,
                        }}
                      >
                        <Tag
                          color={entityColorMap[item]}
                          style={{ marginLeft: '5px', marginRight: '5px' }}
                        >
                          {item}
                        </Tag>
                      </div>
                    )
                })}
              </div>
            </div>
          )}
          {space && <Divider style={{ marginTop: '10px', marginBottom: '0' }} />}
          {space && (
            <>
              <div>
                <p className={styles.subTitle}>标注方式</p>
                <p className={styles.subSubTitle}>手工标注</p>
                <div className={styles.iconBtnWrap}>
                  {shapes.map((shape, index) => (
                    <BtnDrawRender
                      key={index}
                      active={currentShape === shape.value}
                      icon={shape.icon}
                      label={shape.label}
                      title={shape.title}
                      onClick={() =>
                        dispatch({
                          type: 'UPDATE_CURRENT_SHAPE',
                          payload: shape.value,
                        })
                      }
                    />
                  ))}
                </div>
                <p className={styles.subSubTitle}>
                  交互式算法标注
                  <a className={styles.illustrate} onClick={() => showDrawer('交互式算法标注')}>
                    点击查看算法说明
                  </a>
                </p>
                <div className={styles.iconBtnWrap}>
                  {segAlgos.map((algorithm, index) => (
                    <SegBtnDrawRender
                      key={index}
                      active={currentShape === algorithm.value && currentIntePathWay === algorithm.algo }
                      label={algorithm.label}
                      title={algorithm.title}
                      onClick={() => {
                        dispatch({
                          type: 'UPDATE_CURRENT_INTEPATHWAY',
                          payload: algorithm.algo,
                        })
                        dispatch({
                          type: 'UPDATE_CURRENT_SHAPE',
                          payload: algorithm.value,
                        })
                      }}
                    />
                  ))}
                </div>
                {/* <div
                  style={{
                    backgroundColor: currentShape === hitShapeTypes.INTEPATH ? '#2185d0' : 'grey',
                  }}
                  className={styles.pathBtnWrap}
                >
                  <Select
                    value={currentIntePathWay}
                    bordered={false}
                    style={{ color: '#fff', width: '120px' }}
                    onChange={value => {
                      dispatch({
                        type: 'UPDATE_CURRENT_INTEPATHWAY',
                        payload: value,
                      })
                      dispatch({
                        type: 'UPDATE_CURRENT_SHAPE',
                        payload: hitShapeTypes.INTEPATH,
                      })
                    }}
                  >
                    {Object.keys(intePathGenerateWay).map(key => (
                      <Option value={intePathGenerateWay[key]} key={key}>
                        {intePathGenerateWay[key]}
                      </Option>
                    ))}
                  </Select>
                  <div
                    className={styles.pathDesc}
                    onClick={() => {
                      dispatch({
                        type: 'UPDATE_CURRENT_SHAPE',
                        payload: hitShapeTypes.INTEPATH,
                      })
                    }}
                  >
                    <VIcon type="icon-ManagePaths" style={{ marginRight: '5px' }} />
                    分割算法
                  </div>
                </div> */}
                {/* {modelList?.length > 0 && (
                  <div>
                    <p className={styles.subSubTitle}>
                      智能算法自动标注
                      <a
                        className={styles.illustrate}
                        onClick={() => showDrawer('智能算法自动标注')}
                      >
                        点击查看算法说明
                      </a>
                    </p>
                    <div
                      style={{
                        backgroundColor:
                          currentShape === hitShapeTypes.MODELINFERENCE ? '#2185d0' : 'grey',
                      }}
                      className={styles.pathBtnWrap}
                    >
                      <Select
                        value={currentModelInference}
                        bordered={false}
                        style={{ color: '#fff', width: '120px' }}
                        onChange={value => {
                          dispatch({
                            type: 'UPDATE_CURRENT_MODEL_INFERENCE',
                            payload: value,
                          })
                          dispatch({
                            type: 'UPDATE_CURRENT_SHAPE',
                            payload: hitShapeTypes.MODELINFERENCE,
                          })
                        }}
                      >
                        {modelList?.map(key => (
                          <Option value={key.modelName} key={key.modelName}>
                            {key.modelName}
                          </Option>
                        ))}
                      </Select>
                      <div
                        className={styles.pathDesc}
                        onClick={() =>
                          dispatch({
                            type: 'UPDATE_CURRENT_SHAPE',
                            payload: hitShapeTypes.MODELINFERENCE,
                          })
                        }
                      >
                        <VIcon type="icon-ManagePaths" style={{ marginRight: '5px' }} />
                        {
                          <div>
                            {
                              taskTypes[
                                modelList?.find(model => model.modelName === currentModelInference)
                                  ?.type
                              ]?.label
                            }
                            算法
                          </div>
                        }
                      </div>
                    </div>
                    {currentShape === hitShapeTypes.MODELINFERENCE && (
                      <Button
                        style={{ width: '70px', marginTop: '5px', padding: '0' }}
                        onClick={renderInferResult}
                      >
                        开始推理
                      </Button>
                    )}{' '}
                  </div>
                )} */}
              </div>
            </>
          )}
        </div>
        <Drawer
          title={algorithmDesc}
          placement="right"
          width={700}
          bodyStyle={{ marginBottom: '20px' }}
          onClose={onCloseDrawer}
          visible={algorithmDesc}
        >
          {algorithmDesc === '传统算法标注' && desTra()}
          {algorithmDesc === '交互式算法标注' && desInte()}
          {algorithmDesc === '智能算法自动标注' && desInfer(modelList)}
        </Drawer>
        <Divider style={{ marginTop: '10px', marginBottom: '0' }} />
        <div className={styles.iconBtnWrap}>
          {iconBtns(clearAllObjects, showReDoModal, saveRow, projectHits, space, isDone).map(
            (btn, index) => {
              if (btn.show)
                return (
                  <div
                    key={index}
                    style={{
                      width: btn.width !== '' ? btn.width : '120px',
                      marginBottom: '10px',
                      textAlign: 'center',
                    }}
                  >
                    <VButton
                      color={btn.color}
                      style={{ width: '120px' }}
                      onClick={() => btn.onClick(history)}
                      disabled={btn.disabled}
                    >
                      {btn.title}
                    </VButton>
                  </div>
                )
            }
          )}
        </div>
      </div>
    </div>
  )
}

export default RightBar
