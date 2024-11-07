import React from 'react';
import Profile from '../components/frontend/profile.jsx';

function UserProfile({ user }) {
  return(
    <div>
        <Profile user={user} />
    </div>
  );
}

export default UserProfile;
