import { Table, Empty } from 'antd'
import React, { useState, useMemo, useEffect } from 'react'

const DatasetTaskTable = ({ taskList }) => {
  const columns = [
    {
      title: '数据名称',
      dataIndex: 'DatasetName',
      key: 'DatasetName',
      width: '14%',
      align: 'center',
      render: text => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: '创建时间',
      dataIndex: 'CreateTime',
      key: 'CreateTime',
      width: '18%',
      align: 'center',
      render: text => <span>{text ? text.split('.')[0] : '-'}</span>,
    },
    {
      title: '状态',
      dataIndex: 'Status',
      key: 'Status',
      width: '10%',
      align: 'center',
      render: (value, record) => <span>{value}</span>,
    }
  ]

  return (
    <div>
      {taskList && taskList.length === 0 ? (
        <Empty style={{ marginTop: '50px', marginBottom: '50px'  }} description={<h2>数据全部上传成功</h2>}></Empty>
      ) : (
        <div>
          <Table columns={columns} dataSource={taskList} rowKey={record => record.TaskId} pagination={{defaultPageSize: 5}} />
        </div>
      )}
    </div>
  )
}

export default DatasetTaskTable
