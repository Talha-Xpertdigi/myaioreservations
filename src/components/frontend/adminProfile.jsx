import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'; // Make sure to import axios
import './profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faEdit } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../utiles/apiLink';

function AdminProfile() {
  const { userId } = useParams();
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    company_name: '',
  });
  const [isEditing, setIsEditing] = useState(false); // State to handle editing mode
  const [updatedInfo, setUpdatedInfo] = useState(userInfo); // State for updated information

  useEffect(() => {
    // Load user info from local storage
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const companyName = localStorage.getItem('companyName');

    if (userName && userEmail) {
      setUserInfo({
        name: userName,
        email: userEmail,
        company_name: companyName,
      });
      setUpdatedInfo({
        name: userName,
        email: userEmail,
        company_name: companyName,
      });
    } else {
      console.warn('One or more user info items are missing in localStorage.');
    }
  }, [userId]);

  const copyProfileLink = () => {
    const profileLink = window.location.href;
    navigator.clipboard.writeText(profileLink)
      .then(() => {
        Swal.fire({
          icon: 'success',
          text: 'Profile link copied to clipboard.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      })
      .catch(err => {
        console.error('Failed to copy the profile link: ', err);
      });
  };

  const handleEdit = () => {
    if (isEditing) {
      handleUpdateProfile(); // Call the update function if already in editing mode
    } else {
      setIsEditing(true); // Enable editing mode
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedInfo({
      ...updatedInfo,
      [name]: value,
    });
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await axios.put(`${API_BASE_URL}api/update-profile/${userId}`, updatedInfo);
      if (response.status === 200) {
        localStorage.setItem('userName', updatedInfo.name);
        localStorage.setItem('userEmail', updatedInfo.email);
        localStorage.setItem('companyName', updatedInfo.company_name);

        Swal.fire({
          icon: 'success',
          text: response.data.message,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        setIsEditing(false);
        setUserInfo(updatedInfo); // Update displayed user info
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire({
        icon: 'error',
        text: error.response?.data?.error || 'Failed to update profile.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  return (
    <div className='wrapper'>
      <div className='profileContent'>
        <div className="profileLeft">
          <h2>Profile:</h2>
        </div>
        <div className="profile-info">
          <div className='profileHeader'>
            Personalize Your Profile
            <button className="copyLinkButton" onClick={copyProfileLink}>
              <FontAwesomeIcon icon={faCopy} /> Copy Link
            </button>
          </div>
          <div className="profileMain">
          <div className='profileRight'>
            <ul>
              <li>Name:</li>
              <li>Email:</li>
              <li>Company Name:</li>
            </ul>
            <ul>
              {isEditing ? (
                <>
                  <li>
                    <input
                      type="text"
                      name="name"
                      value={updatedInfo.name}
                      onChange={handleChange}
                    />
                  </li>
                  <li>
                    <input
                      type="email"
                      name="email"
                      value={updatedInfo.email}
                      onChange={handleChange}
                    />
                  </li>
                  <li>
                    <input
                      type="text"
                      name="company_name"
                      value={updatedInfo.company_name}
                      onChange={handleChange}
                    />
                  </li>
                </>
              ) : (
                <>
                  <li>{userInfo.name || 'Not available'}</li>
                  <li>{userInfo.email || 'Not available'}</li>
                  <li>{userInfo.company_name || 'Not available'}</li>
                </>
              )}
            </ul>

          </div>
          <div className="editButton">
          <button onClick={handleEdit} className="editSaveButton">
              <FontAwesomeIcon icon={faEdit} /> {isEditing ? 'Save' : 'Edit'}
            </button>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
