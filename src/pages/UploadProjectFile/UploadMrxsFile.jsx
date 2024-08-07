import { uploadFileDT } from '@/request/actions/project'
import { DeleteOutlined, FileZipOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, message, Progress, Tabs, Upload, Spin, Modal } from 'antd'
import bytes from 'bytes'
import React, { useState } from 'react'
import styles from './index.module.scss'

const { TabPane } = Tabs
const { Dragger } = Upload

const UploadMrxsFile = ({ handleUploadDone }) => {
  const [zipFile, setZipFile] = useState(null)
  const [txtFile, setTxtFile] = useState(null)
  const [imageList, setImageList] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProcess, setUploadProcess] = useState(0)
  const [tabValue, setTabValue] = useState('txt')

  const beforeUpload = file => {
    if (tabValue === 'txt') {
        setTxtFile(file)
    } 
    return false
  }

  const onImageChange = file => {
    setImageList(file.fileList)
  }

  const readFile = async file => {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result)
      }

      reader.onerror = () => {
        reject(reader.error)
      }

      reader.readAsText(file)
    })
  }

  const handleSubmit = async () => {
    const projectId = localStorage.getItem('currentProject')
    let res
    // 上传txt文件
    if (tabValue === 'txt') {
        if (!txtFile) {
          message.error('Please choose a txt file')
          return
        }
        setUploading(true)
        const content = await readFile(txtFile)
        const lines = content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line !== '')
        const total = lines.length
        if (total < 1) {
          Modal.error({
            content: '输入的txt文件中无有效地址',
          })
          return 0
        }
        // res = await uploadFileDT(zipFile, projectId, event => setUploadProcess(event.percent))
        console.log(lines)
        setUploading(false)
        // if (res?.err) message.error(res.data || 'something was wrong')
        // else handleUploadDone(res.data)
        // handleUploadDone({
        //     numHitsCreated: successProject,
        //     numHitsIgnored: lines.length - successProject,
        //     taskId: taskId,
        // })
    }
    // 批量上传图片
    if (tabValue === 'images') {
      if (!imageList.length) {
        message.error('Please choose at least one image')
        return
      }
      let uploadedCnt = 0
      let fileSize = 0
      setUploading(true)
      for (let image of imageList) {
        let res = await uploadFileDT(image.originFileObj, projectId)
        if (!res?.err) {
          uploadedCnt++
          fileSize += image.size
          setUploadProcess((uploadedCnt / imageList.length) * 100)
        }
      }
      setUploading(false)
      handleUploadDone({
        numHitsCreated: uploadedCnt,
        numHitsIgnored: imageList.length - uploadedCnt,
        totalUploadSizeInBytes: fileSize,
      })
    }
    // 上传zip文件
    if (tabValue === 'zip') {
      if (!zipFile) {
        message.error('Please choose a zip file')
        return
      }
      setUploading(true)
      res = await uploadFileDT(zipFile, projectId, event => setUploadProcess(event.percent))
      setUploading(false)
      if (res?.err) message.error(res.data || 'something was wrong')
      else handleUploadDone(res.data)
    }
  }

  return (
    <div style={{ textAlign: 'center', width: '80%', margin: 'auto' }}>
      <h3 style={{ margin: '20px 0' }}> 上传病理图数据 </h3>
      <Tabs
        defaultActiveKey="images"
        onChange={key => {
          setTabValue(key)
          setUploadProcess(0)
        }}
      >
        <TabPane  tab="txt文本文件" key="txt" disabled={uploading}>
            <p style={{ opacity: '0.7', fontSize: '17px' }}>
                请上传文本文件, 根据行数生成项目个数, 文本文件的每行为图片所在文件夹的绝对路径 <br />
            </p>
            <div style={{ margin: '20px auto', width: '200px', textAlign: 'left' }}>
            <Dragger
              beforeUpload={beforeUpload}
              showUploadList={true}
              maxCount={1} 
              accept=".txt"
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域</p>
            </Dragger>
          </div>
        </TabPane>
        {/* <TabPane tab="图片文件" key="images" disabled={uploading}>
          <p style={{ opacity: '0.7', fontSize: '17px' }}>
            选择一张或多张（最多20张）图片 <br />
          </p>
          <div style={{ margin: '20px auto', width: '200px', textAlign: 'left' }}>
            <Dragger
              beforeUpload={beforeUpload}
              onChange={onImageChange}
              multiple
              maxCount={20}
              accept="image/*"
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域</p>
            </Dragger>
          </div>
        </TabPane>
        <TabPane tab="Zip文件" key="zip" disabled={uploading}>
          <p style={{ opacity: '0.7', fontSize: '17px' }}>一个包含所有图片的压缩文件</p>
          <p style={{ opacity: '0.7', fontSize: '17px' }}>
            压缩包类型: .zip,.gzip,.gz,.tar,.mrxs,.nii,.dcm,.svs,.tif
          </p>
          <div style={{ margin: '20px auto', width: '200px', textAlign: 'left' }}>
            <Dragger
              beforeUpload={beforeUpload}
              maxCount={1}
              accept=".zip,.gzip,.gz,.tar,.mrxs,.nii,.dcm,.svs,.tif"
              showUploadList={false}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域</p>
            </Dragger>
          </div>
          {zipFile && (
            <div className={styles.fileList}>
              <FileZipOutlined style={{ fontSize: '26px' }} />
              <span style={{ margin: '0 15px' }}>{zipFile.name}</span>
              {`size: ${bytes(zipFile.size)}`}
              <DeleteOutlined
                style={{ marginLeft: 'auto', cursor: 'pointer' }}
                onClick={() => setZipFile(null)}
              />
            </div>
          )}
        </TabPane> */}
      </Tabs>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {(uploading || uploadProcess > 0) && (
          <Progress
            percent={Number(uploadProcess.toFixed(2))}
            style={{ width: '400px', margin: 'auto' }}
          />
        )}
        {
            uploading && (
                <Spin tip={"文件正在解析到数据库"} style={{margin: '20px auto'}}></Spin>
            )
        }
        <Button
          style={{ width: '200px', margin: '20px auto' }}
          type="primary"
          disabled={uploading}
          onClick={handleSubmit}
        >
          提交
        </Button>
      </div>
    </div>
  )
}

export default UploadMrxsFile
