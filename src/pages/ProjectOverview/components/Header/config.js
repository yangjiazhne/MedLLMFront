import React from 'react'
import {
  CodeOutlined,
  DeleteOutlined,
  FileZipOutlined,
  FormOutlined,
  PlusSquareOutlined,
} from '@ant-design/icons'

export const getOptionsBtn = ({
  history,
  downloadFile,
}) => {
  let result = [
    {
      icon: <CodeOutlined style={{ color: 'teal' }} />,
      title: 'downloadJson',
      onClick: () => downloadFile('JSON'),
    },
    {
      icon: <FileZipOutlined style={{ color: 'blue' }} />,
      title: 'downloadZip',
      onClick: () => downloadFile('zip'),
    },
  ]
  return result
}

export const uploadTypes = [
  { uploadType: 'Raw', header: 'uploadRawData', desc: 'uploadRawDesc' },
  {
    uploadType: 'Resource',
    header: 'uploadResourceData',
    desc: "uploadResourceDesc",
  },
]
