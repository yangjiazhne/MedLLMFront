import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CloseOutlined } from '@ant-design/icons'
import styles from './index.module.scss'
import {Divider, Collapse, Button } from 'antd'
import Draggable from 'react-draggable'; 
const { Panel } = Collapse;

const SliceList = ({setShowSliceList}) => {
    const {
        projectHits, // 项目图片信息
        currentGroup, // 当前组
      } = useSelector(
        // @ts-ignore
        state => state.project
      )

    const [bounds, setBounds] = useState({
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
    });
    const draggleRef = useRef(null);
    const onStart = (_event, uiData) => {
        const { clientWidth, clientHeight } = window.document.documentElement;
        const targetRect = draggleRef.current?.getBoundingClientRect();
        if (!targetRect) {
          return;
        }
        setBounds({
          left: -targetRect.left + uiData.x,
          right: clientWidth - (targetRect.right - uiData.x),
          top: -targetRect.top + uiData.y,
          bottom: clientHeight - (targetRect.bottom - uiData.y),
        });
      };

    
    //测试用
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

    const onChangeGroup = (key) => {
        console.log(key);
    }


    return (
        <>
            <Draggable handle={`.${styles.sliceListHeader}`} 
                       bounds={bounds}
                       onStart={(event, uiData) => onStart(event, uiData)}>
                <div className={styles.sliceListContainer} ref={draggleRef}>
                    <div className={styles.innerContainer}>
                        <div className={styles.sliceListHeader}>
                            <p className={styles.sliceListTitle}>切片列表</p>
                            <CloseOutlined onClick={()=>{setShowSliceList(false)}} style={{ fontSize: '20px' }}/>
                        </div>
                        <Divider style={{ marginTop: '10px', marginBottom: '5px', backgroundColor: '#354052' }} />
                        <div className={styles.sliceListBody}>
                            <Collapse defaultActiveKey={[currentGroup]} onChange={onChangeGroup} style={{border:'1px solid #272b33', backgroundColor:'transparent'}} className={styles.customCollapse}>
                                {groups.map(group => (
                                    <Panel header={group.name} key={group.key} style={{backgroundColor:'#414e5f', border:'1px solid #272b33', marginBottom:'2px'}}>
                                        <div style={{padding:'30px'}}>
                                            test
                                        </div>
                                        <div style={{padding:'30px'}}>
                                            test
                                        </div>
                                        <div style={{padding:'30px'}}>
                                            test
                                        </div>
                                        <div style={{padding:'30px'}}>
                                            test
                                        </div>
                                        <div style={{padding:'30px'}}>
                                            test
                                        </div>
                                        <div style={{padding:'30px'}}>
                                            test
                                        </div>
                                    </Panel>
                                ))}

                            </Collapse>
                        </div>
                        <Divider style={{ marginTop: '10px', marginBottom: '10px', backgroundColor: '#354052' }} />
                        <div className={styles.sliceListFoot}>
                            {/* <div className={styles.sliceListFootButton}>上一张</div> */}
                            <Button type="primary" ghost>
                                上一张
                            </Button>
                            <div><strong>1</strong> / 1</div>
                            <Button type="primary" ghost>
                                下一张
                            </Button>
                        </div>
                    </div>
                </div>
            </Draggable>
        </>
    )
  }
  
  export default SliceList