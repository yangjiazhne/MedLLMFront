import '@/lib/fabric/fabric'
import store from '@/redux/store'
import {hitShapeTypes} from '@/constants'

// @ts-ignore
const fabric = window.fabric

export const getCurrentResult = currentCanvas => {
  const { project } = store.getState()
  const { boundingBoxMap, projectHits } = project

  console.log(currentCanvas.getObjects())
  const finalTaggerInfo = currentCanvas.getObjects().map(item => {
    const baseInfo = {
      id: item.id,
      type: item.type,
      shape: item.shape,
      color: item.color,
      // label: item.label,
    }

    const actualLeft = item.left
    const actualTop = item.top

    switch (item.type) {
      case 'circle':
        baseInfo.left = item.left
        baseInfo.top = item.top
        baseInfo.radius = item.radius
        baseInfo.strokeWidth = item.strokeWidth
        break
      case 'ellipse':
        baseInfo.left = item.left
        baseInfo.top = item.top
        baseInfo.rx = item.rx
        baseInfo.ry = item.ry
        baseInfo.strokeWidth = item.strokeWidth
        break
      case 'rect':
        const { br, tl } = item.aCoords
        let width = br.x - tl.x
        let height = br.y - tl.y
        baseInfo.points = [
          [actualLeft, actualTop],
          [actualLeft + width, actualTop],
          [actualLeft + width, actualTop + height],
          [actualLeft, actualTop + height],
        ]
        baseInfo.strokeWidth = item.strokeWidth
        break
      case 'polygon':
        const polygonMatrix = item.calcTransformMatrix()
        // 获取当前polygon移动的距离
        const polygonMoveX = polygonMatrix[4] - item.pathOffset.x,
          polygonMoveY = polygonMatrix[5] - item.pathOffset.y
        baseInfo.points = item.points
          .map(point => [point.x + polygonMoveX, point.y + polygonMoveY])
          .map(point => [point[0] > 0 ? point[0] : 0, point[1] > 0 ? point[1] : 0])
        baseInfo.strokeWidth = item.strokeWidth
        break
      case 'path':
        const pathMatrix = item.calcTransformMatrix()
        // 获取当前polygon移动的距离
        const pathMoveX = pathMatrix[4] - item.pathOffset.x,
          pathMoveY = pathMatrix[5] - item.pathOffset.y
        // console.log('pathMoveX: ',pathMoveX)
        // console.log('pathMoveY: ',pathMoveY)
        baseInfo.points = item.path.map(point => {
          if (point[0] === 'M' || point[0] === 'L') {
            return [point[0], Math.max(point[1] + pathMoveX, 0), Math.max(point[2] + pathMoveY, 0)]
          }
          if (point[0] === 'Q')
            return [
              'Q',
              Math.max(point[1] + pathMoveX, 0),
              Math.max(point[2] + pathMoveY, 0),
              Math.max(point[3] + pathMoveX, 0),
              Math.max(point[4] + pathMoveY, 0),
            ]
        })
        baseInfo.fill = item.fill
        baseInfo.strokeWidth = item.strokeWidth
        break
    }
    return baseInfo
  })
  console.log('finalTaggerInfo', finalTaggerInfo)
  finalTaggerInfo.forEach(tagger => {
    let originTagIndex = -1
    boundingBoxMap.forEach((box, index) => {
      try {
        if (box.id === tagger.id) {
          originTagIndex = index
          throw 'find index'
        }
      } catch (e) {}
    })
    if (originTagIndex !== -1) {
      // 存在此标记，更新它
      boundingBoxMap.splice(originTagIndex, 1, tagger)
    } else {
      // 不存在此标记，插入记录
      boundingBoxMap.push(tagger)
    }
  })
  console.log('boundingBoxMap', boundingBoxMap)
  return JSON.stringify(boundingBoxMap.filter(item => item.type !== 'group'))
}

export const renderModelInfer = (inferRes) => {
  const { project } = store.getState()
  const {
    currentCanvas,
    strokeWidth
  } = project

  if (inferRes.length === 0) return
  inferRes?.map((box, index) => {
    console.log(box)
    if (!box) {
      return
    }

    const id = box.id
    switch (box.type) {
      case 'rect': {
        const left = box.points[0][0] < box.points[2][0] ? box.points[0][0] : box.points[2][0]
        const top = box.points[0][1] < box.points[2][1] ? box.points[0][1] : box.points[2][1]
        const _rect = new fabric.Rect({
          id: id || Date.now(),
          left: left,
          top: top,
          width: box.width,
          height: box.height,
          fill: false,
          strokeWidth: strokeWidth,
          stroke: '#9acd32',
          // opacity: 0.4,
          opacity: 1,
          erasable: false,
          shape: hitShapeTypes.POLYGONPATH,
          perPixelTargetFind: true,
        })
        _rect.setCoords()
        currentCanvas.add(_rect)
        break
      }
      case 'path': {
        const _polygon = new fabric.Polygon(box.points, {
          id: id || Date.now(),
          shape: hitShapeTypes.POLYGON,
          strokeWidth: strokeWidth,
          stroke: '#9acd32',
          fill: false,
          opacity: 1,
          erasable: false,
          objectCaching: false,
          transparentCorners: false,
          perPixelTargetFind: true,
        })
        _polygon.setCoords()
        currentCanvas.add(_polygon)
        break
      }
    }
  })
}

function mapObject(obj, scale, top, left, fabricScale) {
  if (obj.type === 'rect') {
      // 缩放矩形的尺寸和位置，先转化到原图坐标，在转化到fabric坐标
      obj.width = obj.width * scale / fabricScale;
      obj.height = obj.height * scale / fabricScale;
      obj.left = (obj.left * scale + left) / fabricScale;
      obj.top = (obj.top * scale + top) / fabricScale;
  } else if (obj.type === 'path') {
      // 缩放多边形的点
      obj.points = obj.points.map(([x, y]) => [(x * scale + left) / fabricScale, (y * scale + top) / fabricScale]);
  }
  return obj;
}

export const convertCoord = (width, height, top, left, inferRes, fabricScale) => {
  const scale = Math.max(width, height)  //此处width, height, top, left对应的是原图像素

  return inferRes.map(obj => mapObject(obj, scale, top, left, fabricScale));
}