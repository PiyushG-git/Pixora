import React from 'react'
import { NavLink } from 'react-router'
import { Home, TrendingUp, Compass, Info, HelpCircle, Mail, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import '../style/sidebar.scss'

const navItems = [
    { icon: Home,       label: 'Home',    path: '/',        end: true },
    { icon: TrendingUp, label: 'Popular', path: '/popular', end: false },
]

const resourceItems = [
    { icon: Info,       label: 'About',   href: '#' },
    { icon: HelpCircle, label: 'Help',    href: '#' },
    { icon: Mail,       label: 'Contact', href: '#' },
    { icon: BookOpen,   label: 'FAQ',     href: '#' },
]

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } }
}

const itemVariants = {
    hidden:  { opacity: 0, x: -12 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.25 } }
}

const Sidebar = () => {
    return (
        <motion.nav
            className="sidebar"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <p className="sidebar-section-label">Menu</p>

            {navItems.map(item => {
                const Icon = item.icon
                return (
                    <motion.div key={item.label} variants={itemVariants}>
                        <NavLink
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `sidebar-nav-item${isActive ? ' active' : ''}`
                            }
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                        </NavLink>
                    </motion.div>
                )
            })}

            <div className="sidebar-divider" />

            <p className="sidebar-section-label">Resources</p>

            {resourceItems.map(item => {
                const Icon = item.icon
                return (
                    <motion.div key={item.label} variants={itemVariants}>
                        <a href={item.href} className="sidebar-nav-item">
                            <Icon size={18} />
                            <span>{item.label}</span>
                        </a>
                    </motion.div>
                )
            })}
        </motion.nav>
    )
}

export default Sidebar
