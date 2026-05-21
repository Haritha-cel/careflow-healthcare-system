import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { AdminContext } from '../../context/AdminContext'

const AdminLogin = () => {

  const { backendUrl, aToken, setAToken } = useContext(AdminContext)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const { data } = await axios.post(
        backendUrl + '/api/auth/admin/login',
        { email: email.trim(), password }, // ✅ password is NOT trimmed
        { withCredentials: true }           // ✅ tells browser to accept Set-Cookie
      )

      if (data.success) {
        // ✅ Tokens live in HttpOnly cookies now — we never touch them.
        // Server returns a non-sensitive role marker we use only for React state.
        setAToken(data.sessionMarker) // e.g. "ADMIN"
        toast.success("Admin login successful")
        navigate('/admin/dashboard')
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (aToken) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [aToken, navigate])

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 p-4'>
      <div className='w-full max-w-md relative'>

        <button
          onClick={() => navigate('/')}
          className='flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 font-medium transition-colors group'
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <form onSubmit={onSubmitHandler} className='bg-white p-8 rounded-2xl shadow-lg border border-gray-200'>
          <div className='flex flex-col items-center mb-8'>
            <div className='w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4'>
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <h2 className='text-2xl font-bold text-gray-800'>Admin Login</h2>
            <p className='text-sm text-gray-500 mt-1'>Enter your credentials to access the panel</p>
          </div>

          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
            <input
              type="email" autoFocus value={email}
              onChange={(e) => setEmail(e.target.value)} required
              className='w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm'
              placeholder='Enter admin email'
            />
          </div>

          <div className='mb-6'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
            <input
              type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required
              className='w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm'
              placeholder='Enter password'
            />
          </div>

          <button
            type='submit' disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-medium transition-all duration-200 text-sm
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md'}`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

      </div>
    </div>
  )
}

export default AdminLogin