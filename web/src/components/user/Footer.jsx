import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from "../../assets/assets";

const Footer = () => {
  return (
    <div className='border-t border-gray-200 mt-20'>
      <div className='max-w-6xl mx-auto px-4 sm:px-8 pt-12 pb-6'>
        
        {/* ---- Main Grid ---- */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-sm'>
          
          {/* Column 1: Brand */}
          <div className='sm:col-span-2 lg:col-span-1'>
            <img className='mb-4 w-36 cursor-pointer' src={assets.logo} alt="CareFlow Logo" />
            <p className='text-gray-500 leading-relaxed max-w-xs'>
              Simplifying healthcare access. Book appointments with trusted doctors instantly through our secure and easy-to-use platform.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className='text-base font-semibold text-gray-900 mb-4'>Quick Links</h3>
            <ul className='flex flex-col gap-3 text-gray-500'>
              <NavLink to="/" className="hover:text-primary transition-colors w-fit">Home</NavLink>
              <NavLink to="/doctors" className="hover:text-primary transition-colors w-fit">All Doctors</NavLink>
              <NavLink to="/about" className="hover:text-primary transition-colors w-fit">About Us</NavLink>
              <NavLink to="/contact" className="hover:text-primary transition-colors w-fit">Contact</NavLink>
            </ul>
          </div>

          {/* Column 3: Legal / Support */}
          <div>
            <h3 className='text-base font-semibold text-gray-900 mb-4'>Support</h3>
            <ul className='flex flex-col gap-3 text-gray-500'>
              <li className='cursor-pointer hover:text-primary transition-colors w-fit'>Help Center</li>
              <li className='cursor-pointer hover:text-primary transition-colors w-fit'>Privacy Policy</li>
              <li className='cursor-pointer hover:text-primary transition-colors w-fit'>Terms of Service</li>
              <li className='cursor-pointer hover:text-primary transition-colors w-fit'>Licenses</li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className='text-base font-semibold text-gray-900 mb-4'>Get In Touch</h3>
            <ul className='flex flex-col gap-4 text-gray-500'>
              
              {/* Phone */}
              <li className='flex items-start gap-3'>
                <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                <span>+1 (123) 456-7890</span>
              </li>

              {/* Email */}
              <li className='flex items-start gap-3'>
                <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <span>support@careflow.com</span>
              </li>

            </ul>
          </div>

        </div>

        {/* ---- Bottom Copyright Bar ---- */}
        <div className='border-t border-gray-200 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400'>
          <p>Copyright 2026 © CareFlow - All rights reserved.</p>
          <p className='mt-2 sm:mt-0'>Designed with care for better health.</p>
        </div>

      </div>
    </div>
  )
}

export default Footer