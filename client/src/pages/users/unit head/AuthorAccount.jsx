import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';

function AuthorAccount() {

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        document.title = "Author Account";
    });

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

    // end of checking user login

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

                {/* Edit Author Account */}
                <div className="modal fade" id="yole123" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Edit Author</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                            <form action="../../../../res api/users account/users/unit head/author/editAuthor.php" method="POST">
                                <div className="modal-body">
                                    <input type="hidden" id="update_id" name="my_id" />
                                    <input type="hidden" id="currentEmail" name="currentEmail" />
                                    <input type="hidden" name="RorE" defaultValue="<?php echo $fetch['RorE']; ?>" />
                                    <input type="hidden" name="campus" defaultValue="<?php echo $fetch['campus']; ?>" />
                                    <input type="hidden" defaultValue="<?php echo $campus; ?>" id="campusId" />
                                    {/*?php
        $campus = $fetch['campus'];
        if ($campus == "Dapitan"){ ?*/}
                                    {/*====================== DAPITAN =======================*/}
                                    <div className="form-group" id="dapitan">
                                        <label>College</label><br />
                                        <select className="form-control" name="college" id="dapitanId">
                                            <option value="CCS">CCS</option>
                                            <option value="CED">CED</option>
                                            <option value="CBA">CBA</option>
                                            <option value="CCJE">CCJE</option>
                                            <option value="CNAHS">CNAHS</option>
                                            <option value="CME">CME</option>
                                            <option value="COE">COE</option>
                                            <option value="CAS">CAS</option>
                                        </select>
                                    </div>
                                    {/*?php }
        
        else if ($campus == "Dipolog"){ ?*/}
                                    {/*====================== DIPOLOG =======================*/}
                                    <div className="form-group" id="dipolog">
                                        <label>College</label><br />
                                        <select className="form-control" name="college" id="dipologId">
                                            <option value="CED">CED</option>
                                            <option value="CAS">CAS</option>
                                            <option value="CIT">CIT</option>
                                            <option value="CBA">CBA</option>
                                            <option value="CCJE">CCJE</option>
                                        </select>
                                    </div>
                                    {/*?php }

        else if ($campus == "Katipunan"){ ?*/}
                                    {/*====================== KATIPUNAN =======================*/}
                                    <div className="form-group" id="katipunan">
                                        <label>College</label><br />
                                        <select className="form-control" name="college" id="katipunanId">
                                            <option value="CBM">CBM</option>
                                            <option value="CAF">CAF</option>
                                            <option value="CCJE">CCJE</option>
                                            <option value="CCS">CCS</option>
                                            <option value="CED">CED</option>
                                        </select>
                                    </div>
                                    {/*?php }

        else if ($campus == "Siocon"){ ?*/}
                                    {/*====================== SIOCON =======================*/}
                                    <div className="form-group" id="siocon">
                                        <label>College</label><br />
                                        <select className="form-control" name="college" id="sioconId">
                                            <option value="CCS">CCS</option>
                                            <option value="CED">CED</option>
                                            <option value="CIT">CIT</option>
                                        </select>
                                    </div>
                                    {/*?php }

        else if ($campus == "Sibuco"){ ?*/}
                                    {/*====================== SIBUCO =======================*/}
                                    <div className="form-group" id="sibuco">
                                        <label>College</label><br />
                                        <select className="form-control" name="college" id="sibucoId">
                                            <option value="#">#</option>
                                            <option value="#">#</option>
                                            <option value="#">#</option>
                                        </select>
                                    </div>
                                    {/*?php }

        else if ($campus == "Tampilisan"){ ?*/}
                                    {/*====================== TAMPILISAN =======================*/}
                                    <div className="form-group" id="tampilisan">
                                        <label>College</label><br />
                                        <select className="form-control" name="college" id="tampilisanId">
                                            <option value="CBA">CBA</option>
                                            <option value="CED">CED</option>
                                            <option value="SJCE">SJCE</option>
                                            <option value="SOE">SOE</option>
                                            <option value="CAF">CAF</option>
                                            <option value="CAS">CAS</option>
                                            <option value="CCS">CCS</option>
                                        </select>
                                    </div>
                                    {/*?php }
      ?*/}
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input type="text" name="fullname" id="name" className="form-control" placeholder="Full Name" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="email" name="email" id="myEmail" className="form-control" placeholder="Email" required />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-primary" data-dismiss="modal">Close</button>
                                    <button type="submit" name="edit_btn" className="btn btn-primary">Update</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>


                {/* List of Author Account */}
                <div className="card shadow mb-4">
                    <div className="card-header py-3">
                        <h6 className="m-0 font-weight-bold text-primary"><span style={{ fontSize: 20 }}>Author Account</span>
                        </h6>
                    </div>
                    {/* ============================================================================================================================================= */}
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    {/* <div class="card-tools"> */}
                                    <div>
                                        <div className="input-group input-group-sm" style={{ width: 330, marginLeft: '-15px' }}>
                                            <input type="text" name="table_search" style={{ marginLeft: 10 }} className="form-control float-right" id="search-input" placeholder="Search From The Table..." />
                                            <div className="input-group-append">
                                                <button type="submit" className="btn btn-default"><i className="fas fa-search" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <style dangerouslySetInnerHTML={{ __html: "\n                table {\n                  width: 100%;\n                  border-collapse: collapse;\n                  border-spacing: 0;\n                  margin-bottom: 1em;\n                }\n                th{\n                  background-color:lightgreen;\n                }\n                .hover:hover{\n                  background-color:rgb(187, 187, 222);\n                }\n                .exist{\n                  display: none;\n                }\n                th, td {\n                  text-align: left;\n                  padding: 0.5em;\n                  border-bottom: 1px solid #ddd;\n                }\n                tr:nth-child(odd) {\n                  background-color: white;\n                }\n                tr:nth-child(even) {\n                  background-color: #ddd;\n                }\n                @media screen and (max-width: 767px) {\n                  .s{\n                      display: none;\n                  }\n                  .exist{\n                    display:block;\n                    background-color: white;\n                    padding: 20px;\n                  }\n                  th, td {\n                    display: block;\n                    width: 100%;\n                  }\n                  th:before {\n                    content: attr(data-title);\n                    float: left;\n                    font-weight: bold;\n                  }\n                  td:before {\n                    content: attr(data-title) \" \";\n                    float: left;\n                    font-weight: bold;\n            \n                  }\n                }\n              " }} />
                                <div className="card-body table-responsive p-0" style={{ height: 500 }}>
                                    <table id="my-table">
                                        <thead>
                                            <tr>
                                                <th className="s">Full Name</th>
                                                <th className="s">Email</th>
                                                <th className="s">Phone Number</th>
                                                <th className="s">College</th>
                                                <th className="s">Added By</th>
                                                <th className="s">Date/Time Added</th>
                                                <th className="s" style={{ textAlign: 'center' }}>Edit</th>
                                                <th className="s">Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/*?php 
              $RorE = $fetch['RorE'];
              $campus = $fetch['campus'];
              // $mysql = $conn-*/}<tr className="hover">
                                                <td style={{ display: 'none' }}>{/*?php echo $row['id']; ?*/}</td>
                                                <td data-title="Full Name: ">Shelo Mora Paglinawan</td>
                                                <td data-title="Email: ">shelomora60@gmail.com</td>
                                                <td data-title="Phone Number: ">09094991331</td>
                                                <td data-title="College: ">CSS</td>
                                                <td data-title="Added By: ">Admin</td>
                                                <td data-title="Date/Time Added: ">August 5, 1999</td>
                                                <td>
                                                    <form action="#" method="post">
                                                        <input type="hidden" name="edit_id" defaultValue />
                                                        <button style={{ backgroundColor: 'green' }} type="button" className="btn btn-primary edit_me">
                                                            EDIT <i className="fas fa-edit" />
                                                        </button>
                                                    </form>
                                                </td>
                                                <td>
                                                    <form action="../../../../res api/users account/users/unit head/author/deleteAuthor.php?delete=<?php echo $row['id']; ?>" method="post">
                                                        <input type="hidden" name="delete_id" defaultValue />
                                                        <button type="submit" name="delete_btn" onclick="del()" className="btn btn-danger">DELETE <i className="fa fa-trash" /></button>
                                                    </form>
                                                </td>
                                            </tr>

                                            {/* <tr><td>No Data Found!</td></tr> */}

                                            {/* ====================================================================================================== */}
                                        </tbody></table>
                                </div>
                            </div></div></div></div>

            </div>
        </div>
    )
}

export default AuthorAccount
