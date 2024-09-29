export const renderProjectDetail = (projectDetails) => {
  if (!projectDetails) return []

  let result = [
    
    { label: 'ProjectDetail.detailTable.dataName', value: projectDetails.projectName, span: 2 },
    {
      label: 'ProjectDetail.detailTable.createTime', value: projectDetails.createdTime.substring(0, 10), span: 1},
    { label: 'ProjectDetail.detailTable.description', value: projectDetails.description, span: 3 },
  ]
  return result
}
