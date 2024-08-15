/*
 * @Author: RunangHe
 * @Date: 2024-08-05
 */
import styles from "./index.module.scss";
import VButton from "../../../../components/VButton";
import React, {useEffect, useRef, useState} from "react";
import {Button} from "antd";
import { VIcon } from '@/components'
import { useSelector } from 'react-redux'
import {
  DoubleLeftOutlined,
  DragOutlined,
  EllipsisOutlined,
  LeftOutlined,
  PauseOutlined,
  RightOutlined
} from "@ant-design/icons";
import Draggable from "react-draggable";

const ResultListWindow = ({
                            btnList,
                            onBtnClick,
                            yPosition
                          }) => {
  const {
    currentLLMTaskType
  } = useSelector(
    // @ts-ignore
    state => state.project
  )
  const [minimizeStatus, setMinimizeStatus] = useState(false)
  const [lastDragMouseStatus, setLastDragMouseStatus] = useState({x: null, y: null})
  const [taskButton, setTaskButton] = useState([])
  const presetTypeStyle = {
    primary: {
      borderColor: '#ffaee0',
      background: 'transparent',
      color: '#ffaee0',
      padding: '6px'
    },
    warning: {
      borderColor: '#79fbf3',
      background: 'transparent',
      color: '#79fbf3',
    },
    base: {
      borderColor: '#e5c9ff',
      background: 'transparent',
      color: '#e5c9ff',
      padding: '4px'
    }
  }

  useEffect(() => {
    if(currentLLMTaskType.length>0){
      setTaskButton(currentLLMTaskType.slice(1) ?? [])
    }
  }, [currentLLMTaskType]);

  const beforeMinimizeStatus = (event, targetStatus) => {
    if(!event) {
      setMinimizeStatus(targetStatus)
      return ;
    }
    let {clientX: x, clientY: y} = event
    let {x: lastDragMouseX, y: lastDragMouseY} = lastDragMouseStatus
    if ((Math.pow(x - lastDragMouseX, 2) + Math.pow(y - lastDragMouseY, 2)) > 10) {
      event.stopPropagation()
      return;
    }
    setMinimizeStatus(targetStatus)
  }
  const handleDragMouseDown = (event) => {
    let {clientX: x, clientY: y} = event
    setLastDragMouseStatus({x, y})
  }

  const getBtnStyle = (btnItem) => {
    let styleType = btnItem['type'] ?? 'base'
    let presetStyle = presetTypeStyle[styleType]
    let finalRes = {}

    for(let styleKey in presetStyle) {
      finalRes[styleKey] = btnItem[styleKey] ?? presetStyle[styleKey]
    }

    return finalRes
  }

  const beforeBtnClick = (item, type='detail') => {
    type = type === 'detail' ? 'detail' : 'summary'
    onBtnClick({
      type,
      item: item ?? {}
    })
  }

  const setYPosition = () => {
    if(!yPosition) {
      return {}
    }
    if(typeof yPosition !== 'string') {
      yPosition = Object(yPosition).toString()
    }

    let direction = "top"
    if(yPosition.at(0) === '-') {
      direction = 'bottom'
      yPosition = yPosition.substring(1, yPosition.length)
    }

    if(yPosition.at(yPosition.length - 1) !== '%') {
      yPosition += 'px'
    }

    let res = {top: 'unset', bottom: 'unset'}
    res[direction] = yPosition
    return res
  }

  return (
    <div className={styles.outerDraggableContainer}>
      {minimizeStatus && (
          <div className={`${styles.viewerResultBG}`} style={setYPosition()}>
            <div className={styles.viewerResultList}>
              <div className={styles.viewerPredictResultContainer}>
                <p>预推理结果</p>
                <div className={styles.btnGroup}>
                  {
                    taskButton.map((item, index) => (
                      <VButton
                        className={`${styles.viewerPredictResultToReportBtn} ${styles.viewerPredictDetailBtn}`}
                        style={getBtnStyle({
                          type: 'base',
                        })}
                        onClick={(e) => beforeBtnClick(item)}
                        key={index}
                      >
                        {item.llmTaskTypeName}
                      </VButton>
                    ))
                  }
                </div>
              </div>
              <VButton className={styles.viewerPredictResultToReportBtn} onClick={() => beforeBtnClick(null, 'summary')}>
                病理报告一键生成
              </VButton>
            </div>
          </div>
      )}
      
      <div className={styles.minimize}>
          <div onClick={(e) => beforeMinimizeStatus(null, !minimizeStatus)}
               title="预推理结果"
               style={{backgroundColor: `${minimizeStatus ? 'rgba(37, 176, 229, .7)' : 'rgba(40, 49, 66, .6)'}`}}
               className={styles.minimizeBtn}>
            <VIcon type="icon-model" style={{ fontSize: '28px', marginTop:'10px' }}/>
          </div>
      </div>
    </div>
  )
}

export default ResultListWindow;