import React, { useState } from 'react'
import { assets } from "../../assets/assets";

const Contact = () => {

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const onSubmitHandler = (e) => {
    e.preventDefault()
    // You can connect this to a backend API later
    alert("Message sent! (Frontend only)")
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className='max-w-6xl mx-auto px-4 sm:px-8 py-12 md:py-20'>
      
      {/* ---- Header Section ---- */}
      <div className='text-center mb-12'>
        <p className='text-sm font-medium text-primary tracking-widest uppercase'>Get In Touch</p>
        <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mt-2'>Contact Us</h1>
        <p className='text-gray-500 mt-3 max-w-lg mx-auto text-sm md:text-base'>
          Have a question, feedback, or need support? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      {/* ---- Contact Info Cards ---- */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-16'>
        
        {/* Location */}
        <div className='bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow'>
          <div className='w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4'>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>
          <h3 className='text-base font-bold text-gray-900 mb-1'>Our Office</h3>
          <p className='text-sm text-gray-500'>123 Healthcare Street,<br />Medical City, MC 12345</p>
        </div>

        {/* Phone */}
        <div className='bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow'>
          <div className='w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4'>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
          </div>
          <h3 className='text-base font-bold text-gray-900 mb-1'>Phone</h3>
          <p className='text-sm text-gray-500'>+1 (123) 456-7890<br />Mon - Sat, 8AM - 8PM</p>
        </div>

        {/* Email */}
        <div className='bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow'>
          <div className='w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4'>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
          <h3 className='text-base font-bold text-gray-900 mb-1'>Email Us</h3>
          <p className='text-sm text-gray-500'>support@careflow.com<br />info@careflow.com</p>
        </div>

      </div>

      {/* ---- Form & Image Section ---- */}
      <div className='flex flex-col lg:flex-row items-center gap-12'>
        
        {/* Left: Image (Hidden on smaller screens for a cleaner form look, or kept if preferred) */}
        <div className='w-full lg:w-1/2 hidden lg:block'>
           <img 
             className='w-full h-[550px] object-cover rounded-2xl shadow-lg' 
             src={assets.contact_image} 
             alt="Contact CareFlow" 
           />
        </div>

        {/* Right: Contact Form */}
        <div className='w-full lg:w-1/2 bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>Send us a message</h2>
          
          <form onSubmit={onSubmitHandler} className='flex flex-col gap-5'>
            
            {/* Name & Email Row */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Your Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm'
                  placeholder='John Doe'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Your Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm'
                  placeholder='john@example.com'
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Subject</label>
              <input 
                type="text" 
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm'
                placeholder='How can we help you?'
              />
            </div>

            {/* Message */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Message</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm resize-none'
                placeholder='Write your message here...'
              ></textarea>
            </div>

            {/* Submit Button */}
            <button 
              type='submit' 
              className='w-full sm:w-auto bg-primary text-white px-10 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow-md'
            >
              Send Message
            </button>

          </form>
        </div>

      </div>
      
    </div>
  )
}

export default Contact