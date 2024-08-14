import React, { useState } from 'react'
import { SearchOutlined } from '@ant-design/icons';
import { Button } from 'antd'
import styles from './index.module.scss'
import { useTranslation } from 'react-i18next'
const SearchBar = ({ setKeyWord }) => {
    const [key, setKey] = useState('')
    const { t } = useTranslation()

    function handleSearch () {
        setKeyWord(key.trim())
    }

    const allSearch = async (e) => {
        if (e.keyCode === 13){
            setKeyWord(key.trim())
        }
    }

    return (
        <div className={styles.SearchBarDiv}>
            <input type="text"
                   value={key}
                   placeholder={t('keyword')}
                   onChange={e => setKey(e.target.value)}
                   onKeyUp={allSearch}
                   className={styles.input}/>
            <Button type="link" onClick={handleSearch} className={styles.button} icon={<SearchOutlined style={{color: 'white'}}/>}></Button>
        </div>
    )
}

export default SearchBar