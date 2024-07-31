/*
 * @Author: Azhou
 * @Date: 2021-08-18 11:17:43
 * @LastEditors: Azhou
 * @LastEditTime: 2022-11-22 15:15:17
 */
import { HIT_STATE_NOT_DONE } from '@/helpers/Utils'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import '@/lib/fabric/fabric'
import React from 'react'
import store from '@/redux/store'
import { hitShapeTypes } from '@/constants'
import { hexToRgba } from '@/helpers/Utils'

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
      label: item.label,
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

export const handleKeyDown = (event, currentCanvas, handleChangeHitStatus) => {
  event.preventDefault()
  const keyName = event.key
  if (event.ctrlKey && keyName === 's') {
    // 保存标记信息
    // handleChangeHitStatus('savePartialHit')
  } else {
    const obj = currentCanvas.getActiveObject()
    if (obj) {
      // 删除obj
      if (keyName === 'Backspace') {
        const modal = Modal.confirm({
          title: 'Confirm',
          icon: <ExclamationCircleOutlined />,
          content: '确定删除选中Object吗？',
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            currentCanvas.remove(obj).requestRenderAll()
            modal.destroy()
          },
        })
      }
      // 移动obj
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(keyName)) {
        const STEP = 2 // 上下左右移动的步长
        if (keyName === 'ArrowUp') obj.top -= STEP
        if (keyName === 'ArrowDown') obj.top += STEP
        if (keyName === 'ArrowLeft') obj.left -= STEP
        if (keyName === 'ArrowRight') obj.left += STEP
        obj.setCoords()
        currentCanvas.fire('object:modified', { target: obj })
        currentCanvas.requestRenderAll()
      }
    }
  }
}

export const getHits = (hitsData, filterValue) => {
  return hitsData
    .map(hit => {
      // status = notDone && hit.hitResults = null
      if (filterValue.status === HIT_STATE_NOT_DONE && !hit.hitResults?.length) return hit
      // status = al / done && 有标记信息
      if (hit.hitResults?.length) {
        const hitResult = hit.hitResults.filter(
          result => result.model === filterValue.model && result.status === filterValue.status
        )[0]
        if (hitResult)
          return {
            ...hit,
            hitResults: [hitResult],
          }
      }
    })
    .filter(Boolean)
}

export const renderModelInfer = (inferRes, currentInferPaths) => {
  const { project } = store.getState()
  const {
    projectDetails,
    currentHit,
    currentImgInfo,
    currentCanvas,
    entityColorMap,
    currentControlType,
    currentEntity,
  } = project
  currentInferPaths.current.forEach(path => currentCanvas.remove(path))
  currentInferPaths.current = []

  if (inferRes.length === 0) return
  inferRes?.map((box, index) => {
    console.log(box)
    if (!box) {
      return
    }
    box.label = box.label || []
    const color = entityColorMap[box.label[0]] || '#000000'
    const id = box.id
    switch (box.type) {
      case 'circle': {
        const _circle = new fabric.Circle({
          id: id || Date.now(),
          left: box.points[0][0],
          top: box.points[0][1],
          radius: box.radius,
          fill: color,
          stroke: null,
          // opacity: 0.4,
          erasable: false,
          label: box.label,
          shape: hitShapeTypes.CIRCLE,
          scaleY: 1,
          scaleX: 1,
          strokeWidth: 0,
        })
        _circle.setCoords()
        currentInferPaths.current.push(_circle)
        currentCanvas.add(_circle)
        break
      }
      case 'rect': {
        const left = box.points[0][0] < box.points[2][0] ? box.points[0][0] : box.points[2][0]
        const top = box.points[0][1] < box.points[2][1] ? box.points[0][1] : box.points[2][1]
        const _rect = new fabric.Rect({
          id: id || Date.now(),
          left: left,
          top: top,
          width: Math.abs(box.points[2][0] - box.points[0][0]),
          height: Math.abs(box.points[2][1] - box.points[0][1]),
          fill: color,
          stroke: color,
          strokeWidth: box.strokeWidth,
          // opacity: 0.4,
          opacity: 1,
          erasable: false,
          label: box.label,
          shape: hitShapeTypes.RECT,
          perPixelTargetFind: true,
        })
        _rect.setCoords()
        currentInferPaths.current.push(_rect)
        currentCanvas.add(_rect)
        break
      }
      case 'yoloRect': {
        const left = box.points[0][0] < box.points[2][0] ? box.points[0][0] : box.points[2][0]
        const top = box.points[0][1] < box.points[2][1] ? box.points[0][1] : box.points[2][1]
        const _rect = new fabric.Rect({
          id: id || Date.now(),
          left: left,
          top: top,
          width: Math.abs(box.points[2][0] - box.points[0][0]),
          height: Math.abs(box.points[2][1] - box.points[0][1]),
          fill: color,
          stroke: color,
          strokeWidth: 5,
          // opacity: 0.4,
          opacity: 1,
          erasable: false,
          label: box.label,
          shape: hitShapeTypes.RECT,
        })

        const text = new fabric.Text(box.label[0], {
          fontSize: 16,
          fill: 'white',
          textBackgroundColor: _rect.stroke,
          left: _rect.left,
          top: _rect.top - 18,
        })
        const _group = new fabric.Group([_rect, text])
        _group.label = box.label
        _group.setCoords()
        currentInferPaths.current.push(_group)
        currentCanvas.add(_group)
        break
      }
      case 'path': {
        const _path = new fabric.Path(box.points, {
          id: id || Date.now(),
          fill: hexToRgba(color, 0.4),
          strokeWidth: box.strokeWidth,
          stroke: color,
          label: box.label,
          shape: hitShapeTypes.PATH,
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
        _path.setCoords()
        currentInferPaths.current.push(_path)
        currentCanvas.add(_path)
        break
      }
      case 'asm_path': {
        const _path = new fabric.Path(box.path, {
          id: id || Date.now(),
          fill: hexToRgba(color, 0.4),
          // fill: false,
          strokeWidth: box.strokeWidth,
          stroke: color,
          label: box.label,
          shape: hitShapeTypes.PATH,
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
        _path.setCoords()
        currentInferPaths.current.push(_path)
        currentCanvas.add(_path)
        break
      }
    }
  })
  // 设置所有object的可选性
  currentCanvas.forEachObject(function (object) {
    object.selectable = currentControlType === 'default'
    object.evented = currentControlType === 'default'
  })
}
