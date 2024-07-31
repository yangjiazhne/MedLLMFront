/*
 * @Author: Azhou
 * @Date: 2021-05-11 10:47:01
 * @LastEditors: Azhou
 * @LastEditTime: 2021-11-25 10:07:05
 */
import {
  CreateProject,
  LoginAndSignUp,
  MyProjects,
  UserHome,
  ProjectOverview,
  UploadProjectFile,
  PathoTaggerSpace,
} from '../pages'

import UploadDone from '../pages/CreateProject/UploadDone'

const routes = [
  {
    path: '/entryPage',
    component: LoginAndSignUp,
  },
  {
    path: '/userHome',
    component: UserHome,
    routes: [
      {
        path: '/userHome/my-projects',
        component: MyProjects,
      },
      {
        path: '/userHome/import',
        component: CreateProject,
      },
      {
        path: '/userHome/project-file/:projectId',
        component: UploadProjectFile,
      },
      { path: '/userHome/projects/overview', component: ProjectOverview },
      { path: '/userHome/projects/:projectId', exact: true, component: ProjectOverview },
      {
        path: '/userHome/test',
        component: () => (
          <div>
            <UploadDone fileUploadStats={{ numHitsCreated: 1, numHitsIgnored: 2, taskId: 36 }} />
          </div>
        ),
      },
    ],
  },
  {
    path: '/projects/pathoSpace/:projectId',
    exact: true,
    component: PathoTaggerSpace,
  },
]

export default routes
