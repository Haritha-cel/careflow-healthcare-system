import React from 'react'
import { assets } from '../../assets/assets'

const Header = () => {
    return (
        <div className='flex flex-col lg:flex-row bg-gradient-to-br from-[#0f1862] via-[#131c62] to-[#1a2580] rounded-3xl px-5 sm:px-8 md:px-10 lg:px-14 xl:px-20 overflow-hidden relative shadow-2xl shadow-blue-900/30'>

            {/* Background decorative elements */}
            <div className='absolute top-0 left-0 w-56 sm:w-72 h-56 sm:h-72 bg-white opacity-[0.03] rounded-full -translate-x-1/2 -translate-y-1/2'></div>
            <div className='absolute bottom-0 right-1/4 w-40 sm:w-56 h-40 sm:h-56 bg-white opacity-[0.03] rounded-full translate-y-1/2'></div>
            <div className='absolute top-1/2 left-1/3 w-28 sm:w-40 h-28 sm:h-40 bg-blue-400 opacity-[0.07] rounded-full hidden md:block'></div>
            <div className='absolute top-10 right-10 w-3 h-3 bg-blue-300 rounded-full opacity-30 animate-pulse hidden lg:block'></div>
            <div className='absolute bottom-20 left-20 w-2 h-2 bg-cyan-300 rounded-full opacity-20 animate-pulse hidden lg:block' style={{ animationDelay: '1s' }}></div>

            {/* ========== LEFT CONTENT ========== */}
            <div className='lg:w-[55%] flex flex-col items-start justify-center gap-4 sm:gap-5 py-8 sm:py-10 md:py-12 lg:py-[5vw] relative z-10'>

                {/* Badge */}
                <div className='flex items-center gap-2 bg-white bg-opacity-10 backdrop-blur-sm px-4 py-2 rounded-full border border-white border-opacity-10'>
                    <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.6)]'></div>
                    <span className='text-white text-xs font-medium tracking-wide'>Available 24/7</span>
                </div>

                {/* Heading */}
                <h1 className='text-white text-2xl sm:text-3xl md:text-4xl lg:text-[2.8rem] xl:text-5xl font-extrabold leading-[1.15] tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]'>
                    Book Doctors{' '}
                    <span className='bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent'>
                        in Seconds
                    </span>
                </h1>

                {/* Subtext */}
                <p className='text-blue-100/80 text-sm md:text-base font-light leading-relaxed max-w-md'>
                    Skip the waiting room. Find trusted specialists, book instantly, and get the care you deserve — all from your phone.
                </p>

                {/* User Profile - Square with White Ring */}
                <div className='flex items-center gap-3 sm:gap-4'>
                    <div className='relative'>
                        {/* Outer white ring */}
                        <div className='w-14 h-14 sm:w-16 sm:h-16 rounded-xl p-[2.5px] bg-gradient-to-br from-white/50 via-white/30 to-white/10 shadow-lg shadow-white/10'>
                            <img className='w-full h-full object-cover rounded-[9px] sm:rounded-[11px]' src={assets.mobile_user} alt="user" />
                        </div>
                        {/* Pulse dot */}
                        <div className='absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-[#131c62] shadow-[0_0_8px_rgba(74,222,128,0.6)]'></div>
                    </div>
                    <div>
                        <p className='text-white font-semibold text-sm sm:text-base flex items-center gap-2'>
                            Join the Waitlist
                        </p>
                        <p className='text-blue-200/70 text-xs sm:text-sm'>Get priority access</p>
                    </div>
                </div>

                {/* Stats */}
                <div className='flex items-center gap-4 sm:gap-6 pt-4 border-t border-white/[0.08] w-full'>
                    <div>
                        <p className='text-white font-bold text-base sm:text-lg'>100+</p>
                        <p className='text-blue-200/50 text-[11px] sm:text-xs'>Specialists</p>
                    </div>
                    <div className='w-px h-8 bg-white/10'></div>
                    <div>
                        <p className='text-white font-bold text-base sm:text-lg'>50+</p>
                        <p className='text-blue-200/50 text-[11px] sm:text-xs'>Specialities</p>
                    </div>
                    <div className='w-px h-8 bg-white/10'></div>
                    <div>
                        <p className='text-white font-bold text-base sm:text-lg'>4.9★</p>
                        <p className='text-blue-200/50 text-[11px] sm:text-xs'>Rating</p>
                    </div>
                </div>

            </div>

            {/* ========== RIGHT SIDE (Image + CTA) ========== */}
            <div className='lg:w-[45%] relative flex flex-col items-center justify-center lg:justify-center min-h-[300px] lg:min-h-0 gap-6 lg:gap-8 py-8 lg:py-[5vw]'>

                {/* Glow background */}
                <div className='absolute top-10 right-0 w-52 sm:w-64 md:w-80 h-52 sm:h-64 md:h-80 bg-blue-500/15 rounded-full blur-3xl'></div>

                {/* Header Image */}
                <div className='relative z-10'>
                    <img
                        className='w-[65%] sm:w-[70%] lg:w-[85%] max-w-[380px] lg:max-w-[420px] max-h-[340px] lg:max-h-[380px] object-contain drop-shadow-2xl animate-[float_4s_ease-in-out_infinite] mx-auto'
                        loading="lazy"
                        src={assets.head_img}
                        alt="doctor consultation"
                    />
                </div>

                {/* ========== CTA CARD ========== */}
                <div className='w-[90%] sm:w-[85%] lg:w-full max-w-[400px] bg-gradient-to-br from-white/[0.1] to-white/[0.05] backdrop-blur-xl border border-white/[0.15] rounded-2xl p-4 sm:p-5 lg:p-6 relative overflow-hidden shadow-2xl shadow-blue-900/30 hover:shadow-blue-500/20 hover:border-white/[0.25] transition-all duration-500 group z-10'>

                    {/* Animated glow line */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 left-0 w-1/3 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-400 opacity-80 animate-[shimmer_3s_ease-in-out_infinite]"></div>

                    {/* Icon & Title */}
                    <div className='flex items-center gap-3 mb-4'>
                        <div className='flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-2xl flex items-center justify-center text-2xl border border-cyan-400/20 shadow-lg shadow-cyan-500/10 group-hover:shadow-cyan-500/30 group-hover:border-cyan-400/40 transition-all duration-500 group-hover:scale-110'>
                            📱
                        </div>
                        <div className='flex-1'>
                            <p className='text-yellow-400 font-bold text-sm sm:text-base leading-snug'>
                                Book Appointments
                            </p>
                            <p className='text-blue-300/70 text-xs sm:text-sm mt-0.5 leading-relaxed'>
                                via our mobile app
                            </p>
                        </div>
                    </div>

                    {/* Store Badges */}
                    <div className='flex items-center gap-3 sm:gap-4'>

                        <a
                            href='https://play.google.com/store'
                            target='_blank'
                            rel='noreferrer'
                            className='flex-1 flex items-center justify-center gap-2 bg-black hover:bg-gray-900 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-lg shadow-black/30'
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302-2.302 2.302L15.396 12l2.302-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.635-8.635z" />
                            </svg>
                            <div className='text-left'>
                                <p className='text-[9px] sm:text-[10px] text-gray-400 leading-none'>GET IT ON</p>
                                <p className='text-xs sm:text-sm text-white font-semibold leading-tight mt-0.5'>Google Play</p>
                            </div>
                        </a>

                        <a
                            href='https://apps.apple.com'
                            target='_blank'
                            rel='noreferrer'
                            className='flex-1 flex items-center justify-center gap-2 bg-black hover:bg-gray-900 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-lg shadow-black/30'
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>
                            <div className='text-left'>
                                <p className='text-[9px] sm:text-[10px] text-gray-400 leading-none'>Download on the</p>
                                <p className='text-xs sm:text-sm text-white font-semibold leading-tight mt-0.5'>App Store</p>
                            </div>
                        </a>

                    </div>

                    {/* Bottom features */}
                    <div className='flex items-center justify-between pt-3 mt-3 border-t border-white/[0.08]'>
                        <div className='flex items-center gap-1.5'>
                            <svg className='w-3.5 h-3.5 text-green-400' fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className='text-blue-200/50 text-[10px] sm:text-xs'>Free</span>
                        </div>
                        <div className='flex items-center gap-1.5'>
                            <svg className='w-3.5 h-3.5 text-green-400' fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className='text-blue-200/50 text-[10px] sm:text-xs'>Instant</span>
                        </div>
                        <div className='flex items-center gap-1.5'>
                            <svg className='w-3.5 h-3.5 text-green-400' fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className='text-blue-200/50 text-[10px] sm:text-xs'>No Charges</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes shimmer {
                    0% { left: -33%; }
                    100% { left: 100%; }
                }
            `}</style>

        </div>
    )
}

export default Header