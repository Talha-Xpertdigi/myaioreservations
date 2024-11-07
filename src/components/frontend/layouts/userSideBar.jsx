import React from 'react';
import Image from '../../../assets/col_img.jpg'
import './userSideBar.css'

function UserSideBar() {


  return (
    <div className='userSideBar'>
        <img src={Image} alt="" />
    </div>
  );
}

export default UserSideBar;
