import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { AdminContext } from '../../context/AdminContext'

const Navbar = () => {
    const navigate = useNavigate()
    const [showMenu, setShowMenu] = useState(false)
    const { aToken } = useContext(AdminContext)

    return (
        <nav className='sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm'>
            <div className='max-w-6xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16'>

                {/* LOGO */}
                <img
                    onClick={() => navigate('/')}
                    className='w-32 sm:w-36 cursor-pointer'
                    src={assets.logo}
                    alt="CareFlow Logo"
                />

                {/* DESKTOP MENU */}
                <ul className='hidden md:flex items-center gap-1'>
                    <NavLink to="/" end>
                        {({ isActive }) => (
                            <li className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-200 cursor-pointer ${
                                isActive ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}>
                                Home
                            </li>
                        )}
                    </NavLink>

                    <NavLink to="/doctors">
                        {({ isActive }) => (
                            <li className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-200 cursor-pointer ${
                                isActive ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}>
                                Doctors
                            </li>
                        )}
                    </NavLink>

                    <NavLink to="/about">
                        {({ isActive }) => (
                            <li className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-200 cursor-pointer ${
                                isActive ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}>
                                About
                            </li>
                        )}
                    </NavLink>

                    <NavLink to="/contact">
                        {({ isActive }) => (
                            <li className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-200 cursor-pointer ${
                                isActive ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}>
                                Contact
                            </li>
                        )}
                    </NavLink>
                </ul>

                {/* RIGHT SIDE: ADMIN BUTTON & HAMBURGER */}
                <div className='flex items-center gap-3'>

                    {/* ✅ UX IMPROVEMENT: Conditional Admin Button */}
                    {aToken ? (
                        // If logged in as Admin, show Dashboard shortcut
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="hidden md:flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white bg-primary px-4 py-2 rounded-full hover:bg-primary/90 transition-all duration-200 shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                            Dashboard
                        </button>
                    ) : (
                        // If NOT logged in, show Admin Login button
                        <button
                            onClick={() => navigate('/admin/login')}
                            className="hidden md:flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary border border-primary px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-all duration-200"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            Admin
                        </button>
                    )}

                    {/* Hamburger Icon */}
                    <button onClick={() => setShowMenu(true)} className='md:hidden p-2 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-colors'>
                        <img className='w-5 h-5' src={assets.menu_icon} alt='Open Menu' />
                    </button>
                </div>
            </div>

            {/* ================= MOBILE SLIDE-IN DRAWER ================= */}
            
            {/* Backdrop Overlay */}
            <div 
                className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 md:hidden ${
                    showMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`} 
                onClick={() => setShowMenu(false)}
            ></div>

            {/* Drawer Panel */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-white z-[70] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col md:hidden ${
                showMenu ? 'translate-x-0' : 'translate-x-full'
            }`}>
                
                {/* Drawer Header */}
                <div className='flex items-center justify-between p-5 border-b border-gray-200 bg-white'>
                    <img className="w-28 cursor-pointer" src={assets.logo} alt="CareFlow Logo" onClick={() => { navigate('/'); setShowMenu(false) }} />
                    <button onClick={() => setShowMenu(false)} className='p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors'>
                        <img className="w-5 h-5" src={assets.cross_icon} alt='Close Menu' />
                    </button>
                </div>

                {/* Drawer Links */}
                <ul className='flex flex-col p-5 gap-2 flex-1'>
                    <NavLink to="/" end onClick={() => setShowMenu(false)}>
                        {({ isActive }) => (
                            <li className={`px-4 py-3 rounded-xl text-base font-medium transition-all ${
                                isActive ? 'bg-primary text-white font-semibold shadow-sm' : 'text-gray-800 hover:bg-gray-100'
                            }`}>
                                Home
                            </li>
                        )}
                    </NavLink>
                    <NavLink to="/doctors" onClick={() => setShowMenu(false)}>
                        {({ isActive }) => (
                            <li className={`px-4 py-3 rounded-xl text-base font-medium transition-all ${
                                isActive ? 'bg-primary text-white font-semibold shadow-sm' : 'text-gray-800 hover:bg-gray-100'
                            }`}>
                                Doctors
                            </li>
                        )}
                    </NavLink>
                    <NavLink to="/about" onClick={() => setShowMenu(false)}>
                        {({ isActive }) => (
                            <li className={`px-4 py-3 rounded-xl text-base font-medium transition-all ${
                                isActive ? 'bg-primary text-white font-semibold shadow-sm' : 'text-gray-800 hover:bg-gray-100'
                            }`}>
                                About
                            </li>
                        )}
                    </NavLink>
                    <NavLink to="/contact" onClick={() => setShowMenu(false)}>
                        {({ isActive }) => (
                            <li className={`px-4 py-3 rounded-xl text-base font-medium transition-all ${
                                isActive ? 'bg-primary text-white font-semibold shadow-sm' : 'text-gray-800 hover:bg-gray-100'
                            }`}>
                                Contact
                            </li>
                        )}
                    </NavLink>
                </ul>

                {/* ✅ UX IMPROVEMENT: Drawer Footer (Conditional Admin Button) */}
                <div className='p-5 border-t border-gray-200 bg-gray-50'>
                    {aToken ? (
                        <button
                            onClick={() => { navigate('/admin/dashboard'); setShowMenu(false); }}
                            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-primary px-4 py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-md"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                            Admin Dashboard
                        </button>
                    ) : (
                        <button
                            onClick={() => { navigate('/admin/login'); setShowMenu(false); }}
                            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-primary border border-primary px-4 py-3.5 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            Admin Portal
                        </button>
                    )}
                </div>

            </div>
        </nav>
    )
}

export default Navbar