import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

function RorEWorks() {

    const navigate = useNavigate();
    const location = useLocation();

    // check if the user is already login or not
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');
    const [userData, setUserData] = useState('');

    useEffect(() => {
        async function fetchProtected() {
            try {
                const response = await axios.get('http://localhost:3001/protected', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 200) {

                    // get the id
                    const userId = response.data.user.id;

                    try {
                        // fetch data
                        await axios.get(`http://localhost:3001/api/getData/${userId}`, {
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
            finally {
                setLoading(false);
            }
        }
        fetchProtected();
    }, []);

    if (loading) {
        <div>Loading...</div>
    }

    useEffect(() => {
        const fetchRorE = userData.RorE;
        document.title = `${fetchRorE} Works`;
    });

    // end of checking data if already login

    return (
        <div>
            <div className="content-wrapper">
                {/* Content Header (Page header) */}
                <section className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                </ol>
                            </div>
                        </div>
                    </div>
                </section>

                {/* List of Author Works */}
                <div className="card shadow mb-4" id="data1">
                    <div className="card-header py-3">
                        <h6 className="m-0 font-weight-bold text-primary"><span style={{ fontSize: 20 }}>My Works</span>
                        </h6>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    {/* <div class="card-tools"> */}
                                    <div>
                                        <div className="input-group input-group-sm" style={{ width: 330, marginLeft: '-15px' }}>
                                            <input type="text" name="table_search" style={{ marginLeft: 10 }} className="form-control float-right" id="search-input" placeholder="Search From The Table" />
                                            <div className="input-group-append">
                                                <button type="submit" className="btn btn-default"><i className="fas fa-search" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <style dangerouslySetInnerHTML={{ __html: "\n                table {\n                  width: 100%;\n                  border-collapse: collapse;\n                  border-spacing: 0;\n                  margin-bottom: 1em;\n                }\n                th{\n                  background-color:lightgreen;\n                }\n                .hover:hover{\n                  background-color:rgb(187, 187, 222);\n                }\n                .exist{\n                  display: none;\n                }\n                th, td {\n                  text-align: left;\n                  padding: 0.5em;\n                  border-bottom: 1px solid #ddd;\n                }\n                tr:nth-child(odd) {\n                  background-color: white;\n                }\n                tr:nth-child(even) {\n                  background-color: #ddd;\n                }\n                @media screen and (max-width: 767px) {\n                  .s{\n                      display: none;\n                  }\n                  .exist{\n                    display:block;\n                    background-color: white;\n                    padding: 20px;\n                  }\n                  th, td {\n                    display: block;\n                    width: 100%;\n                  }\n                  th:before {\n                    content: attr(data-title);\n                    float: left;\n                    font-weight: bold;\n                  }\n                  td:before {\n                    content: attr(data-title) \" \";\n                    float: left;\n                    font-weight: bold;\n            \n                  }\n                }\n              " }} />
                                <div className="card-body table-responsive p-0" style={{ height: 450 }}>
                                    <table id="my-table">
                                        <thead>
                                            <tr>
                                                <th className="s" />
                                                <th className="s">Title</th>
                                                <th className="s">Authors</th>
                                                <th className="s">Status</th>
                                                <th className="s" style={{ textAlign: 'center' }}>Proposed Date</th>
                                                <th className="s" style={{ textAlign: 'center' }}>Started Date</th>
                                                <th className="s" style={{ textAlign: 'center' }}>Completed Date</th>
                                                <th className="s" style={{ textAlign: 'center' }}>Added By</th>
                                                <th className="s">Date Added</th>
                                                <th className="s">Originality</th>
                                                <th className="s">Similarity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/*?php 
              $id_sign = $fetch['id_sign'];
              $college = $fetch['college'];
              $campus = $fetch['campus'];
              $mysql = $conn-*/}<tr>
                                                <td style={{ display: 'none' }}>{/*?php echo $row['id']; ?*/}</td>
                                                <td>
                                                    <form action="#" method="post">
                                                        <a id="dropdownSubMenu1" href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className="nav-link dropdown-toggle" />
                                                        <ul aria-labelledby="dropdownSubMenu1" className="dropdown-menu border-0 shadow">
                                                            <li><a href="#" className="dropdown-item" onclick="result()">Download Plagiarism Result</a></li>
                                                            <li><a href="#" className="dropdown-item">Download Document</a></li>
                                                            <li>
                                                                <input type="hidden" defaultValue="<?php echo $row['id']; ?>" name="historyId" />
                                                                <input type="submit" className="dropdown-item" value="History" name="history" />
                                                            </li>
                                                            <li>
                                                                {/*?php
                          if ($row['publicize'] == "not"){
                            $publicize = "Set Public";
                          }else if ($row['publicize'] == "public"){
                            $publicize = "Retrieve from public";
                          }
                          $_SESSION['public'] = $publicize;
                        ?*/}
                                                                <a href="../../../../res api/users account/users/author/publicize/publicize.php?id=<?php echo $row['id']; ?>" onclick="public()" className="dropdown-item">Set Public</a></li>
                                                        </ul></form>
                                                </td>
                                                <td data-title="Title: ">JRMSU Research Development and Extension Portal With Plagiarism Detector</td>
                                                <td data-title="Authors: ">Shelo Mroa Paglinawan</td>
                                                <td data-title="Status: ">Completed</td>
                                                <td data-title="Proposed Date: ">August 5, 1999</td>
                                                <td data-title="Started Date: ">August 5, 1999</td>
                                                <td data-title="Completed Date: ">August 5, 1999</td>
                                                <td data-title="Added By: ">Admin</td>
                                                <td data-title="Date Added: ">August 5, 1999</td>
                                                <td data-title="Originality: " style={{ color: 'blue' }}>50%</td>
                                                <td data-title="Similarity: " style={{ color: 'red' }}>50%</td>
                                                <td className="exist" />
                                            </tr>

                                            {/* <tr><td /><td>No Data Found!</td></tr> */}

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RorEWorks
