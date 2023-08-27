import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import BackEndUrl from '../backend URL/BackEndUrl';

function AuthorAccount() {

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
                        await axios.get(`${backendUrl}/api/getData/${userId}`, {
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
        }
        fetchProtected();
    }, []);

    useEffect(() => {
        document.title = "Author Account";
    });

    // end of checking data if already login

    // ###############################################################  REQUEST TO GET ALL UNIT HEAD ACCOUNT  ############################################################################################
    const [listAuthor, setListAuthor] = useState([]);
    const [searchList, setSearchList] = useState('');

    useEffect(() => {
        const fetchUHAccount = async () => {
            try {
                const response = await axios.get(`${backendUrl}/fetch/all-author`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.status === 200) {
                    setListAuthor(response.data.results);
                }
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    console.log(error.response.data.message);
                }
                else {
                    console.log("Error: ", error);
                }
            }
        }
        fetchUHAccount();
    }, []);

    // on search on table
    const filteredList = listAuthor.filter(item =>
        item.fullname.toLowerCase().includes(searchList.toLowerCase()) ||
        item.email.toLowerCase().includes(searchList.toLocaleLowerCase()) ||
        item.RorE.toLowerCase().includes(searchList.toLowerCase()) ||
        item.campus.toLowerCase().includes(searchList.toLowerCase())
    );

    // ###############################################################  UPDATE AUTHOR ACCOUNT REQUEST  ############################################################################################
    const [updateRorE, setUpdateRorE] = useState('');
    const [updateCampus, setUpdateCampus] = useState('');
    const [updateCollege, setUpdateCollege] = useState('');
    const [updateFullname, setUpdateFullname] = useState('');
    const [updateEmail, setUpdateEmail] = useState('');

    const [updateId, setUpdateId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // for response display
    const [isUpdateResponse, setIsUpdateResponse] = useState(false);
    const [updateSuccess, setUpdateSucess] = useState(false);
    const [updateResponseMessage, setUpdateResponseMessage] = useState('');

    // current email
    const [currentEmail, setCurrentEmail] = useState('');

    const editBtn = async (item) => {
        setUpdateRorE(item.RorE);
        setUpdateCampus(item.campus);
        setUpdateCollege(item.college);
        setUpdateFullname(item.fullname);
        setUpdateEmail(item.email);
        setUpdateId(item.id);
        setCurrentEmail(item.email);
    }

    const updateAuthor = async (e) => {
        e.preventDefault();

        setIsLoading(true);
        const updateIdString = updateId.toString();
        const updateRorEString = updateRorE.toString();
        const updateCampusString = updateCampus.toString();
        const updateCollegeString = updateCollege.toString();
        const updateFullnameString = updateFullname.toString();
        const updateEmailString = updateEmail.toString();
        const updateCurrentEmailString = currentEmail.toString();

        const updateUHA = { updateIdString, updateRorEString, updateCampusString, updateFullnameString, updateEmailString, updateCurrentEmailString, updateCollegeString };

        try {
            const response = await axios.post(`${backendUrl}/update/author`, updateUHA, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                // success
                setUpdateResponseMessage(response.data.message);
                setIsLoading(false);
                setIsUpdateResponse(true);
                setUpdateSucess(true);
                window.location.reload();

                setTimeout(() => {
                    setIsUpdateResponse(false);
                }, 7000);
            }
        } catch (error) {
            setIsLoading(false);
            if (error.response && error.response.status === 401) {
                setUpdateResponseMessage(error.response.data.message);
                setUpdateSucess(false);
                setIsUpdateResponse(true);

                setTimeout(() => {
                    setIsUpdateResponse(false);
                }, 7000);
            } else {
                console.log("Error: ", error);
            }
        }
    }

    // ###############################################################  DELETE UNIT HEAD ACCOUNT REQUEST  ############################################################################################
    const [deleteId, setDeleteId] = useState('');
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [deleteEmail, setDeleteEmail] = useState('');

    const deleteA = async (item) => {
        setDeleteId(item.id);
        setDeleteEmail(item.email);
        setDeleteVisible(true);
    }
    const btnDelete = async () => {
        setIsLoading(true);

        const deleteIdString = deleteId.toString();
        const deleteEmailString = deleteEmail.toString();

        const requestDeleteId = { deleteIdString, deleteEmailString };

        try {
            const response = await axios.post(`${backendUrl}/delete/author`, requestDeleteId, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                window.location.reload();
                setIsLoading(false);
                setDeleteVisible(false);
            }
        } catch (error) {
            setDeleteVisible(false);
            setIsLoading(false);
            if (error.response && error.response.status === 401) {
                console.log(error.response.data.message);
            } else {
                console.log("Error: ", error);
            }
        }
    }

    const cancelDelete = async () => {
        setDeleteVisible(false);
    }

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
                            <form >
                                <div className="modal-body">

                                    {isUpdateResponse && (
                                        <div style={{ textAlign: 'center', color: updateSuccess ? 'lightblue' : 'white', backgroundColor: updateSuccess ? 'rgb(94, 94, 159)' : 'rgb(219, 164, 164)', padding: '5px', borderRadius: '5px' }}>
                                            <span>{updateResponseMessage}</span>
                                        </div>
                                    )}

                                    {/* Loading screen */}
                                    <div class="modal-pop-up-loading" style={{ display: isLoading ? 'block' : 'none' }}>
                                        <div class="modal-pop-up-loading-spiner"></div>
                                        <p>Loading...</p>
                                    </div>
                                    <div className="form-group">
                                        <label>Select Either Research/Extension</label><br />
                                        <select className="form-control" value={updateRorE} onChange={(e) => setUpdateRorE(e.target.value)}>
                                            <option value="" selected disabled>Select Research/Extension</option>
                                            <option value="Research">Research</option>
                                            <option value="Extension">Extension</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Campus</label><br />
                                        <select className="form-control" value={updateCampus} onChange={(e) => setUpdateCampus(e.target.value)}>
                                            <option value="" selected disabled>Select Campus</option>
                                            <option value="Dapitan">Dapitan</option>
                                            <option value="Dipolog">Dipolog</option>
                                            <option value="Katipunan">Katipunan</option>
                                            <option value="Siocon">Siocon</option>
                                            <option value="Sibuco">Sibuco</option>
                                            <option value="Tampilisan">Tampilisan</option>
                                        </select>
                                    </div>
                                    {/*====================== DAPITAN =======================*/}
                                    <div className="form-group" style={{ display: updateCampus === "Dapitan" ? 'block' : 'none' }}>
                                        <label>College</label><br />
                                        <select className="form-control" value={updateCollege} onChange={(e) => setUpdateCollege(e.target.value)}>
                                            <option value="" selected disabled>Select College</option>
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
                                    {/*====================== DIPOLOG =======================*/}
                                    <div className="form-group" style={{ display: updateCampus === "Dipolog" ? 'block' : 'none' }}>
                                        <label>College</label><br />
                                        <select className="form-control" value={updateCollege} onChange={(e) => setUpdateCollege(e.target.value)}>
                                            <option value="" selected disabled>Select College</option>
                                            <option value="CED">CED</option>
                                            <option value="CAS">CAS</option>
                                            <option value="CIT">CIT</option>
                                            <option value="CBA">CBA</option>
                                            <option value="CCJE">CCJE</option>
                                        </select>
                                    </div>
                                    {/*====================== KATIPUNAN =======================*/}

                                    <div className="form-group" style={{ display: updateCampus === "Katipunan" ? 'block' : 'none' }}>
                                        <label>College</label><br />
                                        <select className="form-control" value={updateCollege} onChange={(e) => setUpdateCollege(e.target.value)}>
                                            <option value="" selected disabled>Select College</option>
                                            <option value="CBM">CBM</option>
                                            <option value="CAF">CAF</option>
                                            <option value="CCJE">CCJE</option>
                                            <option value="CCS">CCS</option>
                                            <option value="CED">CED</option>
                                        </select>
                                    </div>
                                    {/*====================== SIOCON =======================*/}
                                    <div className="form-group" style={{ display: updateCampus === "Siocon" ? 'block' : 'none' }}>
                                        <label>College</label><br />
                                        <select className="form-control" value={updateCollege} onChange={(e) => setUpdateCollege(e.target.value)}>
                                            <option value="" selected disabled>Select College</option>
                                            <option value="CCS">CCS</option>
                                            <option value="CED">CED</option>
                                            <option value="CIT">CIT</option>
                                        </select>
                                    </div>
                                    {/*====================== SIBUCO =======================*/}
                                    <div className="form-group" style={{ display: updateCampus === "Sibuco" ? 'block' : 'none' }}>
                                        <label>College</label><br />
                                        <select className="form-control" value={updateCollege} onChange={(e) => setUpdateCollege(e.target.value)}>
                                            <option value="" selected disabled>Select College</option>
                                            <option value="#">#</option>
                                            <option value="#">#</option>
                                            <option value="#">#</option>
                                        </select>
                                    </div>
                                    {/*====================== TAMPILISAN =======================*/}
                                    <div className="form-group" style={{ display: updateCampus === "Tampilisan" ? 'block' : 'none' }}>
                                        <label>College</label><br />
                                        <select className="form-control" value={updateCollege} onChange={(e) => setUpdateCollege(e.target.value)}>
                                            <option value="" selected disabled>Select College</option>
                                            <option value="CBA">CBA</option>
                                            <option value="CED">CED</option>
                                            <option value="SJCE">SJCE</option>
                                            <option value="SOE">SOE</option>
                                            <option value="CAF">CAF</option>
                                            <option value="CAS">CAS</option>
                                            <option value="CCS">CCS</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input type="text" value={updateFullname} onChange={(e) => setUpdateFullname(e.target.value)} className="form-control" placeholder="Full Name" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="email" value={updateEmail} onChange={(e) => setUpdateEmail(e.target.value)} className="form-control" placeholder="Email" required />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-primary" data-dismiss="modal">Close</button>
                                    <button type="submit" onClick={updateAuthor} className="btn btn-primary">Update</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>


                {/* Author Account */}
                <div className="card shadow mb-4">
                    <div className="card-header py-3">
                        <h6 className="m-0 font-weight-bold text-primary"><span style={{ fontSize: 20 }}>Author Account
                            <div className="form-group" />
                        </span></h6>
                    </div>
                    {/* ============================================================================================================================================= */}
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    {/* <div class="card-tools"> */}
                                    <div>
                                        <div className="input-group input-group-sm" style={{ width: 330, marginLeft: '-15px' }}>
                                            <input type="text" name="table_search" style={{ marginLeft: 10 }} className="form-control float-right" value={searchList} onChange={(e) => setSearchList(e.target.value)} placeholder="Search From Table..." />
                                            <div className="input-group-append">
                                                <button type="submit" className="btn btn-default"><i className="fas fa-search" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <style dangerouslySetInnerHTML={{ __html: "\n                table {\n                  width: 100%;\n                  border-collapse: collapse;\n                  border-spacing: 0;\n                  margin-bottom: 1em;\n                }\n                th{\n                  background-color:lightgreen;\n                }\n                .hover:hover{\n                  background-color:rgb(187, 187, 222);\n                }\n                .exist{\n                  display: none;\n                }\n                th, td {\n                  text-align: left;\n                  padding: 0.5em;\n                  border-bottom: 1px solid #ddd;\n                }\n                tr:nth-child(odd) {\n                  background-color: white;\n                }\n                tr:nth-child(even) {\n                  background-color: #ddd;\n                }\n                @media screen and (max-width: 767px) {\n                  .s{\n                      display: none;\n                  }\n                  .exist{\n                    display:block;\n                    background-color: white;\n                    padding: 20px;\n                  }\n                  th, td {\n                    display: block;\n                    width: 100%;\n                  }\n                  th:before {\n                    content: attr(data-title);\n                    float: left;\n                    font-weight: bold;\n                  }\n                  td:before {\n                    content: attr(data-title) \" \";\n                    float: left;\n                    font-weight: bold;\n            \n                  }\n                }\n              " }} />
                                <div className="card-body table-responsive p-0" style={{ height: 450 }}>
                                    <table id="my-table" style={{ fontSize: 13 }}>
                                        <thead>
                                            <tr>
                                                <th className="s">Full Name</th>
                                                <th className="s">Email</th>
                                                <th className="s">Phone Number</th>
                                                <th className="s">Campus</th>
                                                <th className="s">Extension/Research</th>
                                                <th className="s">College</th>
                                                <th className="s">Added By</th>
                                                <th className="s">Date/Time Added</th>
                                                <th className="s" style={{ textAlign: 'center' }}>Edit</th>
                                                <th className="s">Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{ display: 'visible' }} id="all_id">
                                            {filteredList.map(item => (
                                                <tr key={item.id} className="hover">
                                                    <td data-title="Full Name: ">{item.fullname}</td>
                                                    <td data-title="Email: ">{item.email}</td>
                                                    <td data-title="Phone Number: ">{item.phone_number}</td>
                                                    <td data-title="Campus: ">Dapitan</td>
                                                    <td data-title="Research/Extension: ">{item.RorE}</td>
                                                    <td data-title="College: ">{item.college}</td>
                                                    <td data-title="Added By: ">{item.added_by}</td>
                                                    <td data-title="Date/Time Added: ">{item.date}</td>
                                                    <td>
                                                        <button style={{ backgroundColor: 'green' }} onClick={() => editBtn(item)} type="button" data-toggle="modal" data-target="#yole123" className="btn btn-primary edit_me">
                                                            EDIT <i className="fas fa-edit" />
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button type="submit" onClick={() => deleteA(item)} className="btn btn-danger">DELETE <i className="fa fa-trash" /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* pup-up Delete */}
            <div style={{ position: 'fixed', display: deleteVisible ? 'block' : 'none', backgroundColor: 'white', width: '500px', boxShadow: '0px 0px 10px rgba(0,0,0,0.2)', borderRadius: '8px', padding: '20px', transform: 'translate(-50%, -50%)', top: '50%', left: '50%' }}>
                {/* Loading screen */}
                <div class="modal-pop-up-loading" style={{ display: isLoading ? 'block' : 'none' }}>
                    <div class="modal-pop-up-loading-spiner"></div>
                    <p>Deleting...</p>
                </div>
                <div>
                    <h5>Confirmation</h5>
                </div>
                <hr />
                <div>
                    <p>Are you sure you wan't to delete this data?</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <button className='btn btn-danger' style={{ marginRight: '10px' }} onClick={cancelDelete}>Cancel</button>
                    <button className='btn btn-primary' onClick={btnDelete}>Delete</button>
                </div>
            </div>
        </div>
    )
}

export default AuthorAccount
