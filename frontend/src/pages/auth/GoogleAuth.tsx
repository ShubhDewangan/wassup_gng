import { useGoogleLogin } from '@react-oauth/google'
import { apiFetch } from '../../lib/fetcher'
import { useNavigate } from 'react-router-dom'

const GoogleAuth = () => {
    const navigate = useNavigate()

    const googleAuth = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                await apiFetch('/api/auth/google-auth', {
                    method: 'POST',
                    body: JSON.stringify({ accessToken: tokenResponse.access_token })
                })
                console.log('Logged in successfully with google auth!')
                navigate('/chat')
            } catch (error) {
                console.log('Authentication Error: ',error)
            }
        },
        onError: () => {
            console.log('Authentication Failed!')
        }
    })
  return (
    <div className='h-full w-full'>
      <button onClick={() => googleAuth()}>Continue with google</button>
    </div>
  )
}

export default GoogleAuth
