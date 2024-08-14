/*
 * @Author: Azhou
 * @Date: 2021-05-13 14:57:51
 * @LastEditors: Azhou
 * @LastEditTime: 2021-12-02 21:21:12
 */
import {
  UPDATE_USER_DETAIL,
  UPDATE_USER_PROJECTS,
  UPDATE_CURRENT_USER_PROJECTS,
  UPDATE_CURRENT_USER_PROJECTS_LENGTH,
  UPDATE_CURRENT_USER_GROUPS,
  UPDATE_CURRENT_USER_GROUPS_LENGTH,
  UPDATE_USER_LOGIN,
  UPDATE_WS_INSTANCE,
} from '../actionTypes'

export const userInitialState = {
  isLogin: false,
  user: {},
  userProjects: [],
  wsInstance: {},
  currentUserProjects: [],
  currentUserProjectsLength: 0,
  currentUserGroups: [],
  currentUserGroupsLength: 0,

}

const user = function (state = userInitialState, action) {
  switch (action.type) {
    case UPDATE_USER_LOGIN: {
      return {
        ...state,
        isLogin: action.payload,
      }
    }
    case UPDATE_USER_DETAIL: {
      return {
        ...state,
        user: action.payload,
      }
    }
    case UPDATE_USER_PROJECTS: {
      return {
        ...state,
        userProjects: action.payload,
      }
    }
    case UPDATE_CURRENT_USER_PROJECTS: {
      return {
        ...state,
        currentUserProjects: action.payload,
      }
    }
    case UPDATE_CURRENT_USER_PROJECTS_LENGTH: {
      return {
        ...state,
        currentUserProjectsLength: action.payload
      }
    }
    case UPDATE_CURRENT_USER_GROUPS: {
      return {
        ...state,
        currentUserGroups: action.payload
      }
    }
    case UPDATE_CURRENT_USER_GROUPS_LENGTH: {
      return {
        ...state,
        currentUserGroupsLength: action.payload
      }
    }
    case UPDATE_WS_INSTANCE: {
      return {
        ...state,
        wsInstance: action.payload,
      }
    }
    default:
      return state
  }
}
export default user
