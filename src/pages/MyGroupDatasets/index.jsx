import React, { useEffect, useState, useRef } from 'react'
import styles from './index.module.scss'
import { Button, Empty, message, Modal, Spin, Form, Divider, Input, Breadcrumb } from 'antd'
import { ExclamationCircleOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons'
import { VButton } from '@/components'
import { Link, useHistory, useParams } from 'react-router-dom'
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
import enUS from 'antd/es/locale/en_US';
import useDidUpdateEffect from '@/hooks/useDidUpdateEffect'
const { TextArea } = Input;
import { useTranslation } from 'react-i18next'

// 新建分组Modal Form
const GroupCreateForm = ({ open, onCreate, onCancel, title, okText, cancelText, isEdit=false, editGroup}) => {
  const [form] = Form.useForm();
  const { t, i18n } = useTranslation()
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
      cancelText={cancelText}
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
          label={t('GroupHome.createGroup.name')}
          rules={[
            {
              required: true,
              message: t('GroupHome.createGroup.nameRequired'),
            },
          ]}
        >
          <Input showCount placeholder={t('GroupHome.createGroup.nameInput')} maxLength={20}/>
        </Form.Item>
        <Form.Item name="description" label={t('GroupHome.createGroup.description')}>
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
  const { t, i18n } = useTranslation()
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
        title: t('LoginExpired.title'),
        content: t('LoginExpired.content'),
        onOk: () => logOut(history),
      })
    }
  }

  const deleteGroupModal = groupId => {
    Modal.confirm({
      title: t('GroupHome.deleteGroup.title'),
      icon: <ExclamationCircleOutlined />,
      content: t('GroupHome.deleteGroup.content'),
      okText: t('GroupHome.deleteGroup.okText'),
      cancelText: t('GroupHome.deleteGroup.cancelText'),
      onOk: async () => {
        const res = await deleteGroup(groupId)
        if (!res.err) {
          message.success( t('GroupHome.deleteGroup.success'),)
          refreshData()
        } else {
          message.error(res?.data ||  t('GroupHome.deleteGroup.error'),)
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
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/userHome/my-projects" style={{ color: 'blue' }}>
              {'userHome'}
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{'group'}</Breadcrumb.Item>
        </Breadcrumb>
        <div className={styles.title}>{t('GroupHome.title')}</div>
        <div style={{ width: '5px' }} />
        <VButton
          size="small"
          color="#308014"
          onClick={()=>{setIsAddGroupModalOpen(true)}}
          icon={<PlusOutlined />}
        >
          {t('GroupHome.newProject')}
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
                title: t('GroupHome.createGroup.groupExistTitle'),
                content: t('GroupHome.createGroup.groupExistContent'),
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
              message.success(t('GroupHome.createGroup.success'))
              refreshData()
            } else {
              message.error(res || t('GroupHome.createGroup.error'))
            }
          }}
          title={t('GroupHome.title')}
          okText={t('GroupHome.createGroup.submit')}
          cancelText={t('GroupHome.createGroup.back')}
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
          <ConfigProvider locale={i18n.language === 'en' ? enUS : zhCN}>
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
          description={<h2 className={styles.noItems}> {t('GroupHome.empty')}</h2>}
        >
          <Button type="primary" onClick={() => history.push('/userHome/import')}>
            {t('GroupHome.createButton')}
          </Button>
        </Empty>
      )}
    </Spin>
  )
}

export default MyGroupDatasets
