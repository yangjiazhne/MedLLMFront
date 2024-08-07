import useQuery from '@/hooks/useQuery'
import React, { useState } from 'react'
import UploadPreAnnotated from './UploadPreAnnotated'
import UploadDone from './UploadDone'
import UploadRawData from './UploadRawData'
import UploadResource from './UploadResource'
import UploadMrxsFile from './UploadMrxsFile'

const UploadProjectFile = () => {
  const { type: uplaodType } = useQuery()
  const [fileUploadStats, setFileUploadStats] = useState(null)

  if (fileUploadStats) return <UploadDone fileUploadStats={fileUploadStats} />

  return (
    <div>
      {uplaodType === 'Pre-Annotated' && (
        <UploadPreAnnotated handleUploadDone={setFileUploadStats} />
      )}
      {/* {uplaodType === 'Raw' && <UploadRawData handleUploadDone={setFileUploadStats} />} */}
      {uplaodType === 'Raw' && <UploadMrxsFile handleUploadDone={setFileUploadStats} />}
      {uplaodType === 'Resource' && <UploadResource handleUploadDone={setFileUploadStats} />}
    </div>
  )
}

export default UploadProjectFile
