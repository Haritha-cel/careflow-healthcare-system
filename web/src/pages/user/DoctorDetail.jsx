import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import RelatedDoctors from "../../components/user/RelatedDoctors";

const DoctorDetail = () => {

  const { docId } = useParams();
  // ✅ FIX: Changed currencySymbol to currency (to match AppContext.jsx)
  const { doctors, currency } = useContext(AppContext); 
  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null)

  const fetchDocInfo = async () => {
    if (doctors.length > 0 && docId) {
      const docInfo = doctors.find(doc => doc.id === docId || doc._id === docId)
      setDocInfo(docInfo)
    }
  }

  useEffect(() => {
    fetchDocInfo();
    // Scroll to top when doctor changes
    window.scrollTo(0, 0) 
  }, [doctors, docId]);

  // Handle missing ID
  if (!docId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <p className="text-gray-500 text-lg mb-4">Doctor information is missing.</p>
        <button onClick={() => navigate('/doctors')} className="bg-primary text-white px-6 py-2 rounded-full text-sm hover:bg-primary/90 transition-all">
          Back to Doctors List
        </button>
      </div>
    );
  }

  // Handle loading state
  if (!docInfo) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className='max-w-5xl mx-auto my-6 md:my-10'>
      
      {/* ---- Main Doctor Card ---- */}
      <div className='bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row border border-gray-100'>
        
        {/* ---- Left: Image Section ---- */}
        <div className='md:w-1/3 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8 pb-0 md:p-10'>
          <img 
            className='w-full max-w-[220px] md:max-w-[280px] rounded-2xl shadow-xl object-cover aspect-square border-4 border-white' 
            src={docInfo.image} 
            alt={docInfo.name} 
          />
        </div>

        {/* ---- Right: Info Section ---- */}
        <div className='md:w-2/3 p-6 sm:p-8 md:p-10 flex flex-col justify-center'>
          
          {/* Name & Verified */}
          <div className='flex items-center gap-2 mb-2'>
            <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
              {docInfo.name}
            </h1>
            <img className='w-6 h-6 md:w-7 md:h-7' src={assets.verified_icon} alt="Verified" />
          </div>

          {/* Degree & Speciality Badges */}
          <div className='flex flex-wrap items-center gap-2 mt-1 mb-4'>
            <span className='bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold'>
              {docInfo.degree}
            </span>
            <span className='bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold'>
              {docInfo.speciality}
            </span>
            <span className='flex items-center gap-1 text-gray-500 text-xs font-medium bg-gray-100 px-3 py-1 rounded-full'>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {docInfo.experience} Experience
            </span>
          </div>

          {/* About Section */}
          <div className='bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100'>
            <p className='flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-2'>
              About
              <img className='w-4 h-4' src={assets.info_icon} alt="Info" />
            </p>
            <p className='text-sm text-gray-600 leading-relaxed line-clamp-4'>
              {docInfo.about || "No additional information provided by the doctor."}
            </p>
          </div>

          {/* Fee & Action Row */}
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto pt-4 border-t border-gray-100'>
            <div>
              <p className='text-xs text-gray-500 uppercase tracking-wide'>Appointment Fee</p>
              <p className='text-2xl font-bold text-primary'>
                {currency}{docInfo.fees}
                <span className='text-sm font-normal text-gray-400 ml-1'>/ visit</span>
              </p>
            </div>

            {/* Since Web is public only, we don't add a "Book" button here. 
                Patients book via the Mobile App. You can add a "Download App" button if you want */}
            <button 
               onClick={() => navigate('/doctors')}
               className='w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2'
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to List
            </button>
          </div>

        </div>
      </div>

      {/* ---- Related doctors ---- */}
      <div className='mt-10'>
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
      
    </div>
  )
}

export default DoctorDetail