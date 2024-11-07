import React from 'react';
import './dashboard.css'

function UserDashboard(){
  return (
    <div id="wrapper">

    <aside id="sidebar-wrapper">
      
      <ul className="sidebar-nav">
        <li className="active">
          <a href="/"><i className="fa fa-home"></i>Home</a>
        </li>
        <li>
          <a href="/"><i className="fa fa-plug"></i>Plugins</a>
        </li>
        <li>
          <a href="/"><i className="fa fa-user"></i>Users</a>
        </li>
      </ul>
    </aside>
  
    <div id="navbar-wrapper">
      <nav className="navbar navbar-inverse">
        <div className="container-fluid">
          <div className="navbar-header">
            <a href="/" className="navbar-brand" id="sidebar-toggle"><i className="fa fa-bars"></i></a>
          </div>
        </div>
      </nav>
    </div>
  
    <section id="content-wrapper">
        <div className="row">
          <div className="col-lg-12">
            <h2 className="content-title">Test</h2>
            <p>Lorem ipsum...</p>
          </div>
        </div>
    </section>
  
  </div>
  );
}

export default UserDashboard;
