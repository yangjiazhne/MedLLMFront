/*
 * @Author: Azhou
 * @Date: 2021-11-24 18:02:41
 * @LastEditors: Azhou
 * @LastEditTime: 2022-03-01 16:48:41
 */
import React, { useState } from 'react'
import { Table, Empty } from 'antd'

const RefTaskTable = ({ taskList }) => {

  const columns = [
    {
      title: '数据名称',
      dataIndex: 'DatasetName',
      key: 'DatasetName',
      width: '15%',
      render: text => <span style={{ fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>{text}</span>,
    },
    {
      title: '创建时间',
      dataIndex: 'CreateTimeStamp',
      key: 'CreateTimeStamp',
      width: '20%',
      sorter: (a, b) => a.CreateTimeStamp - b.CreateTimeStamp,
      render: text => {
        const timestamp = Number(text) * 1000 // convert to milliseconds
        const date = new Date(timestamp)

        const year = date.getFullYear()
        const month = date.getMonth() + 1 // getMonth() returns a zero-based value (where zero indicates the first month)
        const day = date.getDate()
        const hours = date.getHours()
        const minutes = date.getMinutes()
        const seconds = date.getSeconds()

        const formattedDate = `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`
        return <span>{formattedDate}</span>
      },
    },
    {
      title: '状态',
      dataIndex: 'Status',
      key: 'status',
      width: '10%',
      render: (value, record) => <span>{value}</span>,
    }
  ]

  return (
    <>      
      {taskList && taskList.length === 0 ? (
        <Empty style={{ marginTop: '50px', marginBottom: '50px' }} description={<h2>数据全部推理成功</h2>}></Empty>
      ) : (
        <div>
          <Table
            rowKey={record => record.key}
            columns={columns}
            pagination={{defaultPageSize: 5}}
            dataSource={taskList.map((item, index) => {
              return {
                ...item,
                key: index,
              }
            })}
          />
        </div>
      )}
    </>
  )
}

export default RefTaskTable
