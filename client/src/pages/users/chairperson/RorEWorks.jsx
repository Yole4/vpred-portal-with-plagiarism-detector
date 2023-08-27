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

                {/* Edit Data */}
                <div className="modal fade" id="yole123" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Edit Research</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                            <form action="../../../../res api/users account/users/chairperson/research work/editResearch.php" method="POST" encType="multipart/form-data">
                                <div className="modal-body">
                                    <input type="hidden" id="update_id" name="my_id" />
                                    <input type="hidden" id="document1" />
                                    <input type="hidden" name="college" defaultValue="<?php echo $fetch['college']; ?>" />
                                    <input type="hidden" name="historyRorE" defaultValue="<?php echo $fetch['historyRorE']; ?>" />
                                    <input type="hidden" name="historyCampus" defaultValue="<?php echo $fetch['historyCampus']; ?>" />
                                    <div className="form-group">
                                        <label>Title</label>
                                        <input type="hidden" name="research" id="research1" className="form-control" placeholder="Resesarch Title" required />
                                        <input type="text" className="form-control" id="research2" disabled />
                                    </div>
                                    <div className="form-group">
                                        <label>Document</label>
                                        <input type="file" name="file" className="form-control" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Author/s</label>
                                        <input type="text" id="author1" className="form-control" placeholder="Author" disabled />
                                        <input type="hidden" name="author" id="author2" className="form-control" placeholder="Author" />
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label><br />
                                        <select className="form-control" name="category" id="editselectpsc" onchange="editpsc()">
                                            <option value="Proposed">Proposed</option>
                                            <option value="On-Going">On-Going</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                    <div className="form-group" id="pro" style={{ display: 'visible' }}>
                                        <label>Proposed</label>
                                        <input type="date" name="proposed" id="proposed1" className="form-control" />
                                    </div>
                                    <div className="form-group" id="star" style={{ display: 'none' }}>
                                        <label>Started</label>
                                        <input type="date" name="started" id="started1" className="form-control" />
                                    </div>
                                    <div className="form-group" id="com" style={{ display: 'none' }}>
                                        <label>Completed</label>
                                        <input type="date" name="completed" id="completed1" className="form-control" />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                    <button type="submit" name="add" className="btn btn-primary">Update</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>


                {/* Adding Data */}
                <div className="modal fade" id="addadminprofile" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Add Research</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                            <form action="../../../../res api/users account/users/chairperson/research work/addResearch.php" method="POST" encType="multipart/form-data">
                                <div className="modal-body">
                                    <input type="hidden" name="RorE" defaultValue="<?php echo $fetch['RorE']; ?>" />
                                    <input type="hidden" name="campus" defaultValue="<?php echo $fetch['campus']; ?>" />
                                    <input type="hidden" name="college" defaultValue="<?php echo $fetch['college']; ?>" />
                                    <div className="form-group">
                                        <label>Title</label>
                                        <input type="text" name="research" className="form-control" placeholder="Resesarch Title" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Document</label>
                                        <input type="file" name="file" className="form-control" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Author/s <input type="number" name="countAuthor" defaultValue={0} onchange="numberOfAuthor(this.value)" style={{ borderRadius: 5, width: 40 }} /></label>
                                        <div className="form-group" id="sampleId" />
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label><br />
                                        <select className="form-control" name="category" id="selectpsc" onchange="psc()">
                                            <option value="Proposed">Proposed</option>
                                            <option value="On-Going">On-Going</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                    <div className="form-group" id="proposed" style={{ display: 'visible' }}>
                                        <label>Proposed</label>
                                        <input type="date" name="proposed" className="form-control" />
                                    </div>
                                    <div className="form-group" id="started" style={{ display: 'none' }}>
                                        <label>Started</label>
                                        <input type="date" name="started" className="form-control" />
                                    </div>
                                    <div className="form-group" id="completed" style={{ display: 'none' }}>
                                        <label>Completed</label>
                                        <input type="date" name="completed" className="form-control" />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                    <button type="submit" name="add" className="btn btn-primary">Add</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                {/* End of Adding Data */}


                {/* List Of Research or Extension */}
                <div className="card shadow mb-4" id="data1">
                    <div className="card-header py-3">
                        <h6 className="m-0 font-weight-bold text-primary"><span style={{ fontSize: 20 }}><span id="a1" style={{ display: 'visible', fontSize: 20 }}>Research Works </span><span id="a5" style={{ display: 'none' }}>Approved {/*?php echo " ".$myRorE." "; ?*/} Programs</span><span id="a2" style={{ display: 'none' }}>{/*?php echo $myRorE." "; ?*/} On-Going Papers</span><span id="a3" style={{ display: 'none' }}>{/*?php echo $myRorE." "; ?*/} Completed Papers</span><span id="a4" style={{ display: 'none' }}>Proposed {/*?php echo " ".$myRorE." "; ?*/} Papers</span></span>
                            <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#addadminprofile">
                                Add Data
                            </button>
                        </h6>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    {/* <div class="card-tools"> */}
                                    <div>
                                        <div className="input-group input-group-sm" style={{ width: 330, marginLeft: '-15px' }}>
                                            <select name id="showRorE" style={{ width: 100, borderColor: '#ccc', color: 'rgb(117, 107, 107)' }} onchange="option()">
                                                <option value="all">All</option>
                                                <option value="myProposed">Proposed</option>
                                                <option value="on-going">On-Going</option>
                                                <option value="myCompleted">Completed</option>
                                                <option value="myApproved">Approved Papers</option>
                                            </select>
                                            <input type="text" name="table_search" style={{ marginLeft: 10 }} className="form-control float-right" id="search-input" placeholder="Search From The Table..." />
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
                                                <th className="s" style={{ textAlign: 'center', display: 'visible' }} id="dateProposed">Proposed Date</th>
                                                <th className="s" style={{ textAlign: 'center', display: 'visible' }} id="dateStarted">Started Date</th>
                                                <th className="s" style={{ textAlign: 'center', display: 'visible' }} id="dateCompleted">Completed Date</th>
                                                <th className="s">Added By</th>
                                                <th className="s">Originality</th>
                                                <th className="s">Similarity</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{ display: 'visible' }} id="all">
                                            {/* =================================== ALL RESEARCH DATA ===================================================== */}
                                            {/*?php 
        $RorE = $fetch['RorE'];
        $college = $fetch['college'];
        $campus = $fetch['campus'];
        $mysql = $conn-*/}<tr className="hover">
                                                <td style={{ display: 'none' }}>{/*?php echo $row['id']; ?*/}</td>
                                                <td>
                                                    <form action method="post">
                                                        <a id="dropdownSubMenu1" href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className="nav-link dropdown-toggle" />
                                                        <ul aria-labelledby="dropdownSubMenu1" className="dropdown-menu border-0 shadow">
                                                            {/* Check either document is scan or not */}
                                                            <li><a href="../../../../plagiarism/view document/viewDocument.php?id=<?php echo $row['id']; ?>" className="dropdown-item" onclick="loading()">{/*?php echo $display; ?*/}Scan Document</a></li>
                                                            <li><a href="../../../../plagiarism/create certificate result/createCertificate.php?id=<?php echo $row['id']; ?>" className="dropdown-item" onclick="result()">Download Plagiarism Result</a></li>
                                                            <li><a href="../../../../res api/users account/users/unit head/download/index.php?id=<?php echo $row['id']; ?>" className="dropdown-item">Download</a></li>
                                                            <li>
                                                                <input type="hidden" defaultValue="<?php echo $row['id']; ?>" name="historyId" />
                                                                <input type="submit" className="dropdown-item" defaultValue="History" name="history" />
                                                            </li>
                                                            <li><form action method="post">
                                                                <input type="hidden" name="edit_data" defaultValue />
                                                                <button name="Edit" type="button" className="dropdown-item edit_me">Edit</button>
                                                            </form></li>
                                                            <li><form action="../../../../res api/users account/users/chairperson/research work/deleteResearch.php?delete=<?php echo $row['id']; ?>" method="post">
                                                                <input type="hidden" name="edit_data" defaultValue />
                                                                <button name="Edit" onclick="del()" type="submit" className="dropdown-item">Delete</button>
                                                            </form></li>
                                                        </ul></form>
                                                </td>
                                                <td data-title="Title: ">JRMSU Research Development And Extension Portal With Plagiarism Detector</td>
                                                <td data-title="Authors: ">Shelo Mora Paglinawan</td>
                                                <td data-title="Status: ">Completed</td>
                                                <td data-title="Proposed Date: ">August 5, 1999</td>
                                                <td data-title="Started Date: ">August 5, 1999</td>
                                                <td data-title="Completed Date: ">August 5, 1999</td>
                                                <td data-title="Added By: ">Admin</td>
                                                <td style={{ color: 'blue' }} data-title="Originality: ">50%</td>
                                                <td style={{ color: 'red' }} data-title="Similarity: ">50%</td>
                                                <td className="exist" />
                                            </tr>

                                            {/* <tr><td /><td>No Data Found!</td></tr> */}

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div></div>


            </div>
        </div>
    )
}

export default RorEWorks
