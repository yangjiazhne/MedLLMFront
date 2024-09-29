import React, { useLayoutEffect, useEffect, useMemo, useRef, useState } from 'react'
import '@/lib/fabric/fabric'
import '@/lib/fabric/fabric_eraser_brush'
import { renderBoxMap, handleMultiPath } from './help'
import { useDispatch, useSelector } from 'react-redux'
import useQuery from '@/hooks/useQuery'
import { Button, Modal, Spin, Tooltip, message, Card, Input  } from 'antd'
import styles from './index.module.scss'
import { CheckOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { hitShapeTypes, contorlTypes, hitShapeTypeLabels } from '@/constants'
import { getDrawCursor } from './utils'
import { fabricObjAddEvent } from './fabricObjAddEvent'
import { generatePolygon } from './fabricObjAddEvent'
import { zoomHandler, animationEndHandler, animationHandler } from './handler'
import OpenSeadragon from '@/lib/openseadragon-fabricjs-overlay/openseadragon-fabricjs-overlay'
import { VIcon } from '@/components'
import { useTranslation } from 'react-i18next';
// @ts-ignore
const fabric = window.fabric
const { TextArea } = Input;
const zoomLevels = [
  { value: 40, className: styles.choose6 },
  { value: 20, className: styles.choose5 },
  { value: 10, className: styles.choose4 },
  { value: 4,  className: styles.choose3 },
  { value: 2,  className: styles.choose2 },
  { value: 1,  className: styles.choose1 },
];

const CanvasAnnotator = ({
  setChangeSession,
  isQuestion,
  setIsQuestion,
  appendChatContent,
  setIsWaitAnswer
}) => {
  // 初始化openSeadragon图片查看器
  // 初始化 openSeadragon
  const initOpenSeaDragon = () => {
    return OpenSeadragon({
      id: 'openSeaDragon',
      // 装有各种按钮名称的文件夹 images 地址，即库文件中的 images 文件夹
      prefixUrl: `${window.location.protocol}//${window.location.host}/openseadragon/images/`,

      // 是否显示导航控制
      showNavigationControl: false,
      // navigationControlAnchor: 'TOP_RIGHT',

      // 是否显示导航窗口
      showNavigator: true,
      autoHideControls: false,
      // 以下都是导航配置
      navigatorPosition: 'TOP_LEFT',
      navigatorAutoFade: false,
      navigatorHeight: '80px',
      navigatorWidth: '160px',
      navigatorBackground: '#fefefe',
      navigatorBorderColor: '#000000',
      navigatorDisplayRegionColor: '#FF0000',

      minScrollDeltaTime: 30,
      zoomPerSecond: 0.1,
      // 具体图像配置
      tileSources: {
        Image: {
          // 指令集
          xmlns: 'http://schemas.microsoft.com/deepzoom/2008',
          Url: pathoImgInfo.url,
          // 相邻图片直接重叠的像素值
          Overlap: pathoImgInfo.overlap,
          // 每张切片的大小
          TileSize: pathoImgInfo.tileSize,
          Format: pathoImgInfo.format,
          Size: {
            Width: pathoImgInfo.size.width,
            Height: pathoImgInfo.size.height,
          },
        },
      },
      // 至少 20% 显示在可视区域内
      visibilityRatio: 0.2,
      // 开启调试模式
      debugMode: false,
      // 是否允许水平拖动
      panHorizontal: true,
      // 初始化默认放大倍数，按home键也返回该层
      defaultZoomLevel: 1,
      // 最小允许放大倍数
      minZoomLevel: 0.7,
      // 最大允许放大倍数
      maxZoomLevel: 150,
      animationTime: 1, // 设置默认的动画时间为1秒
      // zoomInButton: 'zoom-in',
      // zoomOutButton: 'zoom-out',
      // // 设置鼠标单击不可放大
      gestureSettingsMouse: {
        clickToZoom: false,
      },
    })
  }

  const dispatch = useDispatch()

  // console.log(window.innerWidth, window.innerHeight)
  const {
    // currentHit,
    pathoImgInfo,
    projectHits,
    currentColor,
    currentShape,
    currentCanvas,
    currentActiveObj,
    currentControlType,
    currentImage,
    strokeWidth
  } = useSelector(
    // @ts-ignore
    state => state.project
  )

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const { t } = useTranslation()
  const [zooming, setZooming] = useState(false)
  const [viewer, setViewer] = useState(null) // 图片查看器
  // 注册的监听事件为闭包环境，拿不到useState中的最新值，故使用useRef
  // canvas全局的辅助变量
  const canvasInstance = useRef(null)
  const drawingObject = useRef(null) // 当前正在绘制的object 【矩形、圆形、多边形、自由绘制】 用于编辑
  const panningCanvas = useRef(false) // 是否正在拖动canvas

  const [loadingInfo, setLoadingInfo] = useState({ flag: true, text: '加载中...' })

  // 控制object的【删除、编辑】按钮的【位置、显示】
  const [position, setPosition] = useState({ left: 0, top: 0, display: 'none', type: '' })

  const firstClick = useRef(true) // 是否是第一次点击
  // 绘制矩形的辅助变量
  const drawingRect = useRef(false) // 是否正在绘制矩形
  const mouseFrom = useRef({ x: 0, y: 0 }) // 绘制矩形/圆形/椭圆形时鼠标的起点位置
  const moveCount = useRef(1) // 计数器，用于减少绘制矩形时页面刷新的频率

  // 绘制圆形的辅助变量
  const drawingCircle = useRef(false)  //是否正在绘制圆形

  // 绘制椭圆形的辅助变量
  const drawingEllipse = useRef(false)  //是否正在绘制椭圆形

  // 绘制多边形路径的辅助变量
  const drawingPolygonPath = useRef(false)  //是否正在绘制多边形路径

  // 绘制多边形的辅助变量
  const drawingPolygon = useRef(false) // 是否正在绘制多边形
  const polygonPoints = useRef([]) // 当前绘制的polygon的点数组
  const tempLineArr = useRef([]) // 当前绘制的polygon的临时线数组【polygon绘制完成后要从页面清除】
  const tempActiveLine = useRef(null) // 绘制polygon时正在绘制的线

  // 绘制自由形状的辅助变量
  const tempInObject = useRef(false) // 当前鼠标临时位于的object
  const pathGroupArr = useRef([]) // 当前绘制的自由形状的路径数组【自由形状绘制完成后要从页面清除】 【多条路径】

  // const [currentZoomLevel, setCurrentZoomLevel] = useState(1) // 当前放大倍数

  const [taginfoValue, setTaginfoValue] = useState('')
  const [isTagInfoModalOpen, setIsTagInfModalOpen] = useState(false);
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
  const handelInfoValueChange = (event) => {
    if(event && event.target && event.target.value){
      let value = event.target.value;
      setTaginfoValue(value)
    }
  }

  // 初始化openSeadragon 图片查看器  和  canvas overlay
  useLayoutEffect(() => {
    const _viewer = initOpenSeaDragon()
    setViewer(_viewer)
    dispatch({
      type: 'UPDATE_CURRENT_VIEWER',
      payload: _viewer,
    })

    //@ts-ignore
    const overlay = _viewer.fabricjsOverlay({
      scale: 1000,
    })
    canvasInstance.current = overlay.fabricCanvas()
    canvasInstance.current.set({
      selection: false, // 禁止多选
      willReadFrequently: true, // 高频读取
    })

    dispatch({
      type: 'UPDATE_CURRENT_CANVAS',
      payload: canvasInstance.current,
    })

    return () => {
      canvasInstance.current.dispose()
      _viewer.destroy()
    }
  }, [pathoImgInfo])

  useEffect(() => {
    if (!canvasInstance.current) return
    canvasInstance.current.off()
    fabric.Object.prototype.transparentCorners = false
    fabric.Object.prototype.cornerColor = 'blue'
    fabric.Object.prototype.cornerStyle = 'circle'

    // 注册监听事件
    fabricObjAddEvent(
      canvasInstance.current,
      setPosition,
      tempInObject,
      drawingRect,
      drawingCircle,
      drawingEllipse,
      mouseFrom,
      drawingPolygon,
      drawingPolygonPath,
      polygonPoints,
      drawingObject,
      tempActiveLine,
      tempLineArr,
      panningCanvas,
      moveCount,
      pathGroupArr,
      setChangeSession,
      setLoadingInfo,
      firstClick,
      ControlTypeChangeTODRAG,
      ChangeActiveObj,
      setIsQuestion,
      dispatch,
      appendChatContent,
      setIsWaitAnswer
    )
  }, [pathoImgInfo])

  // 根据当前放大倍数，调整参数
  useEffect(() => {
    if (!viewer) return
    // 添加事件监听器
    viewer.addHandler('zoom', function (event) {
      zoomHandler(event, dispatch, setZooming, setPosition)
    })
    viewer.addHandler('animation', function(event) {
      animationHandler(event, dispatch, setZooming, setPosition)
    });
    viewer.addHandler('animation-finish', function (event) {
      animationEndHandler(event, dispatch, setZooming, setPosition)
    })
    return () => {
      viewer.removeAllHandlers('zoom')
      viewer.removeAllHandlers('animation-finish')
    }
  }, [viewer])

  // 画布初始化，显示之前的标注信息
  useEffect(() => {
    // if (!projectHits || projectHits.length === 0) return
    if (!canvasInstance.current) return
    setLoadingInfo({ flag: true, text: 'loading...' })
    canvasInstance.current.clear()
    canvasInstance.current.setViewportTransform([1, 0, 0, 1, 0, 0])

    //改变画布的视口位置
    setLoadingInfo({ flag: false, text: '' })
    // 渲染已有的标注信息
    // renderBoxMap()
    // 重置修改标志位
    setChangeSession(false)
  }, [canvasInstance.current])

  useEffect(() => {
    variableInit()
  }, [currentShape])

  useEffect(() => {
    if (!viewer) return
    if (!canvasInstance.current) return
    let currentCanvas = canvasInstance.current
    currentCanvas.discardActiveObject()
    currentCanvas.renderAll()
    // 设置所有object的可选性
    // currentCanvas.forEachObject(function (object) {
    //   object.selectable = currentControlType === 'default'
    //   object.evented = currentControlType === 'default'
    // })

    // 拖拽时关闭绘制模式
    if (currentControlType === 'drag') {
      viewer.setMouseNavEnabled(true)
      viewer.outerTracker.setTracking(true)
      // canvasInstance.current.isDrawingMode = false
    }
    if (currentControlType === 'default') {
      viewer.setMouseNavEnabled(false)
      viewer.outerTracker.setTracking(false)
    }
  }, [viewer, currentControlType])

  const ControlTypeChangeTODRAG = () => {
    dispatch({
      type: 'UPDATE_CURRENT_CONTROL_TYPE',
      payload: contorlTypes.DRAG,
    })
    dispatch({
      type: 'UPDATE_CURRENT_SHAPE',
      payload: hitShapeTypes.NONE,
    })
  }

  const ChangeActiveObj = (obj) => {
    dispatch({
      type: 'UPDATE_CURRENT_ACTIVE_OBJ',
      payload: obj,
    })
  }

  // 变量重新初始化
  const variableInit = () => {
    if (!canvasInstance.current) return
    const canvas = canvasInstance.current
    // 当前还有未完成的自由路径和多边形
    if (drawingPolygon.current) {
      generatePolygon(
        canvas,
        polygonPoints,
        tempLineArr,
        drawingObject,
        tempActiveLine,
        currentColor,
        strokeWidth
      )
      if(currentCanvas){
        dispatch({
          type: 'UPDATE_CURRENT_CANVAS',
          payload: currentCanvas,
        })
      }
    }

    canvas.remove(drawingObject.current).remove(tempActiveLine.current)

    tempActiveLine.current = null
    drawingObject.current = null
    polygonPoints.current = []
    drawingPolygon.current = false
  }

  const setZoom = size => {
    viewer.viewport.zoomTo(size);
    viewer.viewport.applyConstraints();
  }

  // 删除某一标注物体
  const deleteBtnClick = () => {
    Modal.confirm({
      title: t('PathoSpace.deleteAnnotation.title'),
      icon: <ExclamationCircleOutlined />,
      content: t('PathoSpace.deleteAnnotation.content'),
      okText: t('PathoSpace.deleteAnnotation.okText'),
      cancelText: t('PathoSpace.deleteAnnotation.cancelText'),
      onOk: () => {
        const obj = canvasInstance.current.getActiveObject()
        canvasInstance.current.remove(obj).requestRenderAll()
      },
    })
  }
  return (
    <div className={styles.canvasWrap}>
      <Spin spinning={loadingInfo.flag} tip={loadingInfo.text}>
        <div
          style={{ width: `${viewportWidth}px`, height: `${viewportHeight}px` }}
          id="openSeaDragon"
        ></div>
        {currentActiveObj && <div
          id="deleteBtn"
          style={{
            position: 'absolute',
            left: position.left,
            top: `${position.top + 5}px`,
            display: position.display,
          }}
        >
          <div className={styles.ActiveObjCard}>
            <div className={styles.ActiveObjCardHeader}>
              <div className={styles.ActiveObjCardHeaderShape}>
                <span style={{backgroundColor: currentActiveObj.color}} className={styles.ActiveObjCardHeaderColor}>
                </span>
                <span>{t(hitShapeTypeLabels[currentActiveObj.shape])}</span>
              </div>
              <div className={styles.ActiveObjCardOperate}>
                <div className={styles.ActiveObjCardEdit}
                    title={t('PathoSpace.editTagInfo')}
                    onClick={()=>{setIsTagInfModalOpen(true)}}>
                      <VIcon type="icon-edit" style={{ fontSize: '16px' }} />
                </div>
                <div className={styles.ActiveObjCardDelete}
                    title={t('PathoSpace.deleteTagArea')}
                    onClick={deleteBtnClick}>
                  <VIcon type="icon-delete" style={{ fontSize: '16px' }} />
                </div>
              </div>
            </div>
            {currentActiveObj?.tagInfo && (
              <div className={styles.ActiveObjCardTagInfo}>{currentActiveObj.tagInfo}</div>
            )}
            <div>
              <div>{t('PathoSpace.width')}{(currentActiveObj.width * pathoImgInfo.size.width / 1000).toFixed(2)}px</div>
              <div>{t('PathoSpace.height')}{(currentActiveObj.height * pathoImgInfo.size.width / 1000).toFixed(2)}px</div>
            </div>
          </div>
        </div>}
      </Spin>
      {viewer && <div className={styles.zoomBtn}>
        <div className={styles.rbLabel}>{`${viewer.viewport.getZoom(true).toFixed(1)}x`}</div>
        <div onClick={() => {
          if(isQuestion){
            message.warning(t('PathoSpace.chooseArea'));
            return
          }
          viewer.viewport.goHome()
          viewer.viewport.applyConstraints()
          }}  className={`${styles.rbChoice} ${styles.choose7}`}>1:1</div>
          {zoomLevels.map(level => (
            <div 
              key={level.value}
              onClick={() => {
                if (isQuestion) {
                  message.warning(t('PathoSpace.chooseArea'));
                  return;
                }
                setZoom(level.value);
              }}
              className={`${styles.rbChoice} ${level.className}`}
            >
              {level.value}
            </div>
          ))}
      </div>}
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
    </div>
  )
}

export default CanvasAnnotator
