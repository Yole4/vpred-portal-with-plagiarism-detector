import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BackEndUrl from '../backend URL/BackEndUrl';

function SideBar() {

    // get backend URL
    const backendUrl = BackEndUrl();

    const navigate = useNavigate();

    // get token from the localStorage
    const [userData, setUserData] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        async function fetchProtected() {
            try {
                const response = await axios.get(`${backendUrl}/protected`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    // console.log(response.data.user);
                    const userId = response.data.user.id;

                    try {
                        const response = await axios.get(`${backendUrl}/api/getData/${userId}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        if (response.status === 200) {

                            setUserData(response.data.results[0]);
                        }
                    } catch (error) {
                        console.log("Error: ", error);
                        if (error.response && error.response.status === 401){
                            console.log(error.response.data);
                        }
                    }
                }

            } catch (error) {
                console.log("Error: ", error);
                if (error.response && error.response.status === 401) {
                    console.log(error.response.data);
                    navigate('/');
                }
            }
        }
        fetchProtected();
    }, []);

    return (
        <div>
            <aside className="main-sidebar sidebar-dark-primary elevation-4">
                {/* Brand Logo */}
                <a href="#" onClick={(e) => navigate('/Home')} className="brand-link">
                    <img src="../../CSS/img/logo.png" alt="AdminLTE Logo" className="brand-image img-circle elevation-3" style={{ opacity: '.8' }} />
                    <span className="brand-text font-weight-light">Admin</span>
                </a>
                {/* Sidebar */}
                <div className="sidebar">
                    {/* Sidebar user (optional) */}
                    <div className="user-panel mt-3 pb-3 mb-3 d-flex">
                        <div className="image">
                            <img style={{ width: 34, height: 34 }} src={userData && ( `${backendUrl}/uploads/${userData.image}` )} className="img-profile rounded-circle" />
                        </div>
                        <div className="info">
                            <a href="#" className="d-block" data-toggle="modal" data-target="#profile" style={{ cursor: 'pointer' }}>{userData && (userData.fullname)}</a>
                        </div>
                    </div>
                    {/* Sidebar Menu */}
                    <nav className="mt-2">
                        <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                            {/* =========================================================== SCHEDULE FOR PRESENTATION ======================================================================================== */}
                            {/* <li className="nav-item has-treeview">
                                <a href="#" className="nav-link">
                                    <i className="nav-icon fas fa-copy" />
                                    <p style={{ fontSize: '14.5px' }}>
                                        Schedule For Presentation
                                    </p>
                                </a>
                            </li> */}
                            {/* =========================================================== PUBLICIZE RESEARCH ======================================================================================== */}
                            <li className="nav-item has-treeview">
                                <a href="#" onClick={(e) => navigate('/Admin-public')} className="nav-link">
                                    <i className="nav-icon fas fa-copy" />
                                    <p>
                                        R & E Programs
                                    </p>
                                </a>
                            </li>
                            {/* =========================================================== RESEARCH WORKS ======================================================================================== */}
                            <li className="nav-item has-treeview">
                                <a href="#" onClick={(e) => navigate('/Admin-all-RorE')} className="nav-link">
                                    <i className="nav-icon fas fa-copy" />
                                    <p>
                                        R & E Works
                                    </p>
                                </a>
                            </li>
                            {/* =========================================================== Chairperson AccountS ======================================================================================== */}
                            <li className="nav-item has-treeview">
                                <a href="#" onClick={(e) => navigate('/Admin-unit-head')} className="nav-link">
                                    <i className="nav-icon fas fa-users" />
                                    <p>
                                        Unit Head Account
                                    </p>
                                </a>
                            </li>
                            {/* =========================================================== CHAIRPERSON ACCOUNTS ======================================================================================== */}
                            <li className="nav-item has-treeview">
                                <a href="#" onClick={(e) => navigate('/Admin-chairperson')} className="nav-link">
                                    <i className="nav-icon fas fa-users" />
                                    <p>
                                        Chairperson Accounts
                                    </p>
                                </a>
                            </li>
                            {/* =========================================================== AUTHOR ACCOUNTS ======================================================================================== */}
                            <li className="nav-item has-treeview">
                                <a href="#" onClick={(e) => navigate('/Admin-author')} className="nav-link">
                                    <i className="nav-icon fas fa-users" />
                                    <p>
                                        Author Accounts
                                    </p>
                                </a>
                            </li>
                        </ul></nav>
                    {/* /.sidebar-menu */}
                </div>
            </aside>
        </div>
    )
}

export default SideBar
