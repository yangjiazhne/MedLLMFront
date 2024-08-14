export const renderProjectDetail = (projectDetails) => {
  if (!projectDetails) return []

  let result = [
    
    { label: '数据名称', value: projectDetails.projectName, span: 2 },
    {
      label: '创建时间', value: projectDetails.createdTime.substring(0, 10), span: 1},
    { label: '简介', value: projectDetails.description, span: 3 },
  ]
  return result
}
