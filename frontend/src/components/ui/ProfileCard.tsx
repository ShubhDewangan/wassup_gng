
import React from 'react'
import { useUserData } from '../../hooks/useUserData'

const ProfileCard = () => {
    const { data: user, isLoading } = useUserData()
    if (isLoading) return <p>loading profile...</p>
    if (!user) return <p>Cannot find your profile!</p>
  return (
    <div>
        <h1>Your Profile</h1>
      <img src={user.avatar} alt="your profile pic" />
      <span>{user.name}</span>
      <span>{user.email}</span>
    </div>
  )
}

export default ProfileCard
