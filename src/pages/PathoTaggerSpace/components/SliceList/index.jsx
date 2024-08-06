import React, { useEffect, useState } from 'react'
import { CloseOutlined } from '@ant-design/icons'
import styles from './index.module.scss'
import {Divider} from 'antd'

const SliceList = ({setShowSliceList}) => {

    return (
        <div className={styles.sliceListContainer}>
            <div className={styles.innerContainer}>
                <div className={styles.sliceListHeader}>
                    <p className={styles.sliceListTitle}>切片列表</p>
                    <CloseOutlined onClick={()=>{setShowSliceList(false)}} style={{ fontSize: '20px' }}/>
                </div>
                <Divider style={{ marginTop: '10px', marginBottom: '0', backgroundColor: '#354052' }} />
                <div className={styles.sliceListBody}>
                    <div className={styles.sliceItem}>
                        <div className={styles.sliceItemImg}></div>
                    </div>
                </div>
                <Divider style={{ marginTop: '10px', marginBottom: '10px', backgroundColor: '#354052' }} />
                <div className={styles.sliceListFoot}>
                    <div className={styles.sliceListFootButton}>上一张</div>
                    <div><strong>1</strong> / 1</div>
                    <div className={styles.sliceListFootButton}>下一张</div>
                </div>
            </div>
        </div>
    )
  }
  
  export default SliceList