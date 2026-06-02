import React from 'react'
import { Outlet, useLocation } from 'react-router'
import Nav from './Nav'
import Sidebar from './Sidebar'
import RightPanel from './RightPanel'
import '../style/layout.scss'

// Pages that should NOT show sidebars (auth pages)
const AUTH_PATHS = ['/login', '/register']

const Layout = () => {
  const location = useLocation()
  const isAuthPage = AUTH_PATHS.includes(location.pathname)

  if (isAuthPage) {
    return (
      <>
        <Nav />
        <main className="auth-layout">
          <Outlet />
        </main>
      </>
    )
  }

  return (
    <>
      <Nav />
      <div className="app-layout">
        <aside className="sidebar-wrapper">
          <Sidebar />
        </aside>
        <div className="content-area">
          <Outlet />
        </div>
        <aside className="right-panel-wrapper">
          <RightPanel />
        </aside>
      </div>
    </>
  )
}

export default Layout
