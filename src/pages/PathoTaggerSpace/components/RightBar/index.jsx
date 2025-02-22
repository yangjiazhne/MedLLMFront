import React, { useState, useEffect, useRef } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { iconBtns, shapes, controls, colors } from './config'
import styles from './index.module.scss'
import {
  Select,
  Tag,
  Input,
  Checkbox,
  Modal,
  Divider,
  message,
  Popover
} from 'antd'
import { ExclamationCircleOutlined, CloseOutlined } from '@ant-design/icons'
import { taskTypes, contorlTypes, hitShapeTypeLabels, hitShapeTypes} from '@/constants'
import { arraysEqualIgnoreOrder } from '@/helpers/Utils'
import { VButton, VIcon } from '@/components'
import { UPDATE_ISMUTITAG } from '@/redux/actionTypes'
import { HexColorPicker } from "react-colorful";
import OpenSeadragon from '@/lib/openseadragon-fabricjs-overlay/openseadragon-fabricjs-overlay'
import Draggable from 'react-draggable'; 
const { Option } = Select
import { useTranslation } from 'react-i18next';

const RightBar = ({ setShowTagBox }) => {
  const {
    currentColor,
    currentCanvas,
    currentShape,
    currentActiveObj,
    currentViewer,
    isMutiTag
  } = useSelector(
    // @ts-ignore
    state => state.project
  )
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { TextArea } = Input;
  const [customColor, setCustomColor] = useState('#d92bdd');
  const [isCustomColor, setIsCustomColor] = useState(false)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [taginfoValue, setTaginfoValue] = useState('')
  const [isTagInfoModalOpen, setIsTagInfModalOpen] = useState(false);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draggleRef = useRef(null);
  const onStart = (_event, uiData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  const handleTagInfoModalOk = () => {
    if(currentActiveObj.tagInfo){
      currentActiveObj.tagInfo = taginfoValue
    }else{
      currentActiveObj.set('tagInfo', taginfoValue);
    }
    setIsTagInfModalOpen(false);
    setTaginfoValue('')
    // 取消选中所有对象
    currentCanvas.discardActiveObject();
    // 设置当前对象为选中状态
    currentCanvas.setActiveObject(currentActiveObj);
    // 重新渲染画布
    currentCanvas.renderAll();
  };

  const handleColorPickerOpenChange = (newOpen) => {
    setColorPickerOpen(newOpen);
  };

  useEffect(() => {
    if(isCustomColor){
      dispatch({
        type: 'UPDATE_CURRENT_COLOR',
        payload: customColor,
      })
    }
  }, [customColor])

  // const clearAllObjects = () => {
  //   Modal.confirm({
  //     title: '提示',
  //     icon: <ExclamationCircleOutlined />,
  //     content: '是否清除所有标注信息?',
  //     okText: '是',
  //     cancelText: '否',
  //     onOk: () => {
  //       if (boundingBoxMap.length > 0) {
  //         dispatch({
  //           type: 'UPDATE_BOUNDING_BOX_MAP',
  //           payload: [],
  //         })
  //       }
  //       // 先清除画布上的标注，再重新渲染
  //       currentCanvas.remove(...currentCanvas.getObjects())
  //       currentCanvas.renderAll()
  //     },
  //   })
  // }

  // const reDoObjects = () => {
  //   Modal.confirm({
  //     title: '提示',
  //     icon: <ExclamationCircleOutlined />,
  //     content: '请确认修改GT标注信息',
  //     okText: '是',
  //     cancelText: '否',
  //     onOk() {
  //       setIsEdit(true)
  //     },
  //     onCancel() {
  //       // if (boundingBoxMap.length > 0) {
  //       //   dispatch({
  //       //     type: 'UPDATE_BOUNDING_BOX_MAP',
  //       //     payload: [],
  //       //   })
  //       // }
  //       // currentCanvas.remove(...currentCanvas.getObjects())
  //       // currentCanvas.renderAll()
  //       // setIsEdit(true)
  //     },
  //   })
  // }

  // const showReDoModal = () => {
  //   if (projectDetails.task_type.indexOf('IMAGE_CLASSIFICATION') !== -1) {
  //     setIsEdit(true)
  //   } else if (
  //     projectDetails.task_type.indexOf('IMAGE_SEGMENTATION') !== -1 ||
  //     projectDetails.task_type.indexOf('IMAGE_DETECTION') !== -1
  //   ) {
  //     reDoObjects()
  //   }
  //   dispatch({
  //     type: 'UPDATE_CURRENT_ENTITY',
  //     payload: entities[0],
  //   })
  // }

  const handelInfoValueChange = (event) => {
    if(event && event.target && event.target.value){
      let value = event.target.value;
      setTaginfoValue(value)
    }
  }

  // 绘制功能按钮生成方法
  const BtnDrawRender = ({ icon, label, title, onClick, active }) => {
    return (
      <div
        style={{ backgroundColor: active ? '#25b0e5' : '#56677d', width: '40px' }}
        onClick={onClick}
        className={styles.btnDrawWrap}
        title={title}
      >
        {icon}
        <span style={{ marginTop: '3px', fontSize: '10px' }}>{label}</span>
      </div>
    )
  }

  const onChangeMutiTag = (e) => {
    dispatch({
      type: 'UPDATE_ISMUTITAG',
      payload: e.target.checked,
    })
  }

  const selectObjectById = (id) => {
    // 查找具有指定 id 的对象
    const targetObject = currentCanvas.getObjects().find(obj => obj.id === id);
    // 如果找到了对象，则将其设置为选中状态
    if (targetObject) {
      // 取消选中所有对象
      currentCanvas.discardActiveObject();
      // 设置当前对象为选中状态
      currentCanvas.setActiveObject(targetObject);
      // 重新渲染画布
      currentCanvas.renderAll();

      const centerX = targetObject.left + targetObject.width / 2;
      const centerY = targetObject.top + targetObject.height / 2;

      const normalizedX = centerX / 1000;
      const normalizedY = centerY / 1000;

      currentViewer.viewport.panTo(new OpenSeadragon.Point(normalizedX, normalizedY));
    } 
  }

  const deleteActiveObj = () => {
    Modal.confirm({
      title: t('PathoSpace.deleteAnnotation.title'),
      icon: <ExclamationCircleOutlined />,
      content: t('PathoSpace.deleteAnnotation.content'),
      okText: t('PathoSpace.deleteAnnotation.okText'),
      cancelText: t('PathoSpace.deleteAnnotation.cancelText'),
      onOk: () => {
        currentCanvas.remove(currentActiveObj).requestRenderAll()
        // 维护boundingBoxMap数组
        // dispatch({
        //   type: 'UPDATE_BOUNDING_BOX_MAP',
        //   payload: boundingBoxMap.filter(box => box.id !== currentActiveObj.id),
        // })
      },
    })
  }

  return (
    <>
      <Draggable handle={`.${styles.tagHeader}`}
                bounds={bounds}
                onStart={(event, uiData) => onStart(event, uiData)}>
          <div className={styles.rightBar}  ref={draggleRef}>
            <div className={styles.innerContainer}>
              <div className={styles.tagHeader}>
                <p className={styles.partTitle}>{t('PathoSpace.tagList.annotation')}</p>
                <CloseOutlined onClick={()=>{setShowTagBox(false)}} style={{ fontSize: '20px' }}/>
              </div>
              <div className={styles.partContainer}>
                <div className={styles.tagContainer}>
                  <div className={styles.shapeHeader}>
                    <p className={styles.shapeTitle}>{t('PathoSpace.tagList.annotationMethods')}</p>
                    <Checkbox checked={isMutiTag} onChange={onChangeMutiTag} style={{color: isMutiTag ? 'rgb(33, 133, 208)' : 'inherit', fontSize: '12px'}}>{t('PathoSpace.tagList.MutiAnnotation')}</Checkbox>
                  </div>
                  <div className={styles.iconBtnWrap}>
                    {shapes.map((shape, index) => (
                      <BtnDrawRender
                        key={index}
                        active={currentShape === shape.value}
                        icon={shape.icon}
                        label={t(shape.label)}
                        title={t(shape.title)}
                        onClick={() => {
                          dispatch({
                            type: 'UPDATE_CURRENT_SHAPE',
                            payload: shape.value,
                          })
                          dispatch({
                            type: 'UPDATE_CURRENT_CONTROL_TYPE',
                            payload: contorlTypes.DEFAULT,
                          })
                        }}
                      />
                    ))}
                  </div>
                  <Divider style={{ marginTop: '10px', marginBottom: '0', backgroundColor: '#354052' }} />
                  <div className={styles.selectEntity}>
                    <p className={styles.subTitle}>{t('PathoSpace.tagList.chooseColor')}</p>
                    <div className={styles.entityWrap}>
                    {
                      colors.map((item, index) => (
                        <div
                          className={styles.entityItemWrap}
                          tabIndex={index}
                          key={item.value} 
                          id={item.value} 
                          style={{
                            backgroundColor: `${currentColor === item.value && !isCustomColor ? '#25b0e5' : '#56677d'}`,
                          }}
                          onClick={()=>{
                            setIsCustomColor(false)
                            dispatch({
                              type: 'UPDATE_CURRENT_COLOR',
                              payload: item.value,
                            })
                          }}
                        >
                          <span style={{ backgroundColor: item.value, width: '14px', height: '14px', margin: 'auto 10px'}}>
                          </span>
                          {t(item.label)}
                        </div>
                      ))
                    }
                      <Popover
                        content={<HexColorPicker color={customColor} onChange={setCustomColor}/>}
                        trigger="click"
                        placement="bottomLeft"
                        open={colorPickerOpen}
                        zIndex = {9999}
                        onOpenChange={handleColorPickerOpenChange}
                      >
                        <div className={styles.entityItemWrap} 
                              style={{
                                backgroundColor: `${currentColor === customColor && isCustomColor ? '#25b0e5' : '#56677d'}`,
                              }}
                              onClick={()=>{
                                setIsCustomColor(true)
                                dispatch({
                                  type: 'UPDATE_CURRENT_COLOR',
                                  payload: customColor,
                                })
                              }}>
                            <span style={{ backgroundColor: customColor, width: '14px', height: '14px', margin: 'auto 10px'}}>
                            </span>
                            {t('PathoSpace.tagList.custom')}
                        </div>
                      </Popover>
                    </div>
                  </div>
                </div>
                <Divider style={{ marginTop: '10px', marginBottom: '0' }} />
                <div className={styles.taggerList}>
                  <p className={styles.taggerListTitle}>{t('PathoSpace.tagList.annotationList')}</p>
                  <ul className={styles.taggerWrap}>
                    {currentCanvas.getObjects().map((annotation, index) => (
                      <li key={annotation.id} className={styles.taggerWrapItem}
                        style={{
                          backgroundColor: `${currentActiveObj?.id === annotation.id ? '#6c809a' : '#56677d'}`,
                        }}
                        onClick={()=>{selectObjectById(annotation.id)}}>
                        <p className={styles.taggerWrapItemContent}>
                          <div>
                            <span style={{marginRight: '20px'}}>{index + 1}</span>
                            <span>{t(hitShapeTypeLabels[annotation.shape])}</span>
                          </div>
                          <span className={styles.taggerWrapItemColor} style={{backgroundColor: annotation.color}}></span>
                        </p>
                        {currentActiveObj?.id === annotation.id && annotation.tagInfo &&
                        <div className={styles.taggerWrapItemInfo}>{annotation.tagInfo}</div>}
                        {currentActiveObj?.id === annotation.id && <p className={styles.taggerWrapItemOperate}>
                          <span className={styles.taggerWrapItemDelete} onClick={deleteActiveObj}>
                            <VIcon type="icon-shanchu" style={{ fontSize: '16px' }}/>
                          </span>
                          <span className={styles.taggerWrapItemText} onClick={()=>{setIsTagInfModalOpen(true)}}>
                            <VIcon type="icon-wenben" style={{ fontSize: '14px', marginRight:'2px' }}/>
                            {t('PathoSpace.tagList.remarks')}
                          </span>
                        </p>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Modal title={t('PathoSpace.tagList.annotationInfo')}
                    visible={isTagInfoModalOpen} 
                    onOk={handleTagInfoModalOk} 
                    onCancel={()=>{setIsTagInfModalOpen(false)}} 
                    destroyOnClose
                    okText={t('PathoSpace.tagList.save')}
                    cancelText={t('PathoSpace.tagList.cancel')}>
                <TextArea placeholder={t('PathoSpace.tagList.annotationInfoInput')}
                          showCount 
                          maxLength={100} 
                          onChange={handelInfoValueChange}
                          {...(currentActiveObj?.tagInfo ? { defaultValue: currentActiveObj.tagInfo } : {})}/>
              </Modal>
              {/* <div className={styles.iconBtnWrap}>
                {iconBtns(clearAllObjects, showReDoModal, saveRow, projectHits, space, isDone).map(
                  (btn, index) => {
                    if (btn.show)
                      return (
                        <div
                          key={index}
                          style={{
                            width: btn.width !== '' ? btn.width : '100px',
                            marginBottom: '10px',
                            textAlign: 'center',
                          }}
                        >
                          <VButton
                            color={btn.color}
                            style={{ width: '100px', padding: '0' }}
                            onClick={() => btn.onClick(history)}
                            disabled={btn.disabled}
                          >
                            {btn.title}
                          </VButton>
                        </div>
                      )
                  }
                )}
              </div> */}
            </div>
          </div>
      </Draggable>
    </>

  )
}

export default RightBar
