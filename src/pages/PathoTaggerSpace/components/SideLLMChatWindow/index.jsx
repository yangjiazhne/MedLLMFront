/*
 * @Author: RunangHe
 * @Date: 2024-07-31
 */
import React, { createRef, useEffect, useState } from 'react'
import styles from './index.module.scss'
import { VButton } from '@/components'
import { 
  BorderBottomOutlined, 
  BorderLeftOutlined, 
  BorderRightOutlined, 
  CloseOutlined, 
  SendOutlined 
} from '@ant-design/icons'
import { Button, Input } from 'antd'
// @ts-ignore
import LLMIcon from '@/assets/icon.jpg'
import Draggable from 'react-draggable'



const SideLLMChatWindow = ({
  chatHistory,
  onMessageSend,
  onMessageClick,
}) => {
  const [floatWindowSide, setFloatWindowSideInner] = useState('right')
  const [chatWindowExtraStyle, setChatWindowExtraStyle] = useState({})  // 额外的样式信息，用于存储resize后的宽高
  const [forceVerticalLayout, setForceVerticalLayout] = useState(false)  // 对话窗口横置后，是否保持竖向布局
  const [chatWindowPosition, setChatWindowPosition] = useState({x: 0, y: 0})
  const [chatWindowHide, setChatWindowHide] = useState(false)
  const [chatWindowHidedPosition, setChatWindowHidedPosition] = useState({x: 5, y: 100})
  const [enableSendBtn, setEnableSendBtn] = useState(false)
  const chatWindowDraggableObject = createRef()
  const chatWindowObject = createRef()
  const chatWindowContainerObject = createRef()
  const chatInputObject = createRef()

  const chatWindowSize = {
    // 聊天框宽高
    currentWidth: null,
    currentHeight: null,

    // 触发鼠标事件时的鼠标坐标
    triggerMouseX: null,
    triggerMouseY: null,

    // 鼠标坐标限制，父级元素的左上/右下坐标
    minMouseX: null,
    minMouseY: null,
    maxMouseX: null,
    maxMouseY: null,

    // 隐藏Icon的拖动坐标缓存
    hiddedTriggerMouseX: null,
    hiddedTriggerMouseY: null,
  }

  const cacheChatwindowLocation = function () {
    let currentStateDict = {
      position: floatWindowSide,
      width: chatWindowExtraStyle['width'] ?? null,
      height: chatWindowExtraStyle['height'] ?? null,
      draggableX: chatWindowPosition.x,
      draggableY: chatWindowPosition.y,
      hide: chatWindowHide,
    }
    localStorage.setItem('LLMChatWindowLocation', JSON.stringify(currentStateDict))
  }
  const restoreChatWindowLocation = function() {
    let stateDictStr = localStorage.getItem('LLMChatWindowLocation')
    if(!stateDictStr) {
      return ;
    }

    let stateDict = JSON.parse(stateDictStr)

    console.log("state dict to recover", stateDict)

    setFloatWindowSide(stateDict['position'] ?? 'right', false)
    resizeChatWindow(stateDict['width'] ?? null, stateDict['height'] ?? null)
    
    let {draggableX, draggableY} = stateDict  // TODO 判断恢复的拖拽位置是否在父级元素外，并对越界状态进行靠边恢复/位置重置
    if (!!chatWindowDraggableObject.current) {
      chatWindowDraggableObject.current.state.x = draggableX
      chatWindowDraggableObject.current.state.y = draggableY

      setChatWindowPosition({x: draggableX, y: draggableY})
    }

    setChatWindowHide(stateDict['hide'] ?? false)

    cacheChatwindowLocation()  // 刷新缓存
  }

  const handleHotkeysPress = (event) => {
    // console.log(event.keyCode, event.key, event.metaKey, event.altKey)
    if (event.keyCode === 79 && (event.ctrlKey || event.metaKey) && event.altKey) {  // Ctrl/CMD+Alt/Option+O
      event.preventDefault()
      resetChatWindow()
    }
  };

  const resetChatWindow = function () {
    setChatWindowPosition({x: 0, y: 0})
    if (!!chatWindowDraggableObject.current) {
      chatWindowDraggableObject.current.state.x = 0
      chatWindowDraggableObject.current.state.y = 0
    }
  }
  const resizeChatWindow = function (width=null, height=null) {
    let result = {}
    setForceVerticalLayout(false)

    if(typeof(width) === 'string') {
      width = parseInt((width).replace('px', ''))
    }
    if(typeof(height) === 'string') {
      height = parseInt((height).replace('px', ''))
    }

    if(!!width && width >= 0) {
      result['width'] = `${width}px`
      if(width <= 1100) {
        setForceVerticalLayout(true)
      }
    }
    if(!!height && height >= 0) {
      result['height'] = `${height}px`
    }
    setChatWindowExtraStyle(result)
  }

  function updateParentWindowLimitation() {
    let offsetNWX = 0, offsetNWY = 0, offsetSEX = 0, offsetSEY = 0 // 左上X&Y/右下X&Y
    let currentObject = chatWindowContainerObject.current
    offsetSEX += currentObject.offsetWidth
    offsetSEY += currentObject.offsetHeight
    while (!!currentObject) {
      offsetNWX += currentObject.offsetLeft
      offsetNWY += currentObject.offsetTop
      currentObject = currentObject.offsetParent
    }
    offsetSEX += offsetNWX
    offsetSEY += offsetNWY

    chatWindowSize.minMouseX = offsetNWX
    chatWindowSize.minMouseY = offsetNWY
    chatWindowSize.maxMouseX = offsetSEX
    chatWindowSize.maxMouseY = offsetSEY
  }
  
  const onWindowDragStop = function (event, data) {
    let {x, y} = data
    setChatWindowPosition({x, y})
  }

  const setFloatWindowSide = function (toSetSide, resize=true) {
    switch (toSetSide) {
      case 'left': setFloatWindowSideInner('left'); break;
      case 'bottom': setFloatWindowSideInner('bottom'); break;
      default: setFloatWindowSideInner('right'); break;
    }
    resetChatWindow()
    if(resize) {
      resizeChatWindow()  // 重置宽高
    }
  }
  const floatWindowClassName = {
    'left': styles.leftSide,
    'right': styles.rightSide,
    'bottom': styles.bottomSide,
  }

  const triggerOnWindowResizeMouseDown = function(event) {
    event.preventDefault()
    document.addEventListener('mousemove', triggerOnWindowResizeMouseMove)
    document.addEventListener('mouseup', triggerOnWindowResizeMouseUp)

    updateParentWindowLimitation()

    let {clientWidth, clientHeight} = chatWindowObject.current
    chatWindowSize.currentHeight = clientHeight
    chatWindowSize.currentWidth = clientWidth
  }
  const triggerOnWindowResizeMouseMove = function(event) {
    let {
      currentWidth, currentHeight, 
      triggerMouseX, triggerMouseY,
      minMouseX, minMouseY, maxMouseX, maxMouseY
    } = chatWindowSize
    let {clientX: currentMouseX, clientY: currentMouseY} = event

    currentMouseX = Math.max(currentMouseX, minMouseX); currentMouseX = Math.min(currentMouseX, maxMouseX)
    currentMouseY = Math.max(currentMouseY, minMouseY); currentMouseY = Math.min(currentMouseY, maxMouseY)

    if (triggerMouseX === null || triggerMouseY === null) {
      triggerMouseX = currentMouseX; triggerMouseY = currentMouseY
      chatWindowSize.triggerMouseX = currentMouseX; chatWindowSize.triggerMouseY = currentMouseY
    }
    if(floatWindowSide === 'right'){
      resizeChatWindow(currentWidth + (triggerMouseX - currentMouseX), currentHeight - (triggerMouseY - currentMouseY))
    } else if(floatWindowSide === 'bottom') {
      resizeChatWindow(currentWidth - (triggerMouseX - currentMouseX), currentHeight + (triggerMouseY - currentMouseY))
    }
  }
  const triggerOnWindowResizeMouseUp = function(event) {
    document.removeEventListener('mousemove', triggerOnWindowResizeMouseMove)
    document.removeEventListener('mouseup', triggerOnWindowResizeMouseUp)

    chatWindowSize.currentWidth = null
    chatWindowSize.currentHeight = null
    chatWindowSize.triggerMouseX = null
    chatWindowSize.triggerMouseY = null
    // 鼠标坐标限制可以不初始化，此处省略
  }

  const handleOnHidedIconDragStart = function(event) {
    let {layerX: x, layerY: y, offsetX: xd, offsetY: yd} = event.nativeEvent
    x -= xd + 5; y -= yd + 5
    chatWindowSize.hiddedTriggerMouseX = x
    chatWindowSize.hiddedTriggerMouseY = y
  }
  const handleOnHidedIconDragStop = function(event, uiData) {
    let {layerX: x, layerY: y, offsetX: xd, offsetY: yd} = event
    // console.log(x, y, xd, yd, event)
    x -= xd + 5; y -= yd + 5
    let {hiddedTriggerMouseX, hiddedTriggerMouseY} = chatWindowSize
    setChatWindowHidedPosition({x, y})
    if((Math.pow(x - hiddedTriggerMouseX, 2) + Math.pow(y - hiddedTriggerMouseY, 2)) < 10) {
      setChatWindowHide(false)
    }
  }

  const beforeMessageSend = function () {
    let chatContent = chatInputObject.current.state.value ?? ""
    if (chatContent === "") {
      return;
    }
    onMessageSend(chatContent)
  }
  const handleMessageInput = function(event) {
    let chatMessage = event.nativeEvent.target.value
    setEnableSendBtn(chatMessage !== "")
  }
  const handleChatInputKeyDown = function(event) {
    let {keyCode} = event
    if(keyCode == 13) {  // ENTER
      beforeMessageSend()
    }
  }

  useEffect(() => {
    restoreChatWindowLocation()
  }, [])
  useEffect(() => {
    cacheChatwindowLocation()
  }, [
    chatWindowPosition, 
    chatWindowExtraStyle, 
    floatWindowSide,
    chatWindowHide
  ])
  useEffect(() => {
    document.addEventListener('keydown', handleHotkeysPress)
  }, [])


  return (
    <div 
      className={styles.outerDraggableContainer}
      ref={chatWindowContainerObject}
    >
      {!chatWindowHide && (
        <Draggable 
          handle={`.${styles.controlPanel}`}  // 只有与此元素交互才能拖拽
          bounds={`.${styles.outerDraggableContainer}`}  // 拖拽边界，为父级一个无交互的最大元素
          onStop={onWindowDragStop}
          ref={chatWindowDraggableObject}
        >
          <div 
            className={`${styles.chatWindow} ${floatWindowClassName[floatWindowSide]}`}
            style={chatWindowExtraStyle}
            ref={chatWindowObject}
          >
            <div className={styles.resizeBar} onMouseDown={triggerOnWindowResizeMouseDown}></div>
            <div style={{display: 'flex', flexDirection: 'column', height: '100%', width: '100%'}}>
                <div className={styles.controlPanel}>  {/* 顶部控制栏 */}
                <div style={{flex: '1', display: 'flex'}}>
                  <div className={styles.btnGroup}>
                  {/* {floatWindowSide !== 'left' && (<VButton onClick={() => setFloatWindowSide('left')}><BorderLeftOutlined /></VButton>)} */}
                  {floatWindowSide !== 'bottom' && (<Button onClick={() => setFloatWindowSide('bottom')} type='text'><BorderBottomOutlined /></Button>)}
                  {floatWindowSide !== 'right' && (<Button onClick={() => setFloatWindowSide('right')} type='text'><BorderRightOutlined /></Button>)}
                  </div>
                  <div style={{flex: '1', textAlign: 'center'}}>
                    OmniPT
                  </div>
                </div>
                <div style={{width: '40px'}}>
                  <Button type='text' style={{padding: '4px 8px'}} block onClick={() => setChatWindowHide(true)}><CloseOutlined /></Button>
                </div>
              </div>
              <div className={styles.chatContainer}>
                {chatHistory.length === 0 && (
                  <div className={`${styles.infoContainer} ` + 
                    `${floatWindowSide === 'bottom' && !forceVerticalLayout ? styles.horizen : ''}`}>
                    <img src={LLMIcon}/>
                    <p>
                      OmniPT V1.0 一款为病理图研发的大模型，作为您的病理诊断分析智能助手，提升病理诊断效率！
                    </p>
                    <div>
                      <div className={styles.featureCards}>
                        <div>
                          <div>病变识别</div>
                          <p>肿瘤分级、分型等识别任务</p>
                        </div>
                        <div>
                          <div>扩散分析</div>
                          <p>MVI识别、神经侵犯、淋巴转移等</p>
                        </div>
                        <div>
                          <div>疗效预测</div>
                          <p>预后、疗效等预测任务</p>
                        </div>
                        <div>
                          <div>基础能力</div>
                          <p>血管、细胞、组织、腺体等识别</p>
                        </div>
                      </div>  
                    </div>  {/* END OF CARDS GRID */}
                  </div>  // END OF INFO CONTAINER
                )}
                <div className={styles.chatList}>
                  {chatHistory.map((item, index) => (
                    (item.role === 'user' || item.role === 'assistant') && (
                      <div key={index} className={`${styles.chatListItem} ${item.role === "user" ? styles.userContent : ""}`}>
                        <div>
                          <div>{item.msg}</div>
                          {(item.click ?? false) && (
                            <div className={styles.hr}></div>
                          )}
                          {(item.click ?? false) && (
                            <Button type='text' size='small' onClick={() => onMessageClick(item)}>显示图形诊断结果</Button>
                          )}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
              <div className={styles.inputContainer}>
                <Input placeholder='Type to chat...' type='text' ref={chatInputObject} onChange={handleMessageInput} onKeyDown={handleChatInputKeyDown}/>
                <Button onClick={beforeMessageSend} disabled={!enableSendBtn}>
                  <SendOutlined />
                </Button>
              </div>
            </div>
          </div>
        </Draggable>
      )}
    {chatWindowHide && (
      <Draggable
        handle={`.${styles.chatHideIcon}`}
        bounds={`.${styles.outerDraggableContainer}`}
        position={chatWindowHidedPosition}
        onStart={handleOnHidedIconDragStart}
        onStop={handleOnHidedIconDragStop}
      >
          <div className={styles.chatHideIcon}>
            <img src={LLMIcon} />
          </div>
      </Draggable>
    )}
    </div>
  )
}

export default SideLLMChatWindow
