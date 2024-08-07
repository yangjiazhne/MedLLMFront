import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Image, Tooltip, Divider, Col, Row, Space, Modal, Input, Form, Button, Checkbox, Select } from 'antd'
import { CopyOutlined, FormOutlined, FileSearchOutlined, PlusSquareOutlined, ExportOutlined, ExclamationCircleOutlined  } from '@ant-design/icons'
import { imgError } from './config'
import { useHistory, useParams } from 'react-router-dom'
import styles from './index.module.scss'
import { copyToClip, getStrWithLen } from '@/helpers/Utils'
import { imgUploadPre } from '@/constants'
import { useTranslation } from 'react-i18next'
import { VButton } from '@/components'

const { TextArea } = Input;
const CheckboxGroup = Checkbox.Group;
const { confirm } = Modal;
// 单张图像
const HitImage = ({ hitDetail }) => {
    if (!hitDetail || !hitDetail.data || !hitDetail.fileName) return (
        <div></div>
    )

    return (
        <div className={styles.imgContainer}>
        <div className={styles.imgWrap}>
            <Image
              src={hitDetail.data}
              fallback={imgError}
              style={{ height: '130px', width: '130px'}}
            />
        </div>

        <p>
            <span>{getStrWithLen(hitDetail?.fileName.split('thumbnail')[0], 15)}</span>
            <Tooltip title={hitDetail.fileName.split('thumbnail')}>
                <FileSearchOutlined className={styles.copyBtn} />
            </Tooltip>
        </p>
        </div>
    )
}

// 新建分组Modal Form
const GroupCreateForm = ({ open, onCreate, onCancel, title, okText, isEdit=false}) => {
    console.log(open, onCreate, onCancel, title, okText, isEdit)
    const [form] = Form.useForm();
    if(isEdit){
        form.setFields([
            { name: 'name', value: '111' },
            { name: 'description', value: '222' },
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
const GroupDeleteForm = ({open, onDelete, onCancel}) => {
    // 测试用
    const groups = [
        { name: '消化道正常组织', key: '1' },
        { name: '消化道发育及结构异常', key: '2' },
        { name: '消化道炎症性疾病', key: '3' },
        // 添加更多选项以测试滚动条功能
        { name: '测试选项 1', key: '4' },
        { name: '测试选项 2', key: '5' },
        { name: '测试选项 3', key: '6' },
        { name: '测试选项 4', key: '7' },
        { name: '测试选项 5', key: '8' },
        { name: '测试选项 6', key: '9' },
        { name: '测试选项 7', key: '14' },
        { name: '测试选项 8', key: '15' },
        { name: '测试选项 9', key: '16' },
        { name: '测试选项 10', key: '17' },
        { name: '测试选项 111', key: '18' },
        { name: '测试选项 12', key: '19' },
      ];
      const showDeleteConfirm = () => {
        confirm({
          title: '确定删除以下分组?',
          icon: <ExclamationCircleOutlined />,
          content: (<div>
            {checkedList.map((item, index) => (
                <div key={index}>{item}</div>
            ))}
          </div>),
          okText: '确定',
          okType: 'danger',
          cancelText: '取消',
          onOk() {
            console.log('OK');
          },
          onCancel() {
            console.log('Cancel');
          },
        });
      };
    const options = groups.map(group => ({ label: group.name, value: group.key }));
    const [checkedList, setCheckedList] = useState([]);
    const [indeterminate, setIndeterminate] = useState(false);
    const [checkAll, setCheckAll] = useState(false);
    const onChange = (list) => {
      setCheckedList(list);
      setIndeterminate(!!list.length && list.length < groups.length);
      setCheckAll(list.length === groups.length);
    };
    const onCheckAllChange = (e) => {
      setCheckedList(e.target.checked ? groups.map(group => group.name) : []);
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
            onDelete
            console.log(checkedList)
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
                    {groups.map(group => (
                        <div key={group.key} style={{ marginBottom: '4px' }}>
                            <Checkbox value={group.name}>{group.name}</Checkbox>
                        </div>
                    ))}
                </CheckboxGroup>
            </div>
        </div>
      </Modal>
    )
}

// 移动图像Modal
const ImgMoveForm = ({open, onOk, onCancel}) => {
    const {
      projectHits, // 项目图片信息
      currentGroup, // 当前组
    } = useSelector(
      // @ts-ignore
      state => state.project
    )
    const groups = [
      { name: '消化道正常组织', key: '1' },
      { name: '消化道发育及结构异常', key: '2' },
      { name: '消化道炎症性疾病', key: '3' },
      // 添加更多选项以测试滚动条功能
      { name: '测试选项 1', key: '4' },
      { name: '测试选项 2', key: '5' },
      { name: '测试选项 3', key: '6' },
      { name: '测试选项 4', key: '7' },
      { name: '测试选项 5', key: '8' },
      { name: '测试选项 6', key: '9' },
      { name: '测试选项 7', key: '14' },
      { name: '测试选项 8', key: '15' },
      { name: '测试选项 9', key: '16' },
      { name: '测试选项 10', key: '17' },
      { name: '测试选项 111', key: '18' },
      { name: '测试选项 12', key: '19' },
    ];
    const [checkedList, setCheckedList] = useState([])
    const [indeterminate, setIndeterminate] = useState(false)
    const [checkAll, setCheckAll] = useState(false)
    const [moveGroup, setMoveGroup] = useState(null)
    const onChange = (list) => {
      setCheckedList(list);
      setIndeterminate(!!list.length && list.length < projectHits.length);
      setCheckAll(list.length === projectHits.length);
    };
    const onCheckAllChange = (e) => {
      setCheckedList(e.target.checked ? projectHits.map(hit => hit.id) : []);
      setIndeterminate(false);
      setCheckAll(e.target.checked);
    };
    const handleSelectChange = (value) => {
      console.log(`selected ${value}`);
      setMoveGroup(value)
    };
    const options = groups.map(group => ({ label: group.name, value: group.key, disabled: group.key === currentGroup }));

    return (
      <Modal
        visible={open}
        title="移动图像"
        okText="移动"
        cancelText="取消"
        onCancel={onCancel}
        destroyOnClose
        okButtonProps={{ disabled: (checkedList.length === 0 || !moveGroup) }}
        onOk={()=>{
            onOk
            console.log(checkedList)
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
                    {projectHits.map(hit => {
                        const isChecked = checkedList.includes(hit.id);
                        return (<div key={hit.id} 
                                      style={{
                                              marginBottom: '4px',
                                              backgroundColor: isChecked ? '#f0f0f0' : 'transparent',
                                              padding: '4px',
                                              borderRadius: '4px',
                                            }}>
                                    <Checkbox value={hit.id} style={{alignItems: 'center'}}>
                                        <div style={{display:'flex', alignItems: 'center'}}>
                                            <Image
                                                src={hit.data}
                                                fallback={imgError}
                                                preview={{ mask: null }}
                                                style={{ height: '40px', width: '40px', marginLeft: '8px', marginRight: '8px'}}
                                            />
                                            <div>{getStrWithLen(hit?.fileName.split('thumbnail')[0], 15)}</div>
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

const DataList = () => {
    const {
        projectHits, // 项目图片信息
        currentGroup, // 当前组
      } = useSelector(
        // @ts-ignore
        state => state.project
      )
    const dispatch = useDispatch()
    const history = useHistory()
    let { projectId } = useParams()
    // 测试用
    const groups = [{value: '消化道正常组织', key: '1'},
                    {value: '消化道发育及结构异常', key: '2'},
                    {value: '消化道炎症性疾病', key: '3'}]

    const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false)
    const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false)
    const [isDeleteGroupModalOpen, setIsDeleteGroupModalOpen] = useState(false)
    const [isMoveImgModalOpen, setIsMoveImgModalOpen] = useState(false)

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
                                onDelete={()=>{setIsDeleteGroupModalOpen(false)}}
                                onCancel={()=>{setIsDeleteGroupModalOpen(false)}}
                            />
                            <GroupCreateForm 
                                open={isAddGroupModalOpen}
                                onCreate={(values) => {
                                    console.log('Received values of form: ', values);
                                    setIsAddGroupModalOpen(false);
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
                            {groups.map((group, index) => (
                                <div className={styles.groupWrapItem} 
                                     key={index}
                                     style={{backgroundColor: `${currentGroup === group.key ? '#f2f4f7' : '#fff'}` }}>
                                    <div onClick={()=>{setIsEditGroupModalOpen(true)}}>
                                        <FormOutlined style={{ color: '#1890ff' }} />
                                    </div>
                                    <div  className={styles.groupWrapItemName}
                                          onClick={()=>{
                                            dispatch({
                                              type: 'UPDATE_CURRENT_GROUP',
                                              payload: group.key,
                                            })
                                          }}>
                                        {getStrWithLen(group.value, 15)}
                                    </div>
                                </div>
                            ))}
                            <GroupCreateForm 
                                open={isEditGroupModalOpen}
                                onCreate={(values) => {
                                    console.log('Received values of form: ', values);
                                    setIsEditGroupModalOpen(false);
                                  }}
                                onCancel={()=>{setIsEditGroupModalOpen(false)}}
                                title={"编辑组信息"}
                                okText={"完成"}
                                isEdit={true}
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
                                onOk={(values) => {
                                    console.log('Received values of form: ', values);
                                    setIsMoveImgModalOpen(false);
                                  }}
                                onCancel={()=>{setIsMoveImgModalOpen(false)}}
                            />
                        </div>
                        <Divider style={{ marginTop: '5px', marginBottom: '10px'}} />
                        {/* 图像列表 */}
                        <div>
                            <Space wrap>
                                {projectHits.slice(0, 200).map(hit => (
                                    <HitImage hitDetail={hit} key={hit.id} />
                                ))}
                            </Space>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    )
}

export default DataList
