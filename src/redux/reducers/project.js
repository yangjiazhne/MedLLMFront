/*
 * @Author: Azhou
 * @Date: 2021-06-15 15:04:30
 * @LastEditors: Azhou
 * @LastEditTime: 2022-11-22 10:23:42
 */
import { hitShapeTypes } from '@/constants'
import {
  UPDATE_CURRENT_HITS,
  UPDATE_PROJECT_DETAIL,
  UPDATE_PROJECT_HITS,
  UPDATE_CURRENT_HIT_INDEX,
  UPDATE_BOUNDING_BOX_MAP,
  UPDATE_CURRENT_CANVAS,
  UPDATE_CURRENT_SHAPE,
  UPDATE_CURRENT_CONTROL_TYPE,
  UPDATE_CURRENT_IMAGE_SIZE,
  UPDATE_CURRENT_COLOR,
  UPDATE_CURRENT_ACTIVE_OBJ,
  UPDATE_CURRENT_VIEWER,
  UPDATE_CURRENT_GROUP,
  UPDATE_CURRENT_PROJECT_GROUPS,
  UPDATE_CURRENT_GROUP_IMAGES,
  UPDATE_CURRENT_IMAGE,
  UPDATE_CURRENT_GROUP_LENGTH,
  UPDATE_CURRENT_LLM_TASK_TYPE,
  UPDATE_ISMUTITAG,
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
  currentCanvas: null, // 当前画布canvas
  currentHit: null, // 当前标记项
  currentShape: hitShapeTypes.NONE, // 当前选择要绘制的shape【polygon/rectangle/point/line】
  currentControlType: 'drag', // 当前画布的控制类型【default/drag】
  currentIndex: 0, // 当前标记项在历史hits中的index
  currentColor: '#ff0000',  //当前标记颜色
  currentActiveObj: null,   //当前选中对象
  currentViewer: null, //当前的viewer对象
  currentProjectGroups: null, //当前项目的组信息
  currentGroup: null,  //当前选中的组信息
  currentGroupLength: 0,  //分页查询分组长度
  currentGroupImages: null, //当前组中的图像
  currentImage: null, //当前选中的图像
  currentLLMTaskType: null,  //当前的任务类型
  boundingBoxMap: [], // 当前标记项的标记信息（有可能属于全图，有可能属于切片）
  allBoundingBoxMap: [], // 当前标记图片的全图信息
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
  strokeWidth: 1, // 画笔宽度
  circleRadius: 2, // 圆形半径
  isEdit: false,
  isMutiTag: false,
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
      return {
        ...state,
        projectDetails: action.payload,
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
    case UPDATE_CURRENT_PROJECT_GROUPS:
      return {
        ...state,
        currentProjectGroups: action.payload
      }
    case UPDATE_CURRENT_GROUP_IMAGES:
      return {
        ...state,
        currentGroupImages: action.payload
      }
    case UPDATE_CURRENT_IMAGE:
      return {
        ...state,
        currentImage: action.payload
      }
    case UPDATE_CURRENT_GROUP_LENGTH:
      return {
        ...state,
        currentGroupLength: action.payload
      }
    case UPDATE_CURRENT_LLM_TASK_TYPE:
      return {
        ...state,
        currentLLMTaskType: action.payload
      }
    case UPDATE_CURRENT_HITS:
      return {
        ...state,
        currentHit: action.payload,
      }
    case UPDATE_CURRENT_HIT_INDEX:
      if (action.payload < 0) {
        return {
          ...state,
          currentIndex: 0,
          currentHit: null,
          boundingBoxMap: [],
        }
      }
      const _currentHit = state.projectHits[action.payload] || {}

      let _boundingBox = []

      if (_currentHit.hitResults) {
        if (_currentHit.hitResults[0]?.result)
          if (typeof _currentHit.hitResults[0].result == 'string') {
            _boundingBox = JSON.parse(_currentHit.hitResults[0].result)
          } else {
            _boundingBox = _currentHit.hitResults[0].result
          }

      }
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
    case UPDATE_CURRENT_SHAPE:
      return {
        ...state,
        currentShape: action.payload,
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
    case UPDATE_ISMUTITAG:
      return {
        ...state,
        isMutiTag: action.payload,
      }
    default:
      return state
  }
}
export default project
