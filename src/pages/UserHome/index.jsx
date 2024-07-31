import React from 'react'
import { Switch } from 'react-router-dom'
import { Footer, Navbar } from '@/components'
import RouteWithSubRoutes from '@/router/routeWithSubRoutes'
import styles from './index.module.scss'

const UserHome = ({ routes }) => {

  return (
    <>
      <Navbar />
      <div className={styles.userHomeContainer}>
        <div style={{ padding: '30px', flex: 1,minHeight:'88vh' }}>
          <Switch>
            {routes.map((route, i) => (
              <RouteWithSubRoutes key={i} {...route} />
            ))}
          </Switch>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default UserHome
