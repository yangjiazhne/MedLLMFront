/*
 * @Author: Azhou
 * @Date: 2021-05-11 23:17:06
 * @LastEditors: Azhou
 * @LastEditTime: 2021-11-29 17:00:14
 */
export const VISIBILITY_FILTERS = {
    ALL: 'all',
    COMPLETED: 'completed',
    INCOMPLETE: 'incomplete',
}

let serverAddress
serverAddress = 'http://10.214.242.156'

// 前后端服务器地址请在这里修改
export const imgUploadPre = `${serverAddress}:3030`
// java服务端地址
export const SERVER_HOST = `${serverAddress}:7556`
// python服务端地址
export const PYTHON_SERVER_HTTP = `${serverAddress}:5088/`
// export const PYTHON_SERVER_WS = 'ws://10.214.242.156:5088/'
export const PYTHON_SERVER_WS = 'ws://10.214.242.156:5088/'

export const BASE_URL = SERVER_HOST + '/dataturks/'

// 标注页面的形状绘制类型
export const hitShapeTypes = {
    POINT: 'point',
    CIRCLE: 'circle',
    ELLIPSE: 'ellipse',
    RECT: 'boundingBox',
    POLYGON: 'polygon',
    POLYGONPATH: 'polygonPath',
    PATH: 'path',
    NONE:'none' //拖拽状态
}

export const hitShapeTypeLabels = {
    [hitShapeTypes.POINT]: '点',
    [hitShapeTypes.CIRCLE]: '圆',
    [hitShapeTypes.ELLIPSE]: '椭圆',
    [hitShapeTypes.RECT]: '矩形',
    [hitShapeTypes.POLYGON]: '多边形',
    [hitShapeTypes.POLYGONPATH]: '自由路径',
    [hitShapeTypes.PATH]: '路径',
    [hitShapeTypes.NONE]: '无' // 拖拽状态
};

export const contorlTypes = {
    DRAG: 'drag',
    DEFAULT: 'default'
}

// 标注页面path路径生成方式
export const traPathGenerateWay = {
    GRABCUT: 'Grabcut',
    CANNY: 'Canny',
    REGIONGROW: 'RegionGrow',
    THRESHOLD: 'Threshold',
    WATERSHED: 'WaterShed',
    REGIONSPLITMERGE: 'RegionSplitMerge',
}

export const intePathGenerateWay = {
    SAMSEG: 'sam_seg',
    EISEG: 'eiseg',
}

export const primaryColor = '#5cc1bb'

export const taskArr = [
    { text: '分类', value: 'IMAGE_CLASSIFICATION', id: 0 },
    { text: '分割', value: 'IMAGE_SEGMENTATION', id: 1 },
    { text: '检测', value: 'IMAGE_DETECTION', id: 2 },
]

export const taskTypes = {
    0: { label: '分类', value: 'IMAGE_CLASSIFICATION' },
    1: { label: '分割', value: 'IMAGE_DETECTION_IMAGE_SEGMENTATION' },
    2: { label: '检测', value: 'IMAGE_DETECTION_IMAGE_SEGMENTATION' },
}
