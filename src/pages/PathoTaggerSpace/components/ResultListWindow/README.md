## 模型预测结果列表

### 传入参数

* btnList

格式
```js
[
  {
    type: ['primary', 'warning', 'base'],
    text: String,
    borderColor?: 'hex/color',
    background?: 'hex/color'
  }, ...
]
```

> 输出结果触发按键列表
> 
> type为按键类型，(primary, warning, base)分别关联样式(白边绿底、白边黄底、白边透明底)
> 
> text为按键显示文本
> 
> 在预设type后，可通过borderColor/background参数覆盖边框色&背景色

* onBtnClick

格式
```js
function onBtnClick(clickEvent) {
  // clickEvent:
  // {
  //   type: ['detail', 'summary']
  //   item： object
  // }
}
```

> 回调对象中
> 
> type表示按键类型（所有btnList中的均为detail，仅“病理报告一键生成”为summary）
> 
> item为按键列表内对象，当type为summary时返回一个空对象

* yPosition

*可选*

> 控制列表初始y位置，支持像素与百分比单位，默认出现在父元素最顶部
> 
> eg: 100/-100/80% => 顶部向下偏移100px/底部向上偏移100px/顶部向下偏移80%

### 元素DOM位置&依赖

*与悬浮对话窗类似*