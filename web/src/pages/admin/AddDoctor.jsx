import React, { useState, useContext } from 'react'
import { assets } from '../../assets/admin/assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const AddDoctor = () => {

    const [docImg, setDocImg] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [experience, setExperience] = useState('1 Year')
    const [fees, setFees] = useState('')
    const [about, setAbout] = useState('')
    const [speciality, setSpeciality] = useState('General physician')
    const [degree, setDegree] = useState('')
    const [address1, setAddress1] = useState('')
    const [address2, setAddress2] = useState('')

    const { backendUrl, aToken } = useContext(AdminContext)

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        try {
            if (!docImg) {
                return toast.error('Image Not Selected')
            }

            const formData = new FormData()
            formData.append('image', docImg)
            formData.append('name', name)
            formData.append('email', email)
            formData.append('password', password)
            formData.append('experience', experience)
            formData.append('fees', Number(fees))
            formData.append('about', about)
            formData.append('speciality', speciality)
            formData.append('degree', degree)
            formData.append('address', JSON.stringify({ line1: address1, line2: address2 }))

            const { data } = await axios.post(backendUrl + '/api/admin/add-doctor', formData, {
                headers: { Authorization: `Bearer ${aToken}` }
            })

            if (data.success) {
                toast.success(data.message)
                // Reset Form
                setDocImg(false)
                setName(''); setEmail(''); setPassword('')
                setAddress1(''); setAddress2('')
                setDegree(''); setAbout(''); setFees('')
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    // Reusable input classes for consistency
    const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-gray-700 placeholder:text-gray-400"

    return (
        <div className='p-4 md:p-6 max-w-5xl mx-auto'>

            {/* ---- Page Header ---- */}
            <div className='mb-8'>
                <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>Add New Doctor</h1>
                <p className='text-gray-500 text-sm mt-1'>Fill in the details to register a new doctor.</p>
            </div>

            <form onSubmit={onSubmitHandler} className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8'>
                
                {/* ---- Image Upload Section ---- */}
                <div className='mb-8 flex flex-col items-center justify-center'>
                    <label htmlFor="doc-img" className='w-full max-w-xs h-56 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200 overflow-hidden relative group'>
                        
                        {docImg ? (
                            <img className='w-full h-full object-cover' src={URL.createObjectURL(docImg)} alt="Doctor Preview" />
                        ) : (
                            <>
                                <svg className="w-10 h-10 text-gray-300 mb-2 group-hover:text-primary/50 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                <p className='text-sm text-gray-500 font-medium'>Upload Doctor Picture</p>
                                <p className='text-xs text-gray-400 mt-1'>Click to browse</p>
                            </>
                        )}
                    </label>
                    <input onChange={(e) => setDocImg(e.target.files[0])} type="file" id="doc-img" hidden accept="image/*" />
                </div>

                {/* ---- Form Grid ---- */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5'>
                    
                    {/* Left Column */}
                    <div className='flex flex-col gap-5'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1.5'>Doctor Name <span className='text-red-500'>*</span></label>
                            <input onChange={(e) => setName(e.target.value)} value={name} className={inputClass} type='text' placeholder='e.g. Dr. John Smith' required />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1.5'>Email Address <span className='text-red-500'>*</span></label>
                            <input onChange={(e) => setEmail(e.target.value)} value={email} className={inputClass} type='email' placeholder='doctor@example.com' required />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1.5'>Password <span className='text-red-500'>*</span></label>
                            <input onChange={(e) => setPassword(e.target.value)} value={password} className={inputClass} type="password" placeholder='Min 8 characters' minLength="8" required />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1.5'>Speciality <span className='text-red-500'>*</span></label>
                            <select onChange={(e) => setSpeciality(e.target.value)} value={speciality} className={inputClass} required>
                                <option value="General physician">General physician</option>
                                <option value="Dermatologist">Dermatologist</option>
                                <option value="Gynecologist">Gynecologist</option>
                                <option value="Neurologist">Neurologist</option>
                                <option value="Pediatrician">Pediatrician</option>
                                <option value="Gastroenterologist">Gastroenterologist</option>
                            </select>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1.5'>Education <span className='text-red-500'>*</span></label>
                            <input onChange={(e) => setDegree(e.target.value)} value={degree} className={inputClass} type='text' placeholder='e.g. MBBS, MD' required />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className='flex flex-col gap-5'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1.5'>Experience <span className='text-red-500'>*</span></label>
                            <select onChange={(e) => setExperience(e.target.value)} value={experience} className={inputClass} required>
                                <option value="1 Year">1 Year</option>
                                <option value="2 Years">2 Years</option>
                                <option value="3 Years">3 Years</option>
                                <option value="4 Years">4 Years</option>
                                <option value="5 Years">5 Years</option>
                                <option value="6 Years">6 Years</option>
                                <option value="7 Years">7 Years</option>
                                <option value="8 Years">8 Years</option>
                                <option value="9 Years">9 Years</option>
                                <option value="10+ Years">10+ Years</option>
                            </select>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1.5'>Consultation Fee ($) <span className='text-red-500'>*</span></label>
                            <input onChange={(e) => setFees(e.target.value)} value={fees} className={inputClass} type="number" placeholder='e.g. 50' required />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1.5'>Address Line 1 <span className='text-red-500'>*</span></label>
                            <input onChange={(e) => setAddress1(e.target.value)} value={address1} className={inputClass} type='text' placeholder='Clinic/Hospital Name' required />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1.5'>Address Line 2 <span className='text-red-500'>*</span></label>
                            <input onChange={(e) => setAddress2(e.target.value)} value={address2} className={inputClass} type='text' placeholder='Street, City, Zip Code' required />
                        </div>
                    </div>
                </div>

                {/* ---- About Section (Full Width) ---- */}
                <div className='mt-6'>
                    <label className='block text-sm font-medium text-gray-700 mb-1.5'>About Doctor <span className='text-red-500'>*</span></label>
                    <textarea 
                        onChange={(e) => setAbout(e.target.value)} 
                        value={about} 
                        className={`${inputClass} resize-none`} 
                        placeholder='Write a short bio about the doctor...'
                        rows={4} 
                        required 
                    />
                </div>

                {/* ---- Submit Button ---- */}
                <div className='mt-8 flex justify-end'>
                    <button 
                        type='submit' 
                        className='w-full md:w-auto bg-primary hover:bg-primary/90 text-white px-10 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2'
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        Add Doctor
                    </button>
                </div>

            </form>
        </div>
    )
}

export default AddDoctor