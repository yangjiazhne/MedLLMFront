import useQuery from '@/hooks/useQuery'
import React, { useState } from 'react'
import UploadDone from './UploadDone'
import UploadMrxsFile from './UploadMrxsFile'

const UploadProjectFile = () => {
  const { type: uplaodType } = useQuery()
  const [fileUploadStats, setFileUploadStats] = useState(null)

  if (fileUploadStats) return <UploadDone fileUploadStats={fileUploadStats} />

  return (
    <div>
      <UploadMrxsFile handleUploadDone={setFileUploadStats} />
    </div>
  )
}

export default UploadProjectFile
