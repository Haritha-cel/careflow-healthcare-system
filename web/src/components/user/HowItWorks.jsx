import React from 'react'

const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      title: "Download App",
      description: "Get the app for free from App Store or Google Play. Create your profile in seconds.",
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      gradient: "from-blue-500 to-cyan-400",
      shadowColor: "shadow-blue-500/30",
      bgLight: "bg-blue-50",
    },
    {
      step: "02",
      title: "Find Doctor",
      description: "Search by speciality, read reviews, and check availability of top experts.",
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      gradient: "from-violet-500 to-purple-400",
      shadowColor: "shadow-violet-500/30",
      bgLight: "bg-purple-50",
    },
    {
      step: "03",
      title: "Book Instantly",
      description: "Skip the queue. Pick a time slot and confirm your appointment instantly.",
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      gradient: "from-emerald-500 to-teal-400",
      shadowColor: "shadow-emerald-500/30",
      bgLight: "bg-emerald-50",
    }
  ];

  return (
    <section className='py-16 md:py-24 px-4 sm:px-8 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden'>
      
      {/* Background Decorations */}
      <div className='absolute top-10 left-0 w-72 h-72 bg-blue-200 opacity-20 rounded-full blur-3xl -translate-x-1/2'></div>
      <div className='absolute bottom-10 right-0 w-96 h-96 bg-purple-200 opacity-20 rounded-full blur-3xl translate-x-1/2'></div>

      <div className='max-w-6xl mx-auto relative z-10'>
        
        {/* Header */}
        <div className='text-center mb-16 md:mb-20'>
          <div className='inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm mb-4'>
            <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
            SEAMLESS EXPERIENCE
          </div>
          <h1 className='text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight'>
            Healthcare in{' '}
            <span className='bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent'>
              3 Simple Steps
            </span>
          </h1>
          <p className='text-gray-500 mt-4 max-w-xl mx-auto text-sm md:text-base leading-relaxed'>
            We removed the hassle out of finding doctors. Get the care you need without the waiting room.
          </p>
        </div>

        {/* Steps Container */}
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-start gap-12 md:gap-0">
          
          {/* Mobile Vertical Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-purple-300 to-teal-300 md:hidden" style={{ backgroundSize: '100% 200%' }}></div>
          
          {/* Desktop Horizontal Dashed Line */}
          <div className="hidden md:block absolute top-12 left-[calc(16.666%+24px)] right-[calc(16.666%+24px)] h-0 border-t-2 border-dashed border-gray-200"></div>

          {steps.map((item, index) => (
            <div 
              key={index} 
              className='relative z-10 flex-1 flex flex-col md:items-center text-left md:text-center pl-16 md:pl-0 group'
            >
              
              {/* Icon Container */}
              <div className={`relative mb-6 md:mb-8`}>
                <div className={`w-14 h-14 md:w-24 md:h-24 bg-gradient-to-br ${item.gradient} rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl ${item.shadowColor} transform md:-rotate-3 group-hover:rotate-0 transition-all duration-500 group-hover:scale-110`}>
                  {item.icon}
                </div>
                
                {/* Step Number Badge */}
                <div className={`absolute -top-2 -left-2 md:-top-3 md:-right-3 w-7 h-7 md:w-9 md:h-9 bg-white text-gray-800 rounded-lg md:rounded-xl flex items-center justify-center text-xs md:text-sm font-extrabold shadow-lg border-2 border-gray-100`}>
                  {item.step}
                </div>
              </div>

              {/* Text Content */}
              <div className={`${item.bgLight} md:bg-transparent p-4 md:p-0 rounded-xl md:rounded-none -mt-2 md:mt-0`}>
                <h3 className='text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors'>
                  {item.title}
                </h3>
                <p className='text-gray-500 text-sm leading-relaxed max-w-xs mx-auto'>
                  {item.description}
                </p>
              </div>
              
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default HowItWorks