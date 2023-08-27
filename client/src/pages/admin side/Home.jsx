import React, { useState, useEffect } from 'react'
import './CSS/SampleHome.css';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import BackEndUrl from '../backend URL/BackEndUrl';

function Home() {

    // get backend URL
    const backendUrl = BackEndUrl();

    const navigate = useNavigate();
    const location = useLocation();

    // check if the user is already login or not
    const token = localStorage.getItem('token');
    const [userData, setUserData] = useState('');

    useEffect(() => {
        async function fetchProtected() {
            try {
                const response = await axios.get(`${backendUrl}/protected`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 200) {

                    // get the id
                    const userId = response.data.user.id;

                    try {
                        // fetch data
                        await axios.get(`${backendUrl}/api/getData/${userId}`,{
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }).then((response) => {
                            if (response.status === 200) {
                                // set data on state
                                setUserData(response.data.results[0]);

                                const check = response.data.results[0].rank;

                                // go to author side
                                if (check === "Author") {
                                    if (location.pathname === "/author-myWorks") {
                                        navigate('/author-myWorks');
                                    }
                                    else if (location.pathname === "/author-public-works") {
                                        navigate('/author-public-works');
                                    }
                                    else {
                                        navigate('/author-homePage');
                                    }
                                }

                                // go to chairperson side
                                else if (check === "Chairperson") {
                                    if (location.pathname === "/chairperson-author-account") {
                                        navigate('/chairperson-author-account');
                                    }
                                    else if (location.pathname === "/chairperson-public-RorE") {
                                        navigate('/chairperson-public-RorE');
                                    }
                                    else if (location.pathname === "/chairperson-RorE-Works") {
                                        navigate('/chairperson-RorE-Works');
                                    }
                                    else {
                                        navigate('/chairperson-homePage');
                                    }
                                }

                                // go to unit head side
                                else if (check === "Unit Head") {
                                    if (location.pathname === "/unitHead-author-account") {
                                        navigate('/unitHead-author-account');
                                    }
                                    else if (location.pathname === "/unitHead-chairperson-account") {
                                        navigate('/unitHead-chairperson-account');
                                    }
                                    else if (location.pathname === "/unitHead-public-RorE") {
                                        navigate('/unitHead-public-RorE');
                                    }
                                    else if (location.pathname === "/unitHead-RorE-Works") {
                                        navigate('/unitHead-RorE-Works');
                                    }
                                    else {
                                        navigate('/unitHead-homePage');
                                    }
                                }

                                // go to admin side
                                else if (check === "Admin") {
                                    if (location.pathname === '/Admin-chairperson') {
                                        navigate('/Admin-chairperson');
                                    }
                                    else if (location.pathname === '/Admin-unit-head') {
                                        navigate('/Admin-unit-head');
                                    }
                                    else if (location.pathname === '/admin-author') {
                                        navigate('/Admin-author');
                                    }
                                    else if (location.pathname === '/Admin-all-RorE') {
                                        navigate('/Admin-all-RorE');
                                    }
                                    else if (location.pathname === '/Admin-public') {
                                        navigate('/Admin-public');
                                    }
                                }

                                // go to login page
                                else {
                                    navigate('/');
                                }

                            }
                        })
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

    useEffect(() => {
        document.title = "Home";
    });

    // end of checking data if already login


    return (
        <div>
            <div>
                {/* Content Wrapper. Contains page content */}
                <div className="content-wrapper background">
                    <div className="contain">
                        <img src="../../CSS/img/jrmsuOffice.jpeg" className='image-responsive' alt />
                        <div className="back1" style={{ position: 'absolute', top: '14%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'yellow', height: 120, filter: 'blur(100px)', width: 600 }} />
                        <div className="back1" style={{ position: 'absolute', top: '14%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'violet', height: 120, filter: 'blur(200px)', width: 600 }} />
                        <div className="phone" style={{ position: 'absolute', top: '14%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'yellow', height: 50, filter: 'blur(100px)', width: 450 }} />
                        <div className="phone" style={{ position: 'absolute', top: '14%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'violet', height: 50, filter: 'blur(200px)', width: 450 }} />
                        <div className="phone" style={{ position: 'absolute', top: '14%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', height: 50, fontFamily: 'Castellar', width: 200, textAlign: 'center' }}><p>Vice President for Research Development and Extension </p></div>
                        <div className="text">Vice President for Research Development and Extension</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home
