import React from 'react'
import { assets } from "../../assets/assets";

const About = () => {
  return (
    <div className='max-w-6xl mx-auto px-4 sm:px-8 py-12 md:py-20'>
      
      {/* ---- Header Section ---- */}
      <div className='text-center mb-12'>
        <p className='text-sm font-medium text-primary tracking-widest uppercase'>Who We Are</p>
        <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mt-2'>
          About <span className='text-primary'>CareFlow</span>
        </h1>
      </div>

      {/* ---- Main Content: Image + Text ---- */}
      <div className='flex flex-col md:flex-row items-center gap-10 md:gap-16 mb-20'>
        
        {/* Left Image */}
        <div className='w-full md:w-1/2 flex-shrink-0'>
           <img 
             className='w-full max-w-[400px] h-[450px] mx-auto rounded-2xl shadow-lg object-cover aspect-[4/3]' 
             src={assets.about_image} 
             alt="About CareFlow" 
           />
        </div>

        {/* Right Text */}
        <div className='w-full md:w-1/2 flex flex-col gap-5 text-gray-600 leading-relaxed'>
           <p>
             CareFlow is a modern healthcare platform designed to bridge the gap between patients and medical professionals. We’ve replaced long waiting room queues with a seamless digital experience, allowing you to find trusted specialists and book appointments in seconds.
           </p>
           <p>
             For doctors, CareFlow provides an intelligent dashboard to manage schedules, access patient histories securely, and focus on what matters most—delivering quality care. Our system ensures that communication is clear, data is protected, and healthcare is accessible to everyone.
           </p>
           
           {/* Vision Box */}
           <div className='bg-blue-50 border-l-4 border-primary p-5 rounded-r-xl mt-2'>
              <h3 className='text-lg font-bold text-gray-800 mb-1'>Our Vision</h3>
              <p className='text-sm text-gray-700'>
                To build a future where quality healthcare is just a tap away—creating an intelligent, patient-centric ecosystem that empowers both doctors and patients.
              </p>
           </div>
        </div>
      </div>

      {/* ---- Why Choose Us Section ---- */}
      <div className='text-center mb-10'>
        <p className='text-sm font-medium text-primary tracking-widest uppercase'>Why Choose Us</p>
        <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mt-2'>The CareFlow Advantage</h2>
      </div>

      {/* Cards Grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-10'>
        
        {/* Card 1 */}
        <div className='bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group'>
           <div className='w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300'>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           </div>
           <h3 className='text-lg font-bold text-gray-900 mb-2'>Instant Booking</h3>
           <p className='text-sm text-gray-500 leading-relaxed'>
             Skip the queue. Browse doctor availability in real-time and book your appointment in seconds.
           </p>
        </div>

        {/* Card 2 */}
        <div className='bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group'>
           <div className='w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300'>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
           </div>
           <h3 className='text-lg font-bold text-gray-900 mb-2'>Verified Specialists</h3>
           <p className='text-sm text-gray-500 leading-relaxed'>
             Access a curated network of 100+ highly qualified and verified doctors across all specialities.
           </p>
        </div>

        {/* Card 3 */}
        <div className='bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group'>
           <div className='w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300'>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
           </div>
           <h3 className='text-lg font-bold text-gray-900 mb-2'>Secure & Private</h3>
           <p className='text-sm text-gray-500 leading-relaxed'>
             Your medical data is encrypted and secure. We prioritize your privacy at every step of your journey.
           </p>
        </div>

      </div>
      
    </div>
  )
}

export default About