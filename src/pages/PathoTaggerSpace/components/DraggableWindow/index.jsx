import React, {useState, useRef, useEffect} from 'react';
import Draggable from 'react-draggable';
import styles from './index.scss'
import {Button, Input} from "antd";
import {CaretDownOutlined, CloseOutlined, SendOutlined} from "@ant-design/icons";
import LLMIcon from "@/assets/icon.jpg";
// import { Launcher } from 'react-chat-window'

const DraggableWindow = ({
                           chatHistory,
                           onMessageSend,
                           onMessageClick
                         }) => {

  const [size, setSize] = useState({width: 100, height: 100});
  const [expansion, setExpansion] = useState(true);
  const [messageList, setMessageList] = useState([{author: "them", type: "text", data: {text: '欢迎使用大模型!'}},
    {author: "me", type: "text", data: {text: '你好!'}}])
  const [dragDisabled, setDragDisabled] = useState(true);
  const [startPosition, setStartPosition] = useState({x: 0, y: 0});
  const divRef = useRef(null);
  const isResizing = useRef(false);

  const animateDuration = 500;  // ms

  const handleExpansion = () => {
    const startTime = Date.now();
    const onFinishCB = () => setExpansion(false);
    const animate = () => {
      const currentTime = Date.now();
      const progress = (currentTime - startTime) / animateDuration; // 2000ms持续时间
      if (progress < 1) {
        setSize({
          width: Math.round(size.width + (321 - size.width) * easeInOutQuad(progress)),
          height: Math.round(size.height + (650 - size.height) * easeInOutQuad(progress)),
        });
        requestAnimationFrame(animate);
      } else {
        onFinishCB()
      }
    };
    animate();
    // setExpansion(false);
  };

  const handleShrink = () => {
    const startTime = Date.now();
    const animate = () => {
      const currentTime = Date.now();
      const progress = (currentTime - startTime) / animateDuration; // 2000ms持续时间
      if (progress < 1) {
        setSize({
          width: Math.round(size.width + (100 - size.width) * easeInOutQuad(progress)),
          height: Math.round(size.height + (100 - size.height) * easeInOutQuad(progress)),
        });
        requestAnimationFrame(animate);
      }
    };
    animate();
    setExpansion(true);
  };

  const toggleTransform = () => {
    if (!expansion) {
      handleShrink()
    } else {
      handleExpansion()
    }
  }

  const toggleDraggable = () => {
    setDragDisabled(!dragDisabled);
  };

  const onMessageWasSent = (message) => {
    setMessageList([...messageList, message])
  }

  // 使用二次函数进行内插插值以平滑动画
  const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

  // 在组件挂载后设置ref
  useEffect(() => {
    if (divRef.current) {
      divRef.current.style.width = `${size.width}px`;
      divRef.current.style.height = `${size.height}px`;
    }
  }, [size]);

  const handleMouseDown = (e) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (isResizing.current) {
      const rect = divRef.current.getBoundingClientRect();
      const newWidth = Math.max(200, rect.right - e.clientX);
      const newHeight = Math.max(500, rect.bottom - e.clientY);
      setSize({width: newWidth, height: newHeight});
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const [draggablePosition, setDraggablePosition] = useState({x: 0, y: 0});

  const lastStatus = {
    lastDragMouseX: null,
    lastDragMouseY: null,
  }

  const handleOnHidedIconDragStart = function(event) {
    let {layerX: x, layerY: y, offsetX: xd, offsetY: yd} = event.nativeEvent
    x -= xd + 5; y -= yd + 5
    lastStatus.lastDragMouseX = x
    lastStatus.lastDragMouseY = y
  }
  const handleOnHidedIconDragStop = function(event, uiData) {
    let {layerX: x, layerY: y, offsetX: xd, offsetY: yd} = event
    // console.log(x, y, xd, yd, event)
    x -= xd + 5; y -= yd + 5
    let {lastDragMouseX, lastDragMouseY} = lastStatus

    if(expansion && (Math.pow(x - lastDragMouseX, 2) + Math.pow(y - lastDragMouseY, 2)) < 10) {
      toggleTransform()
    } else {
      setDraggablePosition({x, y})
    }
  }

  const chatInputObject = useRef(null);
  const [enableSendBtn, setEnableSendBtn] = useState(false)
  const [chatInputValue, setChatInputValue] = useState("")

  const beforeMessageSend = function (event) {
    let chatContent = chatInputValue + ""
    if (chatContent === "") {
      return;
    }
    onMessageSend(chatContent)
    setChatInputValue("")
    setEnableSendBtn(false)
  }
  const handleMessageInput = function(event) {
    let chatMessage = event.nativeEvent.target.value
    setChatInputValue(chatMessage)
    setEnableSendBtn(chatMessage !== "")
  }
  const handleChatInputKeyDown = function(event) {
    let {keyCode} = event
    if(keyCode == 13) {  // ENTER
      beforeMessageSend(event)
      event.preventDefault()
    }
  }

  const chatListObject = useRef(null);
  const [chatListUserScroll, setChatListUserScroll] = useState(false)
  const [newMessageReminderShow, setNewMessageReminderShow] = useState(false)


  const onMessageReceived = function() {  // 自动聊天记录滚动
    let t = chatListObject.current
    if(chatListUserScroll) {
      setNewMessageReminderShow(true)
      return  // 避免影响用户滚动
    }
    if(!t) { return }
    let { clientHeight, scrollHeight } = t
    if(scrollHeight > clientHeight) {
      t.scrollBy({top: scrollHeight - clientHeight, behavior: 'smooth'})
    }
  }
  const onChatListScroll = function (event) {  // 用户触发滚动
    let t = event.target
    if(!t) {
      return
    }
    let { clientHeight, scrollHeight, scrollTop } = t
    if(scrollHeight <= clientHeight) {
      return
    }
    let maxScrollHeight = scrollHeight - clientHeight
    if (maxScrollHeight - scrollTop >= 240) {
      setChatListUserScroll(true)
    } else {
      setChatListUserScroll(false)
      setNewMessageReminderShow(false)
    }
  }
  const onNewMessageClick = function () {
    let t = chatListObject.current
    if(!t) { return }
    let { clientHeight, scrollHeight, scrollTop } = t
    if(scrollHeight > clientHeight) {
      t.scrollBy({top: scrollHeight - clientHeight, behavior: 'smooth'})
    }
    setNewMessageReminderShow(false)
  }

  useEffect(() => {
    onMessageReceived()
  }, [chatHistory]);

  return (
    <Draggable
      // disabled={dragDisabled}
      handle={`.expanded-handler, .hideIcon`}
      position={draggablePosition}
      onStart={handleOnHidedIconDragStart}
      onStop={handleOnHidedIconDragStop}
    >
      <div
        className="square" ref={divRef}
        style={{border: dragDisabled ? "3px solid black" : "none"}}
      >
        {/*{!expansion && (<div*/}
        {/*  className="dragHandler"*/}
        {/*  style={{*/}
        {/*    width: size.width - 4, height: "20px", top: "0%", border: "none",*/}
        {/*    borderRadius: "13px 13px 0 0", background: "purple"*/}
        {/*  }}*/}
        {/*>*/}

        {/*</div>)}*/}
        <div className={!expansion ? "expanded" : "child"}>
          {expansion ? (
            <button
              className="button hideIcon"
              // onClick={dragDisabled ? handleExpansion : null}
              style={{
                backgroundImage: `url(${LLMIcon})`,
                backgroundSize: "cover"
              }}
            ></button>
          ) : (
            // <button
            //   onClick={handleShrink}
            //   style={{position: "absolute", top: "2%", right: "2%", marginTop: "8px"}}
            // >缩小</button>
            <>
              <div className="naviBar">
                <div className="expanded-handler">
                  OmniPT
                </div>
                {/*<Button className="btn" style={{height: '100%'}}>M</Button>*/}
                <Button className="btn" style={{height: '100%'}} onClick={handleShrink}><CloseOutlined /></Button>
              </div>
              <div className="chatList" ref={chatListObject} onScroll={onChatListScroll}>
                {(!chatHistory || chatHistory.length === 0) && (
                  <div className="infoContainer">
                    <img src={LLMIcon}/>
                    <p>
                      OmniPT V1.0 一款为病理图研发的大模型，作为您的病理诊断分析智能助手，提升病理诊断效率！
                    </p>
                    <div>
                      <div className="featureCards">
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
                    </div>
                    {/* END OF CARDS GRID */}
                  </div>  // END OF INFO CONTAINER
                )}
                <div className="chatContainer">
                  {chatHistory.map((item, index) => (
                    (item.role === 'user' || item.role === 'assistant') && (
                      <div key={index}
                           className={`chatListItem ${item.role === "user" ? "userContent" : ""}`}>
                        <div>
                          <div>{item.msg}</div>
                          {(item.click ?? false) && (
                            <div className="hr"></div>
                          )}
                          {(item.click ?? false) && (
                            <Button type='text' size='small'
                                    onClick={() => onMessageClick(item)}>显示图形诊断结果</Button>
                          )}
                        </div>
                      </div>
                    )
                  ))}
                </div>
                <div
                  className="chatContainerNewMessageReminder"
                  style={{display: newMessageReminderShow ? 'block' : 'none'}}
                  onClick={onNewMessageClick}
                >
                  <CaretDownOutlined/> 收到了新消息
                </div>
              </div>
              <div className="inputContainer">
                <Input.TextArea
                  style={{resize: 'none'}}
                  ref={chatInputObject}
                  onKeyDown={handleChatInputKeyDown}
                  onChange={handleMessageInput}
                  value={chatInputValue}
                  rows={1}
                />
                <Button className="btn" style={{height: '100%'}} disabled={!enableSendBtn} onClick={() => beforeMessageSend()}><SendOutlined/></Button>
              </div>
            </>
          )}
          {!expansion && (  // handle resize interaction
            <div
              className="resizable-handler"
              onMouseDown={handleMouseDown}
            >
            </div>
          )}
        </div>
      </div>
    </Draggable>
  );
};

export default DraggableWindow;