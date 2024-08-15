import store from '@/redux/store'
import '@/lib/fabric/fabric'
import { message, Modal } from 'antd'
import { hitShapeTypes, contorlTypes } from '@/constants'
import {
  actionHandler,
  addPolygonPoint,
  anchorWrapper,
  drawPoint,
  drawCircle,
  drawEllipse,
  drawPolygon,
  drawRectangle,
  polygonPositionHandler,
} from './utils'
import { hexToRgba } from '@/helpers/Utils'
import { liveQA } from '@/request/actions/task'

// @ts-ignore
const fabric = window.fabric

// 注册canvas监听事件
// 这些传入的参数都有什么作用呢
export const fabricObjAddEvent = (
  canvas, // fabric canvas
  setPosition, // 设置每个物体右侧控制标志的位置
  tempInObject, // 在自由路径时判断鼠标是否位于某个对象中
  drawingRect, // 是否正在绘制矩形
  drawingCircle, //是否正在绘制圆形
  drawingEllipse, //是否正在绘制椭圆形
  mouseFrom, // 绘制矩形/圆形的起始点
  drawingPolygon, // 是否正在绘制多边形
  drawingPolygonPath, // 是否正在绘制多边形路径
  polygonPoints, // 多边形的点数组
  drawingObject, // 正在绘制的自由路径对象？
  tempActiveLine, // 多边形的正在绘制的临时线
  tempLineArr, // 多边形的临时线数组
  panningCanvas, // 是否正在拖拽画布
  moveCount, // 移动计数
  pathGroupArr, // 画笔模式下的路径数组
  setChangeSession, // 设置是否改变了画布内容
  setLoadingInfo, //  设置loading信息
  firstClick, // 记录第一次点击状态
  ControlTypeChangeTODRAG,  //更改控制方式
  ChangeActiveObj, //更新目前选中对象
  setIsQuestion,  // 是否在框选LLM区域
  dispatch,
  appendChatContent
) => {
  canvas.on({
    'selection:created': o => {
      // //// console.log('selection:created', o)
      // 拖拽模式下不允许选中object
      if (o.selected.length > 1)
        // 已禁用了canvas的多选
        return
      ChangeActiveObj(o.selected[0])
      const bl = o.selected[0].aCoords.bl
      const _relativeBl = fabric.util.transformPoint(bl, canvas.viewportTransform)

      o.selected[0].set('fill','rgba(0,0,0,0.3)')

      setPosition({
        left: _relativeBl.x,
        top: _relativeBl.y,
        display: 'block',
        type: o.selected[0].type,
      })
    },
    'selection:updated': o => {
      if (o.selected.length > 1) return
      ChangeActiveObj(o.selected[0])
      const bl = o.selected[0].aCoords.bl
      const _relativeBl = fabric.util.transformPoint(bl, canvas.viewportTransform)

      o.selected[0].set('fill','rgba(0,0,0,0.3)')

      setPosition({
        left: _relativeBl.x,
        top: _relativeBl.y,
        display: 'block',
        type: o.selected[0].type,
      })
    },
    'selection:cleared': o => {
      ChangeActiveObj(null)
      canvas.forEachObject(function (object) {
        object.set('fill', false);
      })
      setPosition({ left: 0, top: 0, display: 'none' })
    },
    'object:removed': o => {
      setChangeSession(true)
    },
    'object:modified': o => {
      setChangeSession(true)

      const bl = o.target.aCoords.bl
      const _relativeBl = fabric.util.transformPoint(bl, canvas.viewportTransform)
      setPosition({
        left: _relativeBl.x,
        top: _relativeBl.y,
        display: 'block',
        type: o.target.type,
      })
    },
    'object:scaling': o => {
      //// console.log('scaling')
      const bl = o.target.aCoords.bl
      const _relativeBl = fabric.util.transformPoint(bl, canvas.viewportTransform)
      setPosition({
        left: _relativeBl.x,
        top: _relativeBl.y,
        display: 'block',
        type: o.target.type,
      })
    },
    'object:moving': o => {
      //// console.log('moving')
      const bl = o.target.aCoords.bl
      const _relativeBl = fabric.util.transformPoint(bl, canvas.viewportTransform)
      setPosition({
        left: _relativeBl.x,
        top: _relativeBl.y,
        display: 'block',
        type: o.target.type,
      })
    },
    'object:rotating': o => {
      const bl = o.target.aCoords.bl
      const _relativeBl = fabric.util.transformPoint(bl, canvas.viewportTransform)
      setPosition({
        left: _relativeBl.x,
        top: _relativeBl.y,
        display: 'block',
        type: o.target.type,
      })
    },
    'object:skewing': o => {
      const bl = o.target.aCoords.bl
      const _relativeBl = fabric.util.transformPoint(bl, canvas.viewportTransform)
      setPosition({
        left: _relativeBl.x,
        top: _relativeBl.y,
        display: 'block',
        type: o.target.type,
      })
    },
    'mouse:down:before': o => {
      if (o.target) {
        if (o.target === canvas.getActiveObject()) {
          firstClick.current = false
        } else {
          firstClick.current = true
        }
      }
    },
    'mouse:down': o => {
      //// console.log('mouse:down')
      const { project } = store.getState()
      const {
        currentShape,
        entityColorMap,
        currentColor,
        currentControlType,
        pathoImgInfo,
        pathoViewSize,
        strokeWidth,
        circleRadius,
        isMutiTag
      } = project
      if (o.e && o.target) {
        o.e.preventDefault();
        o.e.stopPropagation();
      }
      switch (currentControlType) {
        case 'default':
          if (!currentColor || !currentShape) return
          // 默认模式下处理鼠标点击事件
          // 视口坐标系转换为画布坐标系
          const matrix = fabric.util.invertTransform(canvas.viewportTransform)
          // // console.log('o.pointer', o.pointer)
          const actualPoint = fabric.util.transformPoint(o.pointer, matrix)
          const leftTopPoint = fabric.util.transformPoint({ x: 0, y: 0 }, matrix)
          // // console.log('leftTopPointCanvas', leftTopPoint)
          leftTopPoint.x = convertCanvasToImage(leftTopPoint.x, pathoImgInfo.size.width, 1000)
          leftTopPoint.y = convertCanvasToImage(leftTopPoint.y, pathoImgInfo.size.width, 1000)
          // // console.log('leftTopPointImage', leftTopPoint)

          // 画点
          if (currentShape === hitShapeTypes.POINT) {
            if (o.target) return
            drawingRect.current = false
            actualPoint.x -= circleRadius
            actualPoint.y -= circleRadius
            canvas.add(
              drawPoint({
                color: currentColor,
                position: actualPoint,
                circleRadius: circleRadius,
              })
            )
          }

          //画圆形
          if (currentShape === hitShapeTypes.CIRCLE) {
            if (o.target) return
            drawingCircle.current = true
            mouseFrom.current = actualPoint
          }

          //画椭圆形
          if (currentShape === hitShapeTypes.ELLIPSE) {
            if (o.target) return
            drawingEllipse.current = true
            mouseFrom.current = actualPoint
          }

          // 画矩形 
          if (currentShape === hitShapeTypes.RECT) {
            if (o.target) return
            drawingRect.current = true
            mouseFrom.current = actualPoint
          }

          // 框选问答区域
          if (currentShape === hitShapeTypes.LLMREGION) {
            if (o.target) return
            drawingRect.current = true
            mouseFrom.current = actualPoint
          }

          // 画多边形路径
          if (currentShape === hitShapeTypes.POLYGONPATH) {
            if(o.target) return
            drawingPolygonPath.current = true
            mouseFrom.current = actualPoint
            addPolygonPoint(
              actualPoint,
              canvas,
              polygonPoints,
              drawingObject,
              currentColor,
              tempActiveLine,
              tempLineArr,
              strokeWidth,
              0
            ) // 往多边形中添加点
          }

          // 画多边形
          if (currentShape === hitShapeTypes.POLYGON) {
            // //// console.log(drawingPolygon)
            if (o.target && !drawingPolygon.current) return
            if (o.target && o.target.id === polygonPoints.current[0].id) {
              //// console.log('绘制完毕')
              // 多边形绘制完毕
              generatePolygon(
                canvas,
                polygonPoints,
                tempLineArr,
                drawingObject,
                tempActiveLine,
                currentColor,
                strokeWidth
              )
              if (!isMutiTag) {
                ControlTypeChangeTODRAG()
              }
              drawingPolygon.current = false
            } else {
              // 多边形绘制中
              drawingPolygon.current = true
              addPolygonPoint(
                actualPoint,
                canvas,
                polygonPoints,
                drawingObject,
                currentColor,
                tempActiveLine,
                tempLineArr,
                strokeWidth,
                circleRadius
              ) // 往多边形中添加点
            }
          }
          break
        case 'drag':
          // 拖拽模式下处理鼠标点击事件
          // panningCanvas.current = true
          break
        default:
          break
      }
    },
    'mouse:move': o => {
      // // console.log('mouse:move')
      const { project } = store.getState()
      const {
        currentShape,
        entityColorMap,
        strokeWidth,
        currentColor,
        currentControlType,
      } = project

      const matrix = fabric.util.invertTransform(canvas.viewportTransform)
      const actualPoint = fabric.util.transformPoint(o.pointer, matrix)

      switch (currentControlType) {
        // 默认模式下处理鼠标移动事件
        case 'default':
          canvas.defaultCursor = currentColor ? 'crosshair' : 'default'

          moveCount.current++
          if (moveCount.current % 2) return // 减少绘制频率
          if (drawingRect.current && currentShape === hitShapeTypes.RECT) {
            generateRect(
              canvas,
              actualPoint,
              drawingObject,
              mouseFrom,
              currentColor,
              strokeWidth,
              false
            )
          }

          if (drawingRect.current && currentShape === hitShapeTypes.LLMREGION) {
            generateRect(
              canvas,
              actualPoint,
              drawingObject,
              mouseFrom,
              currentColor,
              strokeWidth,
              false
            )
          }

          if ( drawingPolygonPath.current && currentShape === hitShapeTypes.POLYGONPATH) {
            addPolygonPoint(
              actualPoint,
              canvas,
              polygonPoints,
              drawingObject,
              currentColor,
              tempActiveLine,
              tempLineArr,
              strokeWidth,
              0
            ) // 往多边形中添加点
          }

          //绘制圆形
          if ( drawingCircle.current && currentShape === hitShapeTypes.CIRCLE) {
            generateCircle(
              canvas,
              actualPoint,
              drawingObject,
              mouseFrom,
              currentColor,
              strokeWidth
            )
          }

          //绘制椭圆形
          if ( drawingEllipse.current && currentShape === hitShapeTypes.ELLIPSE) {
            generateEllipse(
              canvas,
              actualPoint,
              drawingObject,
              mouseFrom,
              currentColor,
              strokeWidth,
              false
            )
          }
          // console.log(canvas.isDrawingMode)
          // console.log(tempInObject.current)
          if (canvas.isDrawingMode && !tempInObject.current) {
            // console.log('进来了')
            let objects = canvas.getObjects()
            for (var i = 0; i < objects.length; i++) {
              // 如果鼠标指针进入一个path对象并且是当前正在绘制对象的一部分时就忽略，否则检查鼠标指针是否在对象中
              if (!(objects[i].type === 'path')) {
                if (isInObject(objects[i], actualPoint)) {
                  canvas.isDrawingMode = false
                  tempInObject.current = true
                  break
                }
              }
            }
          } else if (!canvas.isDrawingMode && tempInObject.current) {
            let objects = canvas.getObjects()
            for (var i = 0; i < objects.length; i++) {
              // 检查鼠标指针是否不在任何对象中
              if (!(objects[i].type === 'path')) {
                if (isInObject(objects[i], actualPoint)) {
                  return
                }
              }
            }
            canvas.isDrawingMode = true
            tempInObject.current = false
          }
          break
        // 拖拽模式下处理鼠标移动事件
        case 'drag':
          canvas.defaultCursor = 'grab'
        default:
          break
      }
    },
    'mouse:up': o => {
      //// console.log('mouse:up')
      const { project } = store.getState()
      const {
        currentShape,
        entityColorMap,
        strokeWidth,
        currentColor,
        currentCanvas,
        currentControlType,
        pathoImgInfo,
        isMutiTag,
        currentImage,
        currentQuestion
      } = project
      
      const matrix = fabric.util.invertTransform(canvas.viewportTransform)
      const actualPoint = fabric.util.transformPoint(o.pointer, matrix)
      const leftTopPoint = fabric.util.transformPoint({ x: 0, y: 0 }, matrix)
      // // console.log('leftTopPointCanvas', leftTopPoint)
      leftTopPoint.x = convertCanvasToImage(leftTopPoint.x, pathoImgInfo.size.width, 1000)
      leftTopPoint.y = convertCanvasToImage(leftTopPoint.y, pathoImgInfo.size.width, 1000)
      // // console.log('leftTopPointImage', leftTopPoint)
      if (!firstClick.current && canvas.getActiveObject()) {
        canvas.discardActiveObject()
        canvas.renderAll()
      }
      switch (currentControlType) {
        // 默认模式下处理鼠标抬起事件
        case 'default':
          //圆形绘制完毕
          if(currentShape === hitShapeTypes.CIRCLE && drawingCircle.current){
            generateCircle(
              canvas,
              actualPoint,
              drawingObject,
              mouseFrom,
              currentColor,
              strokeWidth
            )
            drawingObject.current = null
            drawingCircle.current = false
            moveCount.current = 1
            if (!isMutiTag) {
              ControlTypeChangeTODRAG()
            }
            dispatch({
              type: 'UPDATE_CURRENT_CANVAS',
              payload: currentCanvas,
            })
          }
          //椭圆形绘制完毕
          if(currentShape === hitShapeTypes.ELLIPSE && drawingEllipse.current){
            generateEllipse(
              canvas,
              actualPoint,
              drawingObject,
              mouseFrom,
              currentColor,
              strokeWidth,
              true
            )
            drawingObject.current = null
            drawingEllipse.current = false
            moveCount.current = 1
            if (!isMutiTag) {
              ControlTypeChangeTODRAG()
            }
            dispatch({
              type: 'UPDATE_CURRENT_CANVAS',
              payload: currentCanvas,
            })
          }
          // 多边形路径绘制完成
          if ( drawingPolygonPath.current && currentShape === hitShapeTypes.POLYGONPATH) {
            generatePolygonPath(
              canvas,
              polygonPoints,
              tempLineArr,
              drawingObject,
              tempActiveLine,
              currentColor,
              strokeWidth
            )

            tempActiveLine.current = null
            polygonPoints.current = []
            drawingObject.current = null
            drawingPolygonPath.current = false
            moveCount.current = 1
            if (!isMutiTag) {
              ControlTypeChangeTODRAG()
            }
            dispatch({
              type: 'UPDATE_CURRENT_CANVAS',
              payload: currentCanvas,
            })
          }
          //LLM框选区域绘制完成
          if (currentShape === hitShapeTypes.LLMREGION && drawingRect.current) {
            getLLMRegion(
              canvas,
              actualPoint,
              drawingObject,
              mouseFrom,
              currentColor,
              strokeWidth,
              ControlTypeChangeTODRAG,
              pathoImgInfo,
              setIsQuestion,
              currentImage,
              appendChatContent,
              currentQuestion,
              dispatch
            )

            drawingObject.current = null
            drawingRect.current = false
            moveCount.current = 1
          }

          if (currentShape === hitShapeTypes.RECT && drawingRect.current) {
            // 矩形绘制完毕
            generateRect(
              canvas,
              actualPoint,
              drawingObject,
              mouseFrom,
              currentColor,
              strokeWidth,
              true
            )

            drawingObject.current = null
            drawingRect.current = false
            moveCount.current = 1
            if (!isMutiTag) {
              ControlTypeChangeTODRAG()
            }
            dispatch({
              type: 'UPDATE_CURRENT_CANVAS',
              payload: currentCanvas,
            })
          }
          break
        // 拖拽模式下处理鼠标抬起事件
        case 'drag':
          break
        // panningCanvas.current = false
        default:
          break
      }
    },
    'mouse:wheel': o => {

    },
  })
}

//生成最终的多边形路径
export const generatePolygonPath = (
  canvas,
  polygonPoints,
  tempLineArr,
  drawingObject,
  tempActiveLine,
  fillColor,
  strokeWidth
) => {
  if (!drawingObject.current) return
  polygonPoints.current.forEach(point => canvas.remove(point))
  tempLineArr.current.forEach(line => canvas.remove(line))
  canvas.remove(drawingObject.current).remove(tempActiveLine.current)
  const points = drawingObject.current.get('points')
  // .map(_p => ({ x: _p.x + sliceX, y: _p.y + sliceY }))

  const polygon = drawPolygon({
    points,
    color: fillColor,
    strokeWidth,
  })

  canvas.add(polygon)

  tempActiveLine.current = null
  drawingObject.current = null
  polygonPoints.current = []

}

// 生成最终的多边形
export const generatePolygon = (
  canvas,
  polygonPoints,
  tempLineArr,
  drawingObject,
  tempActiveLine,
  fillColor,
  strokeWidth
) => {
  if (!drawingObject.current) return
  polygonPoints.current.forEach(point => canvas.remove(point))
  tempLineArr.current.forEach(line => canvas.remove(line))
  canvas.remove(drawingObject.current).remove(tempActiveLine.current)
  const points = drawingObject.current.get('points')
  // .map(_p => ({ x: _p.x + sliceX, y: _p.y + sliceY }))

  const polygon = drawPolygon({
    points,
    color: fillColor,
    strokeWidth,
  })
  // polygon.left -= sliceX
  // polygon.top -= sliceY
  // polygon.setCoords()
  polygon.set({
    controls: points.reduce(function (acc, point, index) {
      acc['p' + index] = new fabric.Control({
        positionHandler: polygonPositionHandler,
        actionHandler: anchorWrapper(index > 0 ? index - 1 : points.length - 1, actionHandler),
        actionName: 'modifyPolygon',
        pointIndex: index,
      })
      return acc
    }, {}),
  })

  // //// console.log(polygon)
  canvas.add(polygon)

  //// console.log(canvas.getObjects())

  tempActiveLine.current = null
  drawingObject.current = null
  polygonPoints.current = []
}

// 获取LLM框选区域的坐标
const getLLMRegion = async (
  canvas,
  endPoint,
  drawingObject,
  mouseFrom,
  fillColor,
  strokeWidth,
  ControlTypeChangeTODRAG,
  pathoImgInfo,
  setIsQuestion,
  currentImage,
  appendChatContent,
  currentQuestion,
  dispatch
) => {
  if (drawingObject.current) {
    // 清除上一次绘制的矩形
    canvas.remove(drawingObject.current)
  }

  const scale = pathoImgInfo.size.width / 1000
  
  const x1 = mouseFrom.current.x
  const y1 = mouseFrom.current.y

  const x2 = endPoint.x
  const y2 = endPoint.y

  const left = Math.min(x1, x2) * scale;
  const top = Math.min(y1, y2) * scale;

  const width = Math.abs(x2 - x1) * scale;
  const height = Math.abs(y2 - y1) * scale;
  console.log(currentQuestion)

  ControlTypeChangeTODRAG()
  setIsQuestion(false)
  dispatch({
    type: 'UPDATE_CURRENT_SHAPE',
    payload: hitShapeTypes.NONE,
  })

  const res = await liveQA({
    "llmTaskTypeId": 1,
    "imageId": currentImage.imageId,
    "question": currentQuestion,
    "x": left,
    "y": top,
    "width": width,
    "height": height
  })

  appendChatContent(res.data, "assistant")

}

// 绘制矩形时要根据鼠标移动位置改变矩形大小【生成临时矩形】
const generateRect = (
  canvas,
  endPoint,
  drawingObject,
  mouseFrom,
  fillColor,
  strokeWidth,
  isfinish
) => {
  if (drawingObject.current) {
    // 清除上一次绘制的矩形
    canvas.remove(drawingObject.current)
  }

  const rect = drawRectangle({
    beginPoint: mouseFrom.current,
    endPoint,
    color: fillColor,
    strokeWidth: strokeWidth,
    isfinish: isfinish
  })
  canvas.add(rect)
  drawingObject.current = rect
}


// 绘制圆形时要根据鼠标移动位置改变圆形大小【生成临时圆形】
const generateCircle = (
  canvas,
  endPoint,
  drawingObject,
  mouseFrom,
  fillColor,
  strokeWidth
) => {
  if (drawingObject.current) {
    // 清除上一次绘制的圆形
    canvas.remove(drawingObject.current)
  }

  let beginPoint = mouseFrom.current
  let radius = Math.min(Math.abs(endPoint.x - beginPoint.x), Math.abs(endPoint.y - beginPoint.y)) / 2
  let top = endPoint.y > beginPoint.y ? beginPoint.y : beginPoint.y - radius * 2
  let left = endPoint.x > beginPoint.x ? beginPoint.x :  beginPoint.x - radius * 2

  const circle = drawCircle({
    left, 
    top, 
    radius,
    color: fillColor,
    strokeWidth: strokeWidth,
  })
  canvas.add(circle)
  drawingObject.current = circle
}

// 绘制椭圆形时要根据鼠标移动位置改变椭圆形大小【生成临时椭圆形】
const generateEllipse = (
  canvas,
  endPoint,
  drawingObject,
  mouseFrom,
  fillColor,
  strokeWidth,
  isfinish
) => {
  if (drawingObject.current) {
    // 清除上一次绘制的椭圆形
    canvas.remove(drawingObject.current)
  }
  let beginPoint = mouseFrom.current
  let rx = Math.abs(beginPoint.x - endPoint.x) / 2
  let ry = Math.abs(beginPoint.y - endPoint.y) / 2
  let top = endPoint.y > beginPoint.y ? beginPoint.y : beginPoint.y - ry * 2
  let left = endPoint.x > beginPoint.x ? beginPoint.x :  beginPoint.x - rx * 2
  const ellipse = drawEllipse({
    top, 
    left, 
    rx, 
    ry,
    color: fillColor,
    strokeWidth: strokeWidth,
    isfinish: isfinish
  })
  canvas.add(ellipse)
  drawingObject.current = ellipse
}

// 根据一维点数组返回path路径
const convertPointsToPath = (pathPoints, fillColor, label) => {
  const pointsForFabric = [['M', pathPoints[0][0], pathPoints[0][1]]]
  for (let i = 1; i < pathPoints.length - 1; i++) {
    var xc = (pathPoints[i][0] + pathPoints[i + 1][0]) / 2
    var yc = (pathPoints[i][1] + pathPoints[i + 1][1]) / 2
    pointsForFabric.push(['Q', pathPoints[i][0], pathPoints[i][1], xc, yc])
  }
  pointsForFabric.push([
    'L',
    pathPoints[pathPoints.length - 1][0],
    pathPoints[pathPoints.length - 1][1],
  ])
  return new fabric.Path(pointsForFabric, {
    id: Date.now() + Math.random() * 10, // 防止批量生成时时间过快导致时间戳相同
    strokeWidth: 0.03,
    stroke: fillColor,
    fill: hexToRgba(fillColor, 0.4),
    shape: hitShapeTypes.PATH,
    label,
    // lockMovementX: true,
    // lockMovementY: true,
    lockRotation: true,
    lockScalingFlip: true,
    lockScalingX: true,
    lockScalingY: true,
    lockSkewingX: true,
    lockSkewingY: true,
    erasable: false,
  })
}

const convertCanvasToImage = (x, imageWidth, canvasScale) => {
  let _x = x

  _x = _x * imageWidth

  _x = _x / canvasScale
  return _x
}

const isInObject = (object, point) => {
  const strokeWidthOffset = object.strokeWidth ? object.strokeWidth : 0

  const isWithinObject =
    point.x >= object.left - strokeWidthOffset &&
    point.x <= object.left + object.width + strokeWidthOffset &&
    point.y >= object.top - strokeWidthOffset &&
    point.y <= object.top + object.height + strokeWidthOffset

  const isWithinFill =
    point.x > object.left + strokeWidthOffset &&
    point.x < object.left + object.width - strokeWidthOffset &&
    point.y > object.top + strokeWidthOffset &&
    point.y < object.top + object.height - strokeWidthOffset

  // 由于矩形只包括边框，这里对在矩形内部做单独判断
  if (object.type === 'rect') {
    return isWithinObject && !isWithinFill
  }

  return isWithinObject
}
