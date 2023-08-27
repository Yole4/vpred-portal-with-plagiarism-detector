import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import '../App.css';
import axios from 'axios';
// import { useCookies } from 'react-cookie';
// import { response } from 'express';


function Login() {

    const navigate = useNavigate();

    // check if the user is already login or not
    const [loading, setLoading] = useState(true);
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
                    console.log(response.data.user.rank);

                    const check = response.data.user.rank;

                    if (check === "Author"){
                        navigate('/author-homePage');
                    }
                    else if (check === "Chairperson"){
                        navigate('/chairperson-homePage');
                    }
                    else if (check === "Unit Head"){
                        navigate('/unitHead-homePage');
                    }
                    else if (check === "Admin"){
                        navigate('/Home');
                    }
                    else{
                        navigate('/');
                    }
                    // navigate('/Home');
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

    // end of checking if the user is login or not

    useEffect(() => {
        document.title = "Login page";
    });

    axios.defaults.withCredentials = true;

    const [isLogin, setIsLogin] = useState(true);
    const [isForget, setIsForget] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [visibleResponse, setVisibleResponse] = useState(false);

    const handleLogin = (e) => {
        setIsLogin(true);
        setIsForget(false);
    }
    const handleForget = (e) => {
        setIsLogin(false);
        setIsForget(true);
    }
    const registerForm = (e) => {
        setIsForget(false);
        setIsLogin(false);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { email, password };

        try {
            const response = await axios.post('http://localhost:3001/login', data);
            if (response.status === 200) {
                const token = response.data.token;

                localStorage.setItem('token', token);

                setError('');
                setPassword('');

                setVisibleResponse(true);
                setTimeout(() => {
                    setVisibleResponse(false);
                }, 5000);

                if (response.data.rank === "Admin"){
                    // admin side
                    navigate('/Home');
                }
                else if (response.data.rank === "Author"){
                    // Author side
                    navigate('/Author-homePage')
                }
                else if (response.data.rank === "Chairperson"){
                    // chirperson side
                    navigate('/Chairperson-homePage');
                }
                else if (response.data.rank === "Unit Head"){
                    // unit head side
                    navigate('/UnitHead-homePage');
                }
                // navigate('/Home');
            }

        } catch (error) {
            console.log("Login error: ", error);
            if (error.response && error.response.status === 401) {
                setError(error.response.data.message);
                setSuccess('');

                setVisibleResponse(true);
                setTimeout(() => {
                    setVisibleResponse(false);
                }, 5000);
            }
        }
    }

    // const handleRegister = (e) => {
    //     e.preventDefault();

    //     const givenImage = './given image/given image.png';
    //     const formData = new FormData();
    //     formData.append('image', givenImage);
    //     formData.append('lname', lname);
    //     formData.append('fname', fname);
    //     formData.append('mname', mname);
    //     formData.append('username', username);
    //     formData.append('newPass', newPass);
    //     formData.append('conPass', conPass);

    //     // const data = { lname, fname, mname, username, newPass, conPass };

    //     axios.post('http://localhost:3001/register', formData, {
    //         headers: {
    //             'Content-Type': 'multipart/form-data'
    //         },
    //     })
    //         .then((response) => {
    //             if (response.status === 200) {
    //                 return response.json();
    //             }
    //             else if (response.status === 401) {
    //                 return response.json().then((data) => {
    //                     throw new Error(data.message);
    //                 });
    //                 //   throw new Error(response.status.message); // Email already in use
    //             }
    //             else if (response.status === 402) {
    //                 return response.json().then((data) => {
    //                     throw new Error(data.message);
    //                 });
    //             }
    //             else if (response.status === 403) {
    //                 return response.json.then((data) => {
    //                     throw new Error(data.message);
    //                 });
    //             }
    //         })
    //         .then((data) => {

    //             setError('');
    //             setEmail('');
    //             setPassword('');

    //             setLname('');
    //             setMname('');
    //             setFname('');
    //             setUsername('');
    //             setNewPass('');
    //             setConpass('');

    //             setVisibleResponse(true);
    //             setTimeout(() => {
    //                 setVisibleResponse(false);
    //             }, 5000);

    //             const id = data.id;

    //             navigate(`/Home/${id}`);
    //         })
    //         .catch((error) => {
    //             console.error('Error:', error);
    //             setError(error.message);
    //             setSuccess('');

    //             setVisibleResponse(true);
    //             setTimeout(() => {
    //                 setVisibleResponse(false);
    //             }, 5000);
    //         });
    // }

    return (
        <div className='head-body'>
            <div className="login-box" style={{ width: 450 }}>
                {/* /.login-logo */}
                <div className="card" id="loginPage" style={{ padding: '0px 20px 0px 20px', display: isLogin ? 'block' : 'none' }}>
                    <div className="card-body login-card-body">

                        <div style={{ textAlign: 'center' }}>
                            <img style={{ width: 120, height: 120 }} src="CSS/img/logo.png" alt /></div>
                        <p style={{ textAlign: 'center', fontSize: 20 }}><strong>Vice President of Research Development And Extension</strong></p>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group mb-3">
                                <input type="email" className="form-control" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} id="myEmail" />
                                <div className="input-group-append" >
                                    <div className="input-group-text">
                                        <span className="fas fa-envelope" />
                                    </div>
                                </div>
                            </div>
                            <div className="input-group mb-3">
                                <input type="password" className="form-control" name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} id="idPass" />
                                <div className="input-group-append">
                                    <div className="input-group-text">
                                        <span className="fas fa-eye-slash" style={{ cursor: 'pointer' }} id="eye" />
                                    </div>
                                </div>
                            </div>

                            {/* <p style={{textAlign: 'center', fontSize: '15px', color: 'red'}}></p> */}
                            {/* {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                            {success && <p style={{ color: 'lightblue', textAlign: 'center' }}>{success}</p>} */}

                            {visibleResponse && (
                                <p style={{ textAlign: 'center', color: success ? 'lightblue' : 'white', backgroundColor: success ? 'rgb(94, 94, 159)' : 'rgb(219, 164, 164)', padding: '5px', borderRadius: '5px' }}>
                                    {success || error}
                                </p>
                            )}

                            <div className="row">
                                <div className="col-8">
                                    <div className="icheck-primary">
                                        <input type="checkbox" id="remember" />
                                        <label htmlFor="remember">
                                            Remember Me
                                        </label>
                                    </div>
                                </div>
                            </div>
                            {/* login sign in */}
                            <div>
                                <button type="submit" name="login" className="btn btn-primary btn-block">Login</button>
                            </div>
                        </form>
                        {/* /.social-auth-links */}
                        <p className="mb-1">
                        </p><p style={{ color: 'red', cursor: 'pointer', width: '125px' }} onClick={handleForget}>Forgot Password</p>
                        <p />
                    </div>
                    {/* /.login-card-body */}
                </div>
                {/* ================================================= FORGOT PASSWORD ======================================================= */}
                <div className="card" style={{ display: isForget ? 'block' : 'none' }} id="forgotPage">
                    <div className="card-body login-card-body">
                        <p className="login-box-msg" style={{ fontSize: 20, fontFamily: 'areal' }}>Request email to reset password</p>
                        <form>
                            <div className="input-group mb-3">
                                <input type="email" className="form-control" name="email" placeholder="Enter Your Email" id="inputEmail" required />
                                <div className="input-group-append">
                                    <div className="input-group-text" id="fontStyle">
                                        <span className="fas fa-envelope" />
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-12">
                                    <button type="submit" name="sendRequest" className="btn btn-primary btn-block">Send Request</button>
                                </div>
                                {/* /.col */}
                            </div>
                        </form>
                        <p className="mt-3 mb-1">
                        </p>
                        <p style={{ color: 'red', cursor: 'pointer', width: '60px' }} onClick={handleLogin}>Login</p>
                        <p />
                    </div>
                    {/* /.login-card-body */}
                </div>

            </div>
        </div>
    )
}

export default Login
