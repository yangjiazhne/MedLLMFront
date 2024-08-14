import { primaryColor } from '@/constants'
import React from 'react'
import { uploadTypes } from './config'
import styles from './index.module.scss'
import { useTranslation } from 'react-i18next'

const UploadType = ({ uploadType, setUploadType }) => {
  const { t } = useTranslation()
  return (
    <div className={styles.chooseType}>
      {uploadTypes.map(item => (
        <div
          key={item.uploadType}
          className={styles.itemWrap}
          style={{ background: uploadType === item.uploadType ? primaryColor : '#fff' }}
          onClick={() => setUploadType(item.uploadType)}
        >
          <div className={styles.header}>{t(item.header)}</div>
          <div className={styles.desc}>{t(item.desc)}</div>
        </div>
      ))}
    </div>
  )
}

export default UploadType
