import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

function Header() {

    const navigate = useNavigate();

    // get token from the localStorage
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const token = localStorage.getItem('token');

    useEffect(() => {
        async function fetchProtected() {
            try {
                const response = await axios.get('http://localhost:3001/protected', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    // console.log(response.data);
                    const userId = response.data.user.id;

                    try {
                        await axios.get(`http://localhost:3001/api/getData/${userId}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }).then((response) => {
                            if (response.status === 200) {
                                setEmail(response.data.results[0].email);
                                setPhoneNumber(response.data.results[0].phone_number);
                                setUserData(response.data.results[0]);

                            }
                        })
                    } catch (error) {
                        console.log("Error: ", error);
                        if (error.response && error.response.status === 401) {
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
            finally {
                setLoading(false);
            }
        }
        fetchProtected();
    }, []);
    if (loading) {
        <div>Loading...</div>
    }

    return (
        <div>
            <nav className="main-header navbar navbar-expand navbar-primary navbar-dark">
                {/* Left navbar links */}
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a className="nav-link" data-widget="pushmenu" href="#" role="button"><i className="fas fa-bars" /></a>
                    </li>
                    <li className="nav-item d-none d-sm-inline-block">
                        <a href="#" onClick={(e) => navigate('/chairperson-homePage')} className="nav-link">Home</a>
                    </li>
                    {/* =============================================================== PUBLICIZE RESEARCH ================================================================================== */}
                    <li className="nav-item d-none d-sm-inline-block">
                        <a href="#" onClick={(e) => navigate('/chairperson-public-RorE')} className="nav-link">Research & Extension Programs</a>
                    </li>
                </ul>
                {/* Right navbar links */}
                <ul className="navbar-nav ml-auto">
                    {/* Messages Dropdown Menu */}
                    <li className="nav-item dropdown">
                        <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                            <a href="#" className="dropdown-item">
                                {/* Message Start */}
                                {/* Message End */}
                            </a>
                            <div className="dropdown-divider" />
                            <a href="#" className="dropdown-item dropdown-footer">See All Messages</a>
                        </div>
                    </li>
                    {/* Notifications Dropdown Menu */}
                    {/* // ================================================================= NOTIFICATION =============================================================================== */}
                    <li className="nav-item dropdown">
                        <a className="nav-link" data-toggle="dropdown" href="#">
                            <i className="far fa-bell" />
                            <span className="badge badge-warning navbar-badge">3</span>
                        </a>
                        <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right" style={{ backgroundColor: 'rgb(214, 192, 192)' }}>
                            <span className="dropdown-item dropdown-header">3 Notification</span>

                            <a href="#" className="dropdown-item" style={{ fontSize: 12, backgroundColor: 'lightblue' }}>
                                <i className="fas fa-bell mr-2" /> First Sentence <p />
                                <p style={{ marginLeft: 22, fontSize: 10, color: 'rgb(105, 96, 96)' }}>date</p>
                            </a><div style={{ margin: 2 }} />

                            <div className="dropdown-divider" />
                            <a data-toggle="modal" data-target="#allNotification" style={{ cursor: 'pointer' }} className="dropdown-item dropdown-footer">See All Notifications</a>
                        </div>
                    </li>
                    {/* // ================================================================= END OF NOTIFICATION =============================================================================== */}
                    {/* Admin Profile */}
                    <li className="nav-item dropdown no-arrow">
                        <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <span className="mr-2 d-none d-lg-inline text-gray-600 small">{userData && (userData.fullname)}</span>
                            <img style={{ width: 25, height: 25 }} className="img-profile rounded-circle" src={userData && (`http://localhost:3001/uploads/${userData.image}`)} />
                        </a>
                        {/* Dropdown - User Information */}
                        <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
                            <a className="dropdown-item" data-toggle="modal" data-target="#profile" style={{ cursor: 'pointer' }}><i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400" />
                                Profile
                            </a>
                            <a className="dropdown-item" data-toggle="modal" data-target="#change_password" style={{ cursor: 'pointer' }}><i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400" />
                                Change Password
                            </a>
                            <a className="dropdown-item" data-toggle="modal" data-target="#logout" style={{ cursor: 'pointer' }}>
                                <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400" />
                                Logout
                            </a>
                        </div>
                    </li>
                    {/* End of Profile */}
                </ul>
            </nav>

            {/* Profile */}
            <div className="modal fade" id="profile" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document" style={{ width: 400 }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Profile</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        {/* Profile Image */}
                        <div className="card card-primary card-outline">
                            <div className="card-body box-profile">
                                <div className="text-center">
                                    <img style={{ width: 100, height: 100 }} className="profile-user-img img-fluid img-circle" src={userData && (`http://localhost:3001/uploads/${userData.image}`)} alt="User profile picture" />
                                </div>
                                <h3 className="profile-username text-center">{userData && (userData.fullname)}</h3>
                                <p className="text-muted text-center">Chairperson</p>
                                <hr />
                                <div className="form-group">
                                    <label htmlFor>Email</label>
                                    <input type="email" className="form-control" id="yourEmail" readOnly value={email} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor>Phone Number</label>
                                    <input type="text" className="form-control" id="cellphoneNumber" readOnly value={phoneNumber} />
                                </div>
                                <div className="form-group" style={{ textAlign: 'center' }}>
                                    <button id="savebutton" className="btn btn-primary" style={{ width: '100%' }} data-toggle="modal" data-target="#editProfile">Edit Profile</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Edit Profile */}
            <div className="modal fade" id="editProfile" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document" style={{ width: 400 }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Edit Profile</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        {/* Profile Image */}
                        <div className="card card-primary card-outline">
                            <div className="card-body box-profile">
                                <form>
                                    <input type="hidden" />
                                    <div className="form-group">
                                        <label htmlFor>Profile Picture</label>
                                        <input type="file" name="file" className="form-control" id="yourEmail" value="" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor>Full Name</label>
                                        <input type="text" className="form-control" name="fullname" id="yourEmail" value="My Name" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor>Email</label>
                                        <input type="email" className="form-control" name="email" id="yourEmail" value="My Email" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor>Phone Number</label>
                                        <input type="text" className="form-control" name="phone_number" id="cellphoneNumber" value="My number" required />
                                    </div>
                                    <div className="form-group" style={{ textAlign: 'center' }}>
                                        <button id="savebutton" name="save" className="btn btn-primary" style={{ width: '100%' }}>Save Profile</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password */}
            <div className="modal fade" id="change_password" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Change Password</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true"></span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form action="../../../res api/users account/Admin/change/change.pass.php?id=unit head" method="post" onsubmit="loading()">
                                {/* <input type="hidden" name="id" defaultValue="<?php echo $admin_id; ?>" /> */}
                                <div className="form-group">
                                    <span>Current Password</span>
                                    <input className="form-control" type="password" name="curPass" placeholder="Current Password" id="curPass" required />
                                    <i className="fa fa-eye-slash" style={{ fontSize: 20, cursor: 'pointer', position: 'absolute', marginTop: '-29px', marginLeft: 'calc(100% - 75px)' }} onclick="curChange()" id="curEye" />
                                </div>
                                <div className="form-group">
                                    <span>New Password</span>
                                    <input className="form-control" type="password" name="newPass" placeholder="New Password" id="newPass" required />
                                    <i className="fa fa-eye-slash" style={{ fontSize: 20, cursor: 'pointer', position: 'absolute', marginTop: '-29px', marginLeft: 'calc(100% - 75px)' }} onclick="newChange()" id="newEye" />
                                </div>
                                <div className="form-group">
                                    <span>Confirm Password</span>
                                    <input className="form-control" type="password" name="conPass" placeholder="Confirm Password" id="conPass" required />
                                    <i className="fa fa-eye-slash" style={{ fontSize: 20, cursor: 'pointer', position: 'absolute', marginTop: '-29px', marginLeft: 'calc(100% - 75px)' }} onclick="conChange()" id="conEye" />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal" name="cancel">Cancel</button>
                                    <button type="submit" name="save" className="btn btn-primary">Save</button>
                                </div>
                            </form></div>
                    </div>
                </div>
            </div>

            {/* Logout */}
            <div className="modal fade" id="logout" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document" style={{ top: '30%' }}>
                    <div className="modal-content">
                        <div className="modal-body">
                            <div>
                                <h5>Confirmation</h5>
                            </div>
                            <hr />
                            <div>
                                <p>Are you sure you wan't to logout?</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-danger' style={{ marginRight: '10px' }} data-dismiss="modal" name="cancel">Cancel</button>
                                <button className='btn btn-primary' onClick={(e) => { localStorage.removeItem('token'); navigate('/'); window.location.reload(); }} >Logout</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===============================================  ALL NOTIFICATION  ========================================================================================== */}
            <div className="modal fade" id="allNotification" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header" style={{ backgroundColor: 'rgb(214, 192, 192)' }}>
                            <h5 className="modal-title" id="exampleModalLabel"> Notifications</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        <div className="modal-body" style={{ backgroundColor: 'rgb(214, 192, 192)' }}>3 Notification
                            <a href="#" className="dropdown-item" style={{ fontSize: 12, backgroundColor: 'lightblue' }}>
                                <i className="fas fa-bell mr-2" /> {/*?php echo $arr[$k]. "...."; ?*/}<p />
                                <p style={{ marginLeft: 22, fontSize: 10, color: 'rgb(105, 96, 96)' }}>Date</p>
                            </a><div style={{ margin: 2 }} />
                            {/*?php }
        }
      ?*/}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header
