import React from 'react'
import { Outlet } from 'react-router'
import Nav from './Nav'

const Layout = () => {
  return (
    <>
        <Nav />
        <Outlet />
    </>
  )
}

export default Layout
