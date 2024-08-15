import React, { useEffect, useState, useRef } from 'react'
import styles from './index.module.scss'
import { Button, Empty, message, Modal, Spin, Form, Divider, Input } from 'antd'
import { ExclamationCircleOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons'
import { VButton } from '@/components'
import { useHistory, useParams } from 'react-router-dom'
import { logOut } from '@/helpers/Utils'
import {
  deleteGroup,
  searchGroup,
  createGroup
} from '@/request/actions/group'
import SingleGroup from './SingleGroup'
import { useSelector, useDispatch } from 'react-redux'
import SearchBar from './SearchBar'
import type { PaginationProps } from 'antd'
import { ConfigProvider, Pagination } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import useDidUpdateEffect from '@/hooks/useDidUpdateEffect'
const { TextArea } = Input;

// 新建分组Modal Form
const GroupCreateForm = ({ open, onCreate, onCancel, title, okText, isEdit=false, editGroup}) => {
  const [form] = Form.useForm();
  
  if(isEdit){
      form.setFields([
          { name: 'name', value: editGroup.imageGroupName },
          { name: 'description', value: editGroup.description },
      ])
  }
  return (
    <Modal
      visible={open}
      title={title}
      okText={okText}
      cancelText="取消"
      onCancel={onCancel}
      destroyOnClose
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form.resetFields();
            onCreate(values);
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{
          modifier: 'public',
        }}
      >
        <Form.Item
          name="name"
          label="名称"
          rules={[
            {
              required: true,
              message: '请输入分组名称!',
            },
          ]}
        >
          <Input showCount placeholder="最大长度为20个字符" maxLength={20}/>
        </Form.Item>
        <Form.Item name="description" label="描述">
          <TextArea showCount maxLength={100}/>
        </Form.Item>
      </Form>
    </Modal>
  )
}

const MyGroupDatasets = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  // @ts-ignore
  let { projectId } = useParams()

  const { currentUserGroups, currentUserGroupsLength } = useSelector(
    // @ts-ignore
    state => state.user
  )

  const [loading, setLoading] = useState(false)

  //控制当前页数
  const [currentPage, setCurrentPage] = useState(1)
  //每页显示数据集个数
  const [currentPageSize, setCurrentPageSize] = useState(9)
  //当前模糊搜索关键词
  const [keyword, setKeyWord] = useState('')

  const containerRef = useRef(null)

  const refreshData = async () => {
    setLoading(true)
    
    const page =  currentPage - 1
    const size =  currentPageSize
    let groupName = null

    if(keyword !== '') groupName = keyword

    const res = await searchGroup(projectId,null,groupName,null,page,size)
    
    setLoading(false)
    if (!res.err) {
      dispatch({
        type: 'UPDATE_CURRENT_USER_GROUPS',
        payload: res.data,
      })
      dispatch({
        type: 'UPDATE_CURRENT_USER_GROUPS_LENGTH',
        payload: res.data.totalElements,
      })
    } else {
      Modal.error({
        title: '提示',
        content: '您的登录已过期，请重新登陆',
        onOk: () => logOut(history),
      })
    }
  }

  const deleteGroupModal = groupId => {
    Modal.confirm({
      title: '确认',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除该分组吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const res = await deleteGroup(groupId)
        if (!res.err) {
          message.success('分组删除成功')
          refreshData()
        } else {
          message.error(res?.data || '删除失败')
        }
      },
    })
  }

  const onChange: PaginationProps['onChange'] = pageNumber => {
    setCurrentPage(pageNumber)
  }

  useEffect(() => {
    refreshData()
  }, [currentPage, currentPageSize])

  //切换keyword时，页数重置为1
  useDidUpdateEffect(() => {
    if (currentPage !== 1) setCurrentPage(1)
    else refreshData()
  }, [keyword])

  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false)

  return (
    <Spin spinning={loading}>
      <div className={styles.titleWrap}>
        <div className={styles.title}>{'分组'}</div>
        <div style={{ width: '5px' }} />
        <VButton
          size="small"
          color="#308014"
          onClick={()=>{setIsAddGroupModalOpen(true)}}
          icon={<PlusOutlined />}
        >
          {'新建'}
        </VButton>
        <GroupCreateForm 
          open={isAddGroupModalOpen}
          onCreate={async (values) => {

            const groupRes = await searchGroup(projectId)
            const allGroups = groupRes.data.content
            const matchingGroup = allGroups.find(
              group => group.imageGroupName === values.name
            );
            if(matchingGroup){
              Modal.error({
                title: '该分组名称已存在！',
                content: '请更换一个分组名称',
              });
              return
            }
            const res = await createGroup({
              projectId: projectId,
              targetGroups:[
                {
                  name: values.name,
                  description: values.description
                },
              ]
            })
            setIsAddGroupModalOpen(false);
            if (!res.err) {
              message.success('创建成功')
              refreshData()
            } else {
              message.error(res || '创建失败')
            }
          }}
          title={"新建分组"}
          okText={"创建"}
          onCancel={()=>{setIsAddGroupModalOpen(false)}}
          isEdit={false}
      />
      </div>
      <div style={{ width: '95%', display: 'flex' }}>
        <div style={{ paddingTop: '6px', marginLeft: 'auto' }}>
          <SearchBar setKeyWord={setKeyWord}></SearchBar>
        </div>
      </div>
      <Divider />
      {currentUserGroups?.length > 0 ? (
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingLeft: '90px'
          }}
          ref={containerRef}
        >
          {currentUserGroups.map((group, index) => (
            <SingleGroup key={index} deleteGroup={deleteGroupModal} groupDetail={group} projectId={projectId}/>
          ))}
          <ConfigProvider locale={zhCN}>
            <Pagination
              current={currentPage}
              showQuickJumper
              showSizeChanger
              onShowSizeChange={(current, size) => {
                setCurrentPage(current)
                setCurrentPageSize(size)
              }}
              pageSizeOptions={['9', '10', '20', '30', '50']} // 修改这里
              defaultCurrent={1}
              defaultPageSize={9}
              total={currentUserGroupsLength}
              onChange={onChange}
              style={{
                alignSelf: 'center',
                width: '50%',
                justifyContent: 'center',
                marginLeft: '35%',
              }}
            />
          </ConfigProvider>
        </div>
      ) : (
        <Empty
          style={{ marginTop: '50px' }}
          description={<h2 className={styles.noItems}>分组列表为空</h2>}
        >
          <Button type="primary" onClick={() => history.push('/userHome/import')}>
            请创建一个分组
          </Button>
        </Empty>
      )}
    </Spin>
  )
}

export default MyGroupDatasets
