import React, { useEffect, useState } from 'react';
import './profile.css';

function UserProfile() {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');

    console.log('Retrieved Name:', userName);
    console.log('Retrieved Email:', userEmail);

    if (userName && userEmail) {
      setUserInfo({
        name: userName,
        email: userEmail,
      });
    } else {
      console.warn('One or more user info items are missing in localStorage.');
    }
  }, []);

  return (
    <div className='wrapper'>
      <div className='container profileContent'>
        <h2>Profile</h2>
        <div className="profile-info">
          <p><strong>Name:</strong> {userInfo.name || 'Not available'}</p>
          <p><strong>Email:</strong> {userInfo.email || 'Not available'}</p>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
