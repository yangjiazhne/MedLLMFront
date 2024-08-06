/*
 * @Author: Azhou
 * @Date: 2021-06-15 15:04:30
 * @LastEditors: Azhou
 * @LastEditTime: 2022-11-22 10:23:42
 */
import { hitShapeTypes, traPathGenerateWay, intePathGenerateWay } from '@/constants'
import { createDocEntityColorMap, createEntitiesJson } from '@/helpers/Utils'
import {
  UPDATE_CURRENT_HITS,
  UPDATE_PROJECT_DETAIL,
  UPDATE_PROJECT_HITS,
  UPDATE_PROJECT_MODELS,
  UPDATE_CURRENT_HIT_INDEX,
  UPDATE_BOUNDING_BOX_MAP,
  UPDATE_CURRENT_CANVAS,
  UPDATE_CURRENT_CLASSIFY_INFO,
  UPDATE_CURRENT_ENTITY,
  UPDATE_CURRENT_SHAPE,
  UPDATE_CURRENT_TRAPATHWAY,
  UPDATE_CURRENT_INTEPATHWAY,
  UPDATE_CURRENT_CONTROL_TYPE,
  UPDATE_CURRENT_IMAGE_SIZE,
  UPDATE_CURRENT_COLOR,
  UPDATE_CURRENT_ACTIVE_OBJ,
  UPDATE_CURRENT_VIEWER,
  UPDATE_CURRENT_GROUP,
  UPDATE_SEGPOSITIVE,
  UPDATE_SAMMODE,
  UPDATE_ISEDIT,
  UPDATE_ISMUTITAG,
  UPDATE_THRESHOLD,
  UPDATE_CANNYTHRESHOLD,
  UPDATE_CURRENT_MODEL,
  UPDATE_CURRENT_MODEL_INFERENCE,
  UPDATE_PROJECT_PATHOIMGINFO,
  UPDATE_STROKEWIDTH,
  UPDATE_CIRCLERADIUS,
  UPDATE_PATHOVIEWSIZE,
  CLEAR_PROJECT_STATE,
  UPDATE_LAUNCH_REF_PROCESS,
} from '../actionTypes'

export const projectInitialState = {
  projectDetails: {}, // 项目详情
  projectHits: [], // 项目的历史标记项
  projectModels: [], //项目使用哪些模型标记过
  currentCanvas: null, // 当前画布canvas
  entities: [],
  entityColorMap: {},
  currentHit: null, // 当前标记项
  currentEntity: '', // 当前选择的label类型
  currentShape: hitShapeTypes.NONE, // 当前选择要绘制的shape【polygon/rectangle/point/line】
  currentControlType: 'drag', // 当前画布的控制类型【default/drag】
  currentModelInference: '',
  currentIndex: 0, // 当前标记项在历史hits中的index
  currentColor: '#ff0000',  //当前标记颜色
  currentActiveObj: null,   //当前选中对象
  currentViewer: null, //当前的viewer对象
  currentGroup: '1',  //当前的组
  boundingBoxMap: [], // 当前标记项的标记信息（有可能属于全图，有可能属于切片）
  allBoundingBoxMap: [], // 当前标记图片的全图信息
  classifyInfo: {
    // 当前标记项的classification分类信息
    label: [],
    note: '',
  },
  // 当前标记图片的相关信息，供缩略图计算使用
  currentImgInfo: {
    // 缩略图左上角的起始偏移量
    sliceX: 0,
    sliceY: 0,
    // 缩略图截取的图片大小
    sliceWidth: 0,
    sliceHeight: 0,
  },
  currentImgSize: {
    width: 0,
    height: 0,
  },
  pathoImgInfo: {
    url: '',
    overlap: '',
    tileSize: '',
    format: '',
    size: {
      width: 0,
      height: 0,
    },
  },
  pathoViewSize: {
    width: 0,
    height: 0,
  },
  segPositive: true, // EISeg当前的点性质
  strokeWidth: 1, // 画笔宽度
  circleRadius: 2, // 圆形半径
  SAMMode: 'point', //SAMSeg分割形式
  isEdit: false,
  isMutiTag: false,
  cannyThreshold: [50, 100], // canny threshold
  threshold: [10, 30],
  currentModelInfo: {},
  launchRefProcess: false,
}

const project = function (state = projectInitialState, action) {
  switch (action.type) {
    case CLEAR_PROJECT_STATE:
      return projectInitialState
    case UPDATE_LAUNCH_REF_PROCESS:
      return {
        ...state,
        launchRefProcess: action.payload,
      }
    case UPDATE_PROJECT_DETAIL:
      // console.log(action.payload.taskRules)
      const entities = createEntitiesJson(action.payload.taskRules).entities
      return {
        ...state,
        projectDetails: action.payload,
        entities,
        currentEntity: entities[0],
        entityColorMap: createDocEntityColorMap(entities),
      }
    case UPDATE_PROJECT_PATHOIMGINFO:
      return {
        ...state,
        pathoImgInfo: action.payload,
      }
    case UPDATE_PROJECT_HITS:
      return {
        ...state,
        projectHits: action.payload,
      }
    case UPDATE_PROJECT_MODELS:
      return {
        ...state,
        projectModels: action.payload.models,
      }
    case UPDATE_CURRENT_COLOR:
      return {
        ...state,
        currentColor: action.payload,
      }
    case UPDATE_CURRENT_ACTIVE_OBJ:
      return {
        ...state,
        currentActiveObj: action.payload,
      }
    case UPDATE_CURRENT_VIEWER:
      return {
        ...state,
        currentViewer: action.payload
      }
    case UPDATE_CURRENT_GROUP:
      return {
        ...state,
        currentGroup: action.payload
      }
    case UPDATE_CURRENT_HITS:
      let _currentImgInfoRef = {
        sliceX: 0,
        sliceY: 0,
        sliceWidth: 0,
        sliceHeight: 0,
      }
      if (action.payload.dataIsThumbnailImg) {
        _currentImgInfoRef = action.payload.sliceInfo
        delete action.payload.sliceInfo
      }
      return {
        ...state,
        currentHit: action.payload,
        currentImgInfo: _currentImgInfoRef,
      }
    case UPDATE_CURRENT_HIT_INDEX:
      if (action.payload < 0) {
        return {
          ...state,
          currentIndex: 0,
          currentHit: null,
          boundingBoxMap: [],
          classifyInfo: {},
        }
      }
      const _currentHit = state.projectHits[action.payload] || {}

      let _boundingBox = []
      let _classifyInfo = {}

      if (_currentHit.hitResults) {
        //console.log('_currentHit.hitResults', _currentHit.hitResults, typeof _currentHit.hitResults)

        if (_currentHit.hitResults[0]?.result)
          if (typeof _currentHit.hitResults[0].result == 'string') {
            _boundingBox = JSON.parse(_currentHit.hitResults[0].result)
          } else {
            _boundingBox = _currentHit.hitResults[0].result
          }

        // 但目前并未完善多人协作标注的功能，故默认hitResults[0]为实际标注信息
        if (_currentHit.hitResults[0] && _currentHit.hitResults[0].predLabel)
          _classifyInfo = _currentHit.hitResults[0].predLabel
      }
      //console.log('_boundingBox', _boundingBox)
      return {
        ...state,
        currentIndex: action.payload,
        currentHit: {
          ..._currentHit,
        },
        // canvas绘制区要显示的标注信息，有可能属于全图，有可能属于切片
        boundingBoxMap: _boundingBox,
        // 全图的标注信息，在选择切片区域时会用到
        allBoundingBoxMap: _boundingBox,
        classifyInfo: _classifyInfo,
        currentImgInfo: { sliceX: 0, sliceY: 0, sliceWidth: 0, sliceHeight: 0 },
      }

    case UPDATE_BOUNDING_BOX_MAP:
      return {
        ...state,
        boundingBoxMap: action.payload,
      }
    case UPDATE_CURRENT_CANVAS:
      return {
        ...state,
        currentCanvas: action.payload,
      }
    case UPDATE_CURRENT_CLASSIFY_INFO:
      return {
        ...state,
        classifyInfo: action.payload,
      }
    case UPDATE_CURRENT_ENTITY:
      return {
        ...state,
        currentEntity: action.payload,
      }
    case UPDATE_CURRENT_SHAPE:
      return {
        ...state,
        currentShape: action.payload,
      }
    case UPDATE_CURRENT_TRAPATHWAY:
      return {
        ...state,
        currentTraPathWay: action.payload,
      }
    case UPDATE_CURRENT_INTEPATHWAY:
      return {
        ...state,
        currentIntePathWay: action.payload,
      }
    case UPDATE_CURRENT_MODEL_INFERENCE:
      return {
        ...state,
        currentModelInference: action.payload,
      }
    case UPDATE_CURRENT_CONTROL_TYPE:
      return {
        ...state,
        currentControlType: action.payload,
      }
    case UPDATE_CURRENT_IMAGE_SIZE:
      return {
        ...state,
        currentImgSize: action.payload,
      }
    case UPDATE_STROKEWIDTH:
      return {
        ...state,
        strokeWidth: action.payload,
      }
    case UPDATE_CIRCLERADIUS:
      return {
        ...state,
        circleRadius: action.payload,
      }
    case UPDATE_PATHOVIEWSIZE:
      return {
        ...state,
        pathoViewSize: action.payload,
      }
    case UPDATE_SEGPOSITIVE:
      return {
        ...state,
        segPositive: action.payload,
      }
    case UPDATE_SAMMODE:
      return {
        ...state,
        SAMMode: action.payload,
      }
    case UPDATE_THRESHOLD:
      return {
        ...state,
        threshold: action.payload,
      }
    case UPDATE_ISEDIT:
      return {
        ...state,
        isEdit: action.payload,
      }
    case UPDATE_ISMUTITAG:
      return {
        ...state,
        isMutiTag: action.payload,
      }
    case UPDATE_CANNYTHRESHOLD:
      return {
        ...state,
        cannyThreshold: action.payload,
      }
    case UPDATE_CURRENT_MODEL:
      return {
        ...state,
        currentModelInfo: action.payload,
      }
    default:
      return state
  }
}
export default project
