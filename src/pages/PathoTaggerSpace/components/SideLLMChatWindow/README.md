## 大模型对话组件

### 传入参数

* chatHistory

格式
```js
[
    {
        msg: string,
        role: ['assistant', 'user'],
        click?: boolean
    }, ...
]
```

> 聊天记录，列表
>
> msg为聊天内容，role为当前聊天信息所属角色
>
> click定义当前消息是否可点击
> 
> 对象内可携带多余信息，会在点击消息时一并被返回

* onMessageSend

格式
```js
function onMessageSend(message: String) {
    ...
}
```

> 对话框文本输入发送后回调函数
> 
> 需要在父组件处理用户侧消息推入chatHistory
> 
> *可能存在的问题*
> 
> 消息推入chatHistory后不更新
>
> => 每次更新时，将父组件中存储消息记录的列表使用`[...chatHistory]`进行浅拷贝更换地址，触发更新机制
> 
> LLM回复消息会把用户消息顶掉（通过上述方法浅拷贝地址后）
> 
> => 根本原因为React的State更新后不会立即更新数据对象；可使用useRef对象另建一个共享的、与`chatHistory`内容相同但地址不同的对象，每次更新`chatHistory`时同步更新此对象（新建地址）；可参考我这边修改后的PathTaggerSpace.jxs

* onMessageClick

格式
```js
function onMessageClick(messageItem: object) {
    ...
}
```

> 点击可点击的消息时的回调函数
>
> 返回整个消息对象，包括额外附加在对象中的信息

### 元素DOM位置

示例
```html
<div class="viewerContainer" style="position: relative">
    <Canvas></Canvas>
    <ChatLLMWindow></ChatLLMWindow>
</div>
```

* 与需要具有浮动的元素同级即可
* *注意* 若父元素`position`为默认，会导致窗口全屏浮动，要限制浮动位置等于父元素大小的，对父元素设置`position: relative`

### 需要新增的依赖

```
"react-draggable": "^4.4.6",

```

### 存在的问题

* 组件的位置保存策略，若刷新后页面远小于上次页面，窗口有可能被定位到元素之外，目前可以使用"Ctrl/Command+Alt/Option+O"来强制恢复窗口位置，恢复后再次刷新页面即可