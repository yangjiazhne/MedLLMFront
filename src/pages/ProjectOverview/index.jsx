import { deleteProject, searchProject } from '@/request/actions/project'
import {
  Button,
  Descriptions,
  Modal,
  Spin,
  message,
} from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { Header, DataList } from './components'
import { renderProjectDetail } from './config'
import styles from './index.module.scss'
import { VButton } from '@/components'
import { DeleteOutlined,FormOutlined,ExclamationCircleOutlined,UnorderedListOutlined } from '@ant-design/icons'
import { searchGroup } from '@/request/actions/group'
import { searchImage, fetchImageTileInfo } from '@/request/actions/image'
import { getToken } from '@/helpers/dthelper'
import request from 'superagent';
import { Stomp, Client } from '@stomp/stompjs';
import SockJS from "sockjs-client";
import useDidUpdateEffect from '@/hooks/useDidUpdateEffect'
const ProjectOverview = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const {
    projectDetails, // 项目图片信息
    currentGroupImages,
    currentGroup, // 当前组
  } = useSelector(
    // @ts-ignore
    state => state.project
  )

  // @ts-ignore
  let { projectId } = useParams()

  const [loading, setLoading] = useState(true)
  const [uploadImg, setUploadImg] = useState(0)

  const deleteProjectModal = () => {
    Modal.confirm({
      title: '确认',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除该数据集吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const res = await deleteProject(projectId)
        if (!res.err) {
          message.success('数据集删除成功')
          history.push('/userHome/my-projects')
        } else {
          message.error(res?.data || '删除失败')
        }
      },
    })
  }

  const fetchData = async (currentGroupId) => {
    const currentProjectPid = projectId
    localStorage.setItem('currentProject', currentProjectPid)

    // 获取项目详情
    const projectRes = await searchProject(projectId = currentProjectPid)
    dispatch({
      type: 'UPDATE_PROJECT_DETAIL',
      payload: projectRes.data.content[0],
    })

    // 获取项目所有的组
    const projectGroupsRes= await searchGroup(currentProjectPid)
    console.log(projectGroupsRes)
    dispatch({
      type: 'UPDATE_CURRENT_PROJECT_GROUPS',
      payload: projectGroupsRes.data.content,
    })

    dispatch({
      type: 'UPDATE_CURRENT_GROUP',
      payload: projectGroupsRes.data.content[0],
    })
    
    // 获取index为0的组下所有的图片信息
    const imageRes = await searchImage(projectGroupsRes.data.content[0].imageGroupId)
    dispatch({
      type: 'UPDATE_CURRENT_GROUP_IMAGES',
      payload: imageRes.data.content
    })

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [projectId])

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const userToken = getToken()

    const stompClient = Stomp.over(function () {
      return new WebSocket((`ws://10.214.211.209:8082/task-progress?token=${encodeURIComponent(userToken)}`))
    })

    // stompClient.debug = () => {}; // 让控制台不输入某些多余的调试信息

    let subscription;
    
    const taskId = 'medllm_dev_pathology_image_convert_27'

    stompClient.connect(null, frame => {
      subscription = stompClient.subscribe(`/topic/task_progress/${taskId}`, message => {
        console.log('message:', message);
      });
    });

    // 清理函数
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      if (stompClient) {
        stompClient.disconnect();
      }
    }
  }, [])

  // useEffect(() => {
  //   const token = getToken()
  //   const client = new Client({
  //     brokerURL: `ws://10.214.211.209:8082/task-progress?token=${encodeURIComponent(token)}`,
  //     debug: function(str) {
  //       console.log(str);
  //     },
  //     reconnectDelay: 5000,
  //     heartbeatIncoming: 4000,
  //     heartbeatOutgoing: 4000,
  //   });
    
  //   client.onConnect = function(frame) {
  //     console.log('Connected: ' + frame);
  //     const taskId = 'medllm_dev_pathology_image_convert_27'
  //     // 订阅目的地并接收消息
  //     client.subscribe(`/topic/task_progress/${taskId}`, function(message) {
  //       console.log('Received: ' + message.body);
  //     });
  //   };

  //   client.onStompError = function(frame) {
  //     console.error('Broker reported error: ' + frame.headers['message']);
  //     console.error('Additional details: ' + frame.body);
  //   };
    
  //   client.activate();
  // },[])

  const fetchXml = async () => {
    const res = await fetchImageTileInfo(3,13)
    console.log(res)
  }

  useEffect(() => {
    fetchXml()
  }, []);

  return (
    <Spin spinning={loading}>
      {!loading && (<>
        <Header currentGroupImages={currentGroupImages} />
        <Descriptions
          bordered
          title={'数据集详情'}
          className={styles.container}
          extra={
            <div>
              <VButton
                color="purple"
                icon={<FormOutlined style={{ color: 'white' }} />}
                onClick={() => history.push(`/userHome/import?id=${projectDetails.projectId}`)}
              >
                {'编辑'}
              </VButton>
              <Button
                style={{ borderColor: 'red', borderRadius: '5px', margin: '0px 5px 0px 5px' }}
                icon={<DeleteOutlined style={{ color: 'red' }} />}
                onClick={deleteProjectModal}
                danger
              >
                {'删除'}
              </Button>
              {/* <Dropdown
                overlay={() => (
                  <Menu>
                    {getOptionsBtn({
                      history,
                      downloadFile,
                      // deleteProject,
                      // projectDetails,
                      // createByMe,
                    }).map((option, index) => (
                      <Menu.Item key={index} icon={option.icon} onClick={option.onClick}>
                        {t(option.title)}
                      </Menu.Item>
                    ))}
                  </Menu>
                )}
              >
                <VButton color={primaryColor}>
                  <UnorderedListOutlined />
                  {t('download')}
                </VButton>
              </Dropdown> */}
            </div>
          }
        >
          {renderProjectDetail(projectDetails).map((item, index) => (
            <Descriptions.Item key={index} label={item.label} span={item.span}>
              {item.value}
            </Descriptions.Item>
          ))}
        </Descriptions>
        {/* <TaskProgress></TaskProgress> */}
        <DataList setUploadImg={setUploadImg}></DataList>
      </>)}

    </Spin>
  )
}

export default ProjectOverview