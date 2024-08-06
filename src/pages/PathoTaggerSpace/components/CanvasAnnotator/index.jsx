import React, { useLayoutEffect, useEffect, useMemo, useRef, useState } from 'react'
import '@/lib/fabric/fabric'
import '@/lib/fabric/fabric_eraser_brush'
import { renderBoxMap, handleMultiPath } from './help'
import { useDispatch, useSelector } from 'react-redux'
import useQuery from '@/hooks/useQuery'
import { Button, Modal, Spin, Tooltip, message, Card, Input  } from 'antd'
import styles from './index.module.scss'
import { getImageSize } from '@/helpers/Utils'
import { CheckOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { hitShapeTypes, contorlTypes, hitShapeTypeLabels } from '@/constants'
import { getDrawCursor } from './utils'
import { fabricObjAddEvent } from './fabricObjAddEvent'
import TopRightWidget from './TopRightWidget'
import { generatePolygon } from './fabricObjAddEvent'
import { zoomHandler, animationEndHandler, animationHandler } from './handler'
import OpenSeadragon from '@/lib/openseadragon-fabricjs-overlay/openseadragon-fabricjs-overlay'
import { VIcon } from '@/components'
// @ts-ignore
const fabric = window.fabric
const { TextArea } = Input;
const CanvasAnnotator = ({
  setChangeSession,
  setIsEdit,
  space,
  // setClassificationModel,
  // setSelectedModels,
  // setIsCheckedNone,
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
  const windowWidth = (window.innerWidth * 80) / 100
  const windowHeight = 700

  // console.log(window.innerWidth, window.innerHeight)
  const {
    // currentHit,
    pathoImgInfo,
    projectHits,
    entityColorMap,
    currentEntity,
    currentColor,
    currentShape,
    currentViewer,
    currentCanvas,
    currentActiveObj,
    currentControlType,
    boundingBoxMap,
    SAMMode,
    strokeWidth
  } = useSelector(
    // @ts-ignore
    state => state.project
  )

  let queryInfo = useQuery()

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  const [zooming, setZooming] = useState(false)
  const [viewer, setViewer] = useState(null) // 图片查看器
  // 注册的监听事件为闭包环境，拿不到useState中的最新值，故使用useRef
  // canvas全局的辅助变量
  const canvasInstance = useRef(null)
  const drawingObject = useRef(null) // 当前正在绘制的object 【矩形、圆形、多边形、自由绘制】 用于编辑
  const panningCanvas = useRef(false) // 是否正在拖动canvas

  const [loadingInfo, setLoadingInfo] = useState({ flag: true, text: '加载中...' })

  // 控制自由绘制的【绘制、编辑】按钮的【位置、显示】
  const [isEditLine, setIsEditLine] = useState(false)

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
  const [spotSize, setSpotSize] = useState(5) // 自由绘制时，笔触/橡皮擦 的大小粗细
  const [drawingPath, setDrawingPath] = useState(false) // 是否正在绘制自由形状
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

  const isFreeDraw = useMemo(
    () =>
      currentEntity &&
      currentShape === hitShapeTypes.MANUALCLOSE &&
      currentControlType === 'default',
    [currentEntity, currentShape, currentControlType]
  )

  // 初始化openSeadragon 图片查看器  和  canvas overlay
  useLayoutEffect(() => {
    const _viewer = initOpenSeaDragon()
    setViewer(_viewer)
    dispatch({
      type: 'UPDATE_CURRENT_VIEWER',
      payload: _viewer,
    })

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
      setDrawingPath,
      setChangeSession,
      setLoadingInfo,
      updateLabel,
      space,
      firstClick,
      isEditLine,
      ControlTypeChangeTODRAG,
      ChangeActiveObj,
      dispatch
    )
  }, [space])

  // 根据当前放大倍数，调整参数
  useEffect(() => {
    if (!viewer) return
    // 添加事件监听器
    viewer.addHandler('zoom', function (event) {
      zoomHandler(event, dispatch, setZooming, setSpotSize, setPosition)
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
    if (!projectHits || projectHits.length === 0) return
    if (!canvasInstance.current) return
    setLoadingInfo({ flag: true, text: '图片加载中...' })
    canvasInstance.current.clear()
    canvasInstance.current.setViewportTransform([1, 0, 0, 1, 0, 0])
    setIsEdit(false)

    //改变画布的视口位置
    setLoadingInfo({ flag: false, text: '' })
    // 渲染已有的标注信息
    renderBoxMap()
    // 重置修改标志位
    setChangeSession(false)
  }, [projectHits, canvasInstance.current])

  useEffect(() => {
    if (isFreeDraw) {
      startDrawingPathWithType('pencil')
    } else {
      canvasInstance.current.isDrawingMode = false
    }
  }, [isFreeDraw])

  useEffect(() => {
    variableInit()
    // 如果标签改变了，重新设置画笔颜色和标签
    if (isFreeDraw) {
      startDrawingPathWithType('pencil')
    }
  }, [currentShape, currentEntity])

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

  const updateLabel = async labelSelected => {
    await dispatch({
      type: 'UPDATE_CURRENT_ENTITY',
      payload: labelSelected,
    })
  }

  // 变量重新初始化
  const variableInit = () => {
    if (!canvasInstance.current) return
    const canvas = canvasInstance.current
    // 当前还有未完成的自由路径和多边形
    if (drawingPath) {
      generateFreeLine()
    }
    if (drawingPolygon) {
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

  // 开启自由绘制模式，设置画笔和橡皮擦大小
  const startDrawingPathWithType = type => {
    // 拖拽模式下不允许绘制
    if (currentControlType === 'drag') return
    const canvas = canvasInstance.current
    canvas.isDrawingMode = true
    canvas.brushMode = type
    if (type === 'pencil') {
      // 自由绘制
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      canvas.freeDrawingCursor = `url(${getDrawCursor(6)}) ${6} ${6}, crosshair`
      canvas.freeDrawingBrush.width = spotSize
      canvas.freeDrawingBrush.color = entityColorMap[currentEntity]
    } else if (type === 'eraser') {
      // 让橡皮擦默认为笔触的3倍大
      canvas.freeDrawingBrush = new fabric.EraserBrush(canvas)
      canvas.freeDrawingCursor = `url(${getDrawCursor(15)}) ${15} ${15}, crosshair`
      canvas.freeDrawingBrush.width = spotSize * 3
    }
  }

  const setZoom = size => {
    viewer.viewport.zoomTo(size);
    viewer.viewport.applyConstraints();
  }

  // 将当前选中的自由路径再次设置为编辑状态时，调用次函数来进行状态修改
  const setLineToEdit = () => {
    // 先改变当前的形状，触发变量状态重置variableInit
    dispatch({
      type: 'UPDATE_CURRENT_SHAPE',
      payload: hitShapeTypes.MANUALCLOSE,
    })

    setIsEditLine(true)
    const currentObj = canvasInstance.current.getActiveObject()
    dispatch({
      type: 'UPDATE_CURRENT_ENTITY',
      payload: currentObj.label ? currentObj.label[0] : '',
    })

    currentObj.set({
      erasable: true,
    })
    pathGroupArr.current.push(currentObj)
    //延迟修改，确保所有的修改都被应用到 canvas 对象上，然后再取消选中状态
    setTimeout(() => {
      canvasInstance.current.discardActiveObject().requestRenderAll()
    }, 0)
  }

  useEffect(() => {
    console.log(drawingPath)
  }, [drawingPath])

  // 自由绘制完成，处理多条路径和被擦除的点
  const generateFreeLine = () => {
    pathGroupArr.current.forEach(path => canvasInstance.current.remove(path))
    const groupItems = [...pathGroupArr.current]

    let _entity = ''
    if (currentEntity) {
      _entity = currentEntity
    } else {
      // 根据路径颜色尝试反推label
      for (const key in entityColorMap) {
        if (entityColorMap[key] === groupItems[0].stroke) {
          _entity = key
          break
        }
      }
    }
    let newPath = handleMultiPath(groupItems, canvasInstance.current, true)
    if (newPath) {
      newPath.label = [_entity]
      canvasInstance.current
        .add(newPath)
        .setActiveObject(newPath)
        .remove(drawingObject.current)
        .requestRenderAll()
    }
    // 在boundingBoxMap中删除编辑前的路径
    if (drawingObject.current) {
      dispatch({
        type: 'UPDATE_BOUNDING_BOX_MAP',
        payload: boundingBoxMap.filter(box => box.id !== drawingObject.current.id),
      })
    }
    pathGroupArr.current = []
    drawingObject.current = null
    setDrawingPath(false)
    setIsEditLine(false)
  }

  // 删除某一标注物体
  const deleteBtnClick = () => {
    Modal.confirm({
      title: '确认',
      icon: <ExclamationCircleOutlined />,
      content: '确定删除该标注吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const obj = canvasInstance.current.getActiveObject()
        canvasInstance.current.remove(obj).requestRenderAll()
        // 维护boundingBoxMap数组
        dispatch({
          type: 'UPDATE_BOUNDING_BOX_MAP',
          payload: boundingBoxMap.filter(box => box.id !== obj.id),
        })
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
                <span>{hitShapeTypeLabels[currentActiveObj.shape]}</span>
              </div>
              <div className={styles.ActiveObjCardOperate}>
                <div className={styles.ActiveObjCardEdit}
                    title='编辑标注信息'
                    onClick={()=>{setIsTagInfModalOpen(true)}}>
                      <VIcon type="icon-edit" style={{ fontSize: '16px' }} />
                </div>
                <div className={styles.ActiveObjCardDelete}
                    title='删除标注区域'
                    onClick={deleteBtnClick}>
                  <VIcon type="icon-delete" style={{ fontSize: '16px' }} />
                </div>
              </div>
            </div>
            {currentActiveObj?.tagInfo && (
              <div className={styles.ActiveObjCardTagInfo}>{currentActiveObj.tagInfo}</div>
            )}
            <div>
              <div>宽度：{(currentActiveObj.width * pathoImgInfo.size.width / 1000).toFixed(2)}px</div>
              <div>长度：{(currentActiveObj.height * pathoImgInfo.size.width / 1000).toFixed(2)}px</div>
            </div>
          </div>
          {position.type === 'path' && (
            <div className={styles.editIcon} onClick={setLineToEdit}>
              <EditOutlined />
            </div>
          )}
        </div>}
        {currentEntity && currentShape === hitShapeTypes.MANUALCLOSE  // 自由绘制模式或者EISeg模式下, 显示控制按钮 TopRightWidget
            && (
            <div className={styles.drawingFreeMode}>
              <div className={styles.sizeControl}>
                <TopRightWidget
                  canvas={canvasInstance.current}
                  spotSize={spotSize}
                  drawingFree={startDrawingPathWithType}
                  setSpotSize={setSpotSize}
                  setLoadingInfo={setLoadingInfo}
                />
              </div>
              {(isEditLine || drawingPath) && (
                <Tooltip title="finish this object">
                  <Button
                    type="primary"
                    onClick={() => {
                      if (isEditLine || drawingPath) generateFreeLine()
                    }}
                    style={{ marginTop: '10px' }}
                  >
                    {isEditLine ? '结束修改' : drawingPath ? '结束绘制' : '结束交互'}
                  </Button>
                </Tooltip>
              )}
            </div>
          )}
      </Spin>
      {viewer && <div className={styles.zoomBtn}>
        <div className={styles.rbLabel}>{`${viewer.viewport.getZoom(true).toFixed(1)}x`}</div>
        <div onClick={() => {
          viewer.viewport.goHome()
          viewer.viewport.applyConstraints()
          }}  className={`${styles.rbChoice} ${styles.choose7}`}>1:1</div>
        <div onClick={()=>{setZoom(40)}} className={`${styles.rbChoice} ${styles.choose6}`}>40</div>
        <div onClick={()=>{setZoom(20)}} className={`${styles.rbChoice} ${styles.choose5}`}>20</div>
        <div onClick={()=>{setZoom(10)}} className={`${styles.rbChoice} ${styles.choose4}`}>10</div>
        <div onClick={()=>{setZoom(4)}} className={`${styles.rbChoice} ${styles.choose3}`}>4</div>
        <div onClick={()=>{setZoom(2)}} className={`${styles.rbChoice} ${styles.choose2}`}>2</div>
        <div onClick={()=>{setZoom(1)}} className={`${styles.rbChoice} ${styles.choose1}`}>1</div>
      </div>}
      <Modal title="标注信息" 
              visible={isTagInfoModalOpen} 
              onOk={handleTagInfoModalOk} 
              onCancel={()=>{setIsTagInfModalOpen(false)}} 
              destroyOnClose
              okText="保存"
              cancelText="取消">
          <TextArea placeholder="请输入100字以内标注内容" 
                    showCount 
                    maxLength={100} 
                    onChange={handelInfoValueChange}
                    {...(currentActiveObj?.tagInfo ? { defaultValue: currentActiveObj.tagInfo } : {})}/>
        </Modal>
    </div>
  )
}

export default CanvasAnnotator
