import React from 'react'
import { VIcon } from '@/components'
import { hitShapeTypes } from '@/constants'
import {
  ArrowUpOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons'

export const controls = [
  {
    value: 'default',
    icon: <ArrowUpOutlined style={{ transform: 'rotate(315deg)' }} />,
    title: 'default arrow',
    label: '绘制',
  },
  {
    value: 'drag',
    icon: <VIcon type="icon-Drag-Hand" />,
    title: 'drag canvas',
    label: '拖拽',
  },
]

export const colors = [
  {
    value: '#ff0000',
    label: 'PathoSpace.tagList.red',
  },
  {
    value: '#00ff00',
    label: 'PathoSpace.tagList.green',
  },
  {
    value: '#0000ff',
    label: 'PathoSpace.tagList.deepBlue',
  },
  {
    value: '#ffff00',
    label: 'PathoSpace.tagList.yellow',
  },
  {
    value: '#ffa500',
    label: 'PathoSpace.tagList.orange',
  },
  {
    value: '#00ffff',
    label: 'PathoSpace.tagList.LightBlue',
  },
]

export const shapes = [
  {
    value: hitShapeTypes.RECT,
    icon: <VIcon type="icon-rect" style={{ fontSize: '18px' }} />,
    title: 'PathoSpace.tagList.rectTitle',
    label: 'PathoSpace.tagList.rect',
  },
  {
    value: hitShapeTypes.POLYGON,
    icon: <VIcon type="icon-polygon" style={{ fontSize: '18px' }} />,
    title: 'PathoSpace.tagList.polygonTitle',
    label: 'PathoSpace.tagList.polygon',
  },
  {
    value: hitShapeTypes.ELLIPSE,
    icon: <VIcon type="icon-ellipse" style={{ fontSize: '18px' }} />,
    title: 'PathoSpace.tagList.ellipseTitle',
    label: 'PathoSpace.tagList.ellipse',
  },
  {
    value: hitShapeTypes.POLYGONPATH,
    icon: <VIcon type="icon-ManagePaths" style={{ fontSize: '18px' }} />,
    title: 'PathoSpace.tagList.pathTitle',
    label: 'PathoSpace.tagList.path',
  },
]

export const iconBtns = (clearPolygons, showReDoModal, saveRow, projectHits, space, isDone) => {
  return [
    {
      icon: <CloseOutlined />,
      title: '清除所有标注',
      width: '',
      color: '#ff4d4f',
      show: space,
      disabled: false,
      onClick: clearPolygons,
    },
    {
      icon: <VIcon type="icon-weibiaoti545" style={{ fontSize: '18px' }} />,
      title: '人工重新标注',
      color: '#faad14',
      width: '',
      show: !space,
      disabled: false,
      onClick: showReDoModal,
    },
    {
      icon: <CheckOutlined />,
      title: '保存标注',
      color: '#52c41a',
      width: '',
      show: !isDone || space,
      disabled: false,
      onClick: history => {
        saveRow('saveToDone')
        Modal.success({
          title: '保存成功',
          content: '标注信息已保存，您可以刷新或重新打开页面继续标注',
        })
      },
    },
  ]
}


