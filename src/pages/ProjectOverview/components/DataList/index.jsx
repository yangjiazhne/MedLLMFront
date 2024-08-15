import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Image, Tooltip, Divider, Col, Row, Space, Modal, Input, Form, Button, Checkbox, Select, message, Empty } from 'antd'
import { FormOutlined, FileSearchOutlined, PlusSquareOutlined, ExportOutlined, ExclamationCircleOutlined  } from '@ant-design/icons'
import { imgError } from './config'
import { useHistory, useParams } from 'react-router-dom'
import styles from './index.module.scss'
import { copyToClip, getStrWithLen } from '@/helpers/Utils'
import { VButton } from '@/components'
import { updateGroup,createGroup,deleteGroup,searchGroup} from '@/request/actions/group'
import { updateImage,createImage,deleteImage,searchImage} from '@/request/actions/image'

const { TextArea } = Input;
const CheckboxGroup = Checkbox.Group;
const { confirm } = Modal;

// 单张图像
const HitImage = ({ hitDetail, projectId }) => {
    return (
        <div className={styles.imgContainer}>
        <div className={styles.imgWrap}>
            <Image
              src={`/uploads/${projectId}/${hitDetail.imageId}/deepzoom/imgs/10/0_0.jpeg`}
              fallback={imgError}
              style={{ height: '130px', width: '130px'}}
            />
        </div>

        <p>
            <span>{getStrWithLen(hitDetail?.imageName.split('thumbnail')[0], 15)}</span>
            <Tooltip title={hitDetail.imageName.split('thumbnail')}>
                <FileSearchOutlined className={styles.copyBtn} />
            </Tooltip>
        </p>
        </div>
    )
}

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

// 删除分组Modal
const GroupDeleteForm = ({open, onDelete, onCancel, currentProjectGroups}) => {
    // 测试用
      const showDeleteConfirm = () => {
        const deleteGroups = currentProjectGroups.filter(group => checkedList.includes(group.imageGroupId));
        confirm({
          title: '确定删除以下分组?',
          icon: <ExclamationCircleOutlined />,
          content: (<div>
            {deleteGroups.map((item, index) => (
                <div key={index}>{item.imageGroupName}</div>
            ))}
          </div>),
          okText: '确定',
          okType: 'danger',
          cancelText: '取消',
          async onOk() {
            const res = await deleteGroup(checkedList)
            onDelete()
            if (!res.err) {
              message.success('删除成功')
            } else {
              message.error(res || '删除失败')
            }
          }
        });
      };
    const [checkedList, setCheckedList] = useState([]);
    const [indeterminate, setIndeterminate] = useState(false);
    const [checkAll, setCheckAll] = useState(false);
    const onChange = (list) => {
      setCheckedList(list);
      setIndeterminate(!!list.length && list.length < currentProjectGroups.length);
      setCheckAll(list.length === currentProjectGroups.length);
    };
    const onCheckAllChange = (e) => {
      setCheckedList(e.target.checked ? currentProjectGroups.map(group => group.imageGroupId) : []);
      setIndeterminate(false);
      setCheckAll(e.target.checked);
    };
    return (
      <Modal
        visible={open}
        title="删除分组"
        okText="删除选中"
        cancelText="取消"
        onCancel={onCancel}
        destroyOnClose
        okButtonProps={{ disabled: checkedList.length === 0 }}
        okType="danger"
        onOk={()=>{
            showDeleteConfirm()
        }}
      >
        <div style={{ boxShadow: '0 0 15px #ededed', padding: '10px', borderRadius: '4px' }}>
            <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
                全部选中
            </Checkbox>
            <Divider style={{ marginTop: '5px', marginBottom: '5px'}} />
            <div style={{maxHeight: '250px', overflowY: 'auto'}}>
                <CheckboxGroup value={checkedList} onChange={onChange}>
                    {currentProjectGroups.map(group => (
                        <div key={group.imageGroupId} style={{ marginBottom: '4px' }}>
                            <Checkbox value={group.imageGroupId}>{group.imageGroupName}</Checkbox>
                        </div>
                    ))}
                </CheckboxGroup>
            </div>
        </div>
      </Modal>
    )
}

// 移动图像Modal
const ImgMoveForm = ({open, onOk, onCancel, dispatch, projectId}) => {
    const {
      currentGroupImages, // 项目图片信息
      currentProjectGroups,
      currentGroup
    } = useSelector(
      // @ts-ignore
      state => state.project
    )
    const [checkedList, setCheckedList] = useState([])
    const [indeterminate, setIndeterminate] = useState(false)
    const [checkAll, setCheckAll] = useState(false)
    const [moveGroup, setMoveGroup] = useState(null)
    const onChange = (list) => {
      setCheckedList(list);
      setIndeterminate(!!list.length && list.length < currentGroupImages.length);
      setCheckAll(list.length === currentGroupImages.length);
    };
    const onCheckAllChange = (e) => {
      setCheckedList(e.target.checked ? currentGroupImages.map(hit => hit.imageId) : []);
      setIndeterminate(false);
      setCheckAll(e.target.checked);
    };
    const handleSelectChange = (value) => {
      setMoveGroup(value)
    };
    const options = currentProjectGroups.map(group => ({ label: group.imageGroupName, value: group.imageGroupId, disabled: group.key === currentGroup }));

    return (
      <Modal
        visible={open}
        title="移动图像"
        okText="移动"
        cancelText="取消"
        onCancel={onCancel}
        destroyOnClose
        okButtonProps={{ disabled: (checkedList.length === 0 || !moveGroup) }}
        onOk={async ()=>{
            onOk();
            const data = checkedList.map(image => ({
              imageId: image,
              newImageGroupId: moveGroup
            }));
            const res = await updateImage(data)
            if (!res.err) {
              message.success('修改成功')
              const imageRes = await searchImage(currentGroup.imageGroupId)
              dispatch({
                type: 'UPDATE_CURRENT_GROUP_IMAGES',
                payload: imageRes.data.content
              })
            } else {
              message.error(res || '修改失败')
            }
        }}
      >
        <div style={{ boxShadow: '0 0 15px #ededed', borderRadius: '4px'}}>
        <div style={{ padding: '10px'}}>
          移动至
          <Select
            placeholder="选择一个分组"
            style={{ width: 250, marginLeft:'20px' }}
            onChange={handleSelectChange}
            options={options}
          />
        </div>
        <div style={{ padding: '10px'}}>
            <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
                全部选中
            </Checkbox>
            <Divider style={{ marginTop: '5px', marginBottom: '5px'}} />
            <div style={{maxHeight: '250px', overflowY: 'auto', width: '100%'}}>
                <CheckboxGroup value={checkedList} onChange={onChange} style={{width: '100%'}}>
                    {currentGroupImages.map(hit => {
                        const isChecked = checkedList.includes(hit.imageId);
                        return (<div key={hit.imageId} 
                                      style={{
                                              marginBottom: '4px',
                                              backgroundColor: isChecked ? '#f0f0f0' : 'transparent',
                                              padding: '4px',
                                              borderRadius: '4px',
                                            }}>
                                    <Checkbox value={hit.imageId} style={{alignItems: 'center'}}>
                                        <div style={{display:'flex', alignItems: 'center'}}>
                                            <Image
                                                src={`/uploads/${projectId}/${hit.imageId}/deepzoom/imgs/10/0_0.jpeg`}
                                                fallback={imgError}
                                                preview={{ mask: null }}
                                                style={{ height: '40px', width: '40px', marginLeft: '8px', marginRight: '8px'}}
                                            />
                                            <div>{getStrWithLen(hit?.imageName.split('thumbnail')[0], 15)}</div>
                                        </div>
                                    </Checkbox>
                                </div>)})}
                </CheckboxGroup>
            </div>
        </div>
        </div>

      </Modal>
    )
}

const DataList = ({setUploadImg}) => {
    const {
        currentProjectGroups,   //当前数据集所有的组
        currentGroup, // 当前组
        currentGroupImages  //当前组的图片
      } = useSelector(
        // @ts-ignore
        state => state.project
      )
    const dispatch = useDispatch()
    const history = useHistory()

    // @ts-ignore
    let { projectId } = useParams()

    const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false)
    const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false)
    const [editGroup, setEditGroup] = useState(currentGroup)
    const [isDeleteGroupModalOpen, setIsDeleteGroupModalOpen] = useState(false)
    const [isMoveImgModalOpen, setIsMoveImgModalOpen] = useState(false)

    const fetchGroupAndImage = async() =>{
      // 获取项目所有的组
      const projectGroupsRes= await searchGroup(projectId)
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

    }

    return(
        <div className={styles.DataGroupListContainer}>
            <Row>
                <Col span={5}>
                    {/* 分组信息 */}
                    <div className={styles.groupContainer}>
                        {/* 编辑分组 */}
                        <div className={styles.groupHeader}>
                            <div style={{ color: 'rgba(0, 0, 0, 0.85)', fontWeight: 'bold', fontSize: '16px' }}>
                                分组信息
                            </div>
                            <div style={{ marginLeft: 'auto' }}>
                                 <VButton
                                    color="#ff4d4f"
                                    style={{marginRight: '5px'}}
                                    icon={<FormOutlined style={{ color: 'white' }} />}
                                    onClick={()=>{setIsDeleteGroupModalOpen(true)}}
                                >
                                    删除
                                </VButton>
                                <VButton
                                    color="#13c2c2"
                                    icon={<PlusSquareOutlined style={{ color: 'white' }} />}
                                    onClick={()=>{setIsAddGroupModalOpen(true)}}
                                >
                                    新增
                                </VButton>
                            </div>
                            <GroupDeleteForm
                                open={isDeleteGroupModalOpen}
                                onDelete={
                                  ()=>{
                                    setIsDeleteGroupModalOpen(false)
                                    fetchGroupAndImage()
                                  }}
                                onCancel={()=>{setIsDeleteGroupModalOpen(false)}}
                                currentProjectGroups={currentProjectGroups}
                            />
                            <GroupCreateForm 
                                open={isAddGroupModalOpen}
                                onCreate={async (values) => {
                                  const matchingGroup = currentProjectGroups.find(
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
                                    const projectGroupsRes= await searchGroup(projectId)
                                    dispatch({
                                      type: 'UPDATE_CURRENT_PROJECT_GROUPS',
                                      payload: projectGroupsRes.data.content,
                                    })
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
                        <Divider style={{ marginTop: '5px', marginBottom: '10px'}} />
                        {/* 分组导航 */}
                        <div className={styles.groupWrap}>
                            {currentProjectGroups.map((group, index) => (
                                <div className={styles.groupWrapItem} 
                                     key={index}
                                     style={{backgroundColor: `${currentGroup.imageGroupId === group.imageGroupId ? '#f2f4f7' : '#fff'}` }}>
                                    <div onClick={()=>{setIsEditGroupModalOpen(true);setEditGroup(group)}}>
                                        <FormOutlined style={{ color: '#1890ff' }} />
                                    </div>
                                    <div className={styles.groupWrapItemName}
                                          onClick={async ()=>{
                                            dispatch({
                                              type: 'UPDATE_CURRENT_GROUP',
                                              payload: group,
                                            })
                                            const imageRes = await searchImage(group.imageGroupId)
                                            dispatch({
                                              type: 'UPDATE_CURRENT_GROUP_IMAGES',
                                              payload: imageRes.data.content
                                            })
                                          }}>
                                        {getStrWithLen(group.imageGroupName, 15)}
                                    </div>
                                </div>
                            ))}
                            <GroupCreateForm 
                                open={isEditGroupModalOpen}
                                onCreate={async (values) => {
                                    const matchingGroup = currentProjectGroups.find(
                                      group => group.imageGroupName === values.name
                                    );
                                    if(matchingGroup && matchingGroup.imageGroupId!==editGroup.imageGroupId){
                                      Modal.error({
                                        title: '该分组名称已存在！',
                                        content: '请更换一个分组名称',
                                      });
                                      return
                                    }
                                    const res = await updateGroup({targetGroups: [
                                      {
                                        groupId: editGroup.imageGroupId,
                                        name: values.name,
                                        description: values.description
                                      }]})
                                    setIsEditGroupModalOpen(false);
                                    if (!res.err) {
                                      message.success('修改成功')
                                      // 获取项目所有的组
                                      const projectGroupsRes= await searchGroup(projectId)
                                      dispatch({
                                        type: 'UPDATE_CURRENT_PROJECT_GROUPS',
                                        payload: projectGroupsRes.data.content,
                                      })
                                      const gp = projectGroupsRes.data.find(group => group.imageGroupId === currentGroup.imageGroupId)
                                      dispatch({
                                        type: 'UPDATE_CURRENT_GROUP',
                                        payload: gp,
                                      })
                                    } else {
                                      message.error(res || '修改失败')
                                    }
                                  }}
                                onCancel={()=>{setIsEditGroupModalOpen(false)}}
                                title={"编辑组信息"}
                                okText={"完成"}
                                isEdit={true}
                                editGroup={editGroup}
                            />
                        </div>
                    </div>
                </Col>
                <Col span={1}></Col>
                <Col span={18}>
                    {/* 图像展示 */}
                    <div className={styles.dataContainer}>
                        {/* 图像上传 */}
                        <div className={styles.dataHeader}>
                            <div style={{ color: 'rgba(0, 0, 0, 0.85)', fontWeight: 'bold', fontSize: '16px' }}>
                                数据列表
                            </div>
                            <div style={{ marginLeft: 'auto' }}>
                                <VButton
                                    color="#1677ff"
                                    style={{marginRight: '5px'}}
                                    icon={<ExportOutlined style={{ color: 'white' }} />}
                                    onClick={()=>{setIsMoveImgModalOpen(true)}}
                                >
                                    移动
                                </VButton>
                                <VButton
                                    color="#52c41a"
                                    icon={<PlusSquareOutlined style={{ color: 'white' }} />}
                                    onClick={() => history.push(`/userHome/project-file/${projectId}?type=Raw`)}
                                >
                                    上传
                                </VButton>
                            </div>
                            <ImgMoveForm 
                                open={isMoveImgModalOpen}
                                onOk={() => {
                                    setIsMoveImgModalOpen(false);
                                  }}
                                onCancel={()=>{setIsMoveImgModalOpen(false)}}
                                dispatch={dispatch}
                                projectId={projectId}
                            />
                        </div>
                        <Divider style={{ marginTop: '5px', marginBottom: '10px'}} />
                        {/* 图像列表 */}
                        <div>
                            {currentGroupImages.length !==0 ? (
                              <Space wrap>
                                {currentGroupImages.map(hit => (
                                    <HitImage hitDetail={hit} projectId={projectId} key={hit.imageId} />
                                ))}
                             </Space>
                            ):(
                              <Empty
                                style={{ marginTop: '50px' }}
                                description={<h2 className={styles.noItems}>数据列表为空</h2>}
                              >
                              </Empty>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    )
}

export default DataList
