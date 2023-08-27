import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import BackEndUrl from '../backend URL/BackEndUrl';

function AllResearchAndExtension() {

    // get backend URL
    const backendUrl = BackEndUrl();

    const navigate = useNavigate();
    const location = useLocation();

    // check if the user is already login or not
    const token = localStorage.getItem('token');
    const [userData, setUserData] = useState('');

    // display error or success
    const [isResponse, setIsResponse] = useState(false);
    const [success, setSuccess] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // main user ID
    const [mainUserId, setMainUserId] = useState('');
    // convert to string
    const user_id = mainUserId.toString();

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
                                setMainUserId(response.data.results[0].id);
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
        document.title = "Research & Extension Works";
    });

    // end of checking data if already login

    // #########################################################    ADDING DATA REQUEST ##########################################################################################
    const [RorE, setRorE] = useState('');
    const [campus, setCampus] = useState('');
    const [college, setCollege] = useState('');
    const [research, setResearch] = useState('');
    const [file, setFile] = useState('');
    const [status, setStatus] = useState('');
    const [proposed, setProposed] = useState('');
    const [started, setStarted] = useState('');
    const [completed, setCompleted] = useState('');

    // input number of authorsAndEmails
    const [numberInput, setNumberInput] = useState('');
    const [authorsAndEmails, setAuthorsAndEmails] = useState([]);

    const handleNumberInputChange = (event) => {
        const inputValue = event.target.value;
        setNumberInput(inputValue);

        // Clear previous input pairs when the number is changed
        setAuthorsAndEmails([]);
    };

    const handleTextInputChange = (index, inputType, event) => {
        const newInputPairs = [...authorsAndEmails];
        newInputPairs[index] = { ...newInputPairs[index], [inputType]: event.target.value };
        setAuthorsAndEmails(newInputPairs);
    };

    const renderInputPairs = () => {
        const pairs = [];
        for (let i = 0; i < parseInt(numberInput, 10); i++) {
            pairs.push(
                <div key={i} style={{ marginBottom: '20px' }}>
                    <input required
                        className='form-control'
                        type="text"
                        value={authorsAndEmails[i]?.author || ''}
                        placeholder={`${i + 1}. Author Full Name`}
                        onChange={(event) => handleTextInputChange(i, 'author', event)}
                    />
                    <input required
                        className='form-control'
                        type="email"
                        value={authorsAndEmails[i]?.email || ''}
                        placeholder={`${i + 1}. Author Email`}
                        onChange={(event) => handleTextInputChange(i, 'email', event)}
                    />
                </div>
            );
        }
        return pairs;
    };

    // request add API
    const addData = async (e) => {
        e.preventDefault();

        setIsLoading(true);
        try {
            const inputData = authorsAndEmails.filter(pair => pair.author && pair.email);
            if (inputData.length > 0) {
                try {
                    const requestAddData = new FormData();
                    requestAddData.append('RorE', RorE);
                    requestAddData.append('campus', campus);
                    requestAddData.append('college', college);
                    requestAddData.append('research', research);
                    requestAddData.append('file', file);
                    requestAddData.append('status', status);
                    requestAddData.append('proposed', proposed);
                    requestAddData.append('started', started);
                    requestAddData.append('completed', completed);
                    requestAddData.append('user_id', user_id);
                    requestAddData.append('inputData', JSON.stringify(inputData));

                    const response = await axios.post(`${backendUrl}/add-data`, requestAddData, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.status === 200) {
                        setResponseMessage(response.data.message);
                        setIsLoading(false);
                        setIsResponse(true);
                        setSuccess(true);

                        window.location.reload();

                        setTimeout(() => {
                            setIsResponse(false);
                        }, 7000);
                    }

                } catch (error) {
                    setIsLoading(false);
                    if (error.response && error.response.status === 401) {
                        setResponseMessage(error.response.data.message);
                        setIsResponse(true);
                        setSuccess(false);
                        setTimeout(() => {
                            setIsResponse(false);
                        }, 7000);
                    } else {
                        console.log('Error: ', error);
                    }
                }

            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error adding data:', error);
        }
    }

    // ###############################################################  FETCH ALL RESEARCH AND EXTENSION SIDE   ###################################################################################
    const [listOfRorE, setListUnitHead] = useState([]);
    const [searchList, setSearchList] = useState('');

    useEffect(() => {
        const fetchUHAccount = async () => {
            try {
                const response = await axios.get(`${backendUrl}/fetch/all-RorE`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.status === 200) {
                    setListUnitHead(response.data.results);
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
    const filteredList = listOfRorE.filter(item =>
        item.authors.toLowerCase().includes(searchList.toLowerCase()) ||
        item.status.toLowerCase().includes(searchList.toLocaleLowerCase()) ||
        item.RorE.toLowerCase().includes(searchList.toLowerCase()) ||
        item.campus.toLowerCase().includes(searchList.toLowerCase()) ||
        item.research.toLowerCase().includes(searchList.toLowerCase()) ||
        item.added_by.toLowerCase().includes(searchList.toLowerCase())
    );

    // ##################################################################   DOWNLOAD RESEARCH OR EXTENSION DOCUMENT REQUEST API ##############################################################
    // download button
    const downloadDocument = async (item) => {
        // const downloadId = item.id;
        const downloadDocument = item.file_name;
        const requestId = { downloadDocument };

        try {
            const response = await axios.post(`${backendUrl}/download/RorE/document`, requestId, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
            if (response.status === 200) {
                const documentFilename = downloadDocument;
                fetch(`${backendUrl}/documents/${documentFilename}`)
                    .then(response => response.blob())
                    .then(blob => {
                        const url = window.URL.createObjectURL(new Blob([blob]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', documentFilename.split('_').pop());
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                    })
                    .catch(error => {
                        console.error('Error downloading document:', error);
                    });
            }

        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log("testing: ", error.response.data.message);
            } else {
                console.log('Error: ', error);
            }
        }
    }

    // ############################################################ UPDATE RESEARCH OR EXTENSION DATA REQUEST  ##########################################################################
    const [updateRorE, setUpdateRorE] = useState('');
    const [updateCampus, setUpdateCampus] = useState('');
    const [updateCollege, setUpdateCollege] = useState('');
    const [updateResearch, setUpdateResearch] = useState('');
    const [updateFile, setUpdateFile] = useState('');
    const [updateStatus, setUpdateStatus] = useState('');
    const [updateProposed, setUpdateProposed] = useState('');
    const [updateStarted, setUpdateStarted] = useState('');
    const [updateCompleted, setUpdateCompleted] = useState('');
    const [updateId, setUpdateId] = useState('');

    // for response display
    const [isUpdateResponse, setIsUpdateResponse] = useState(false);
    const [updateSuccess, setUpdateSucess] = useState(false);
    const [updateResponseMessage, setUpdateResponseMessage] = useState('');

    // authors
    const [fetchedAuthors, setFetchedAuthors] = useState([]);
    // initialize data if author is empty
    const [isEmpty, setIsEmpty] = useState('');

    // edit button side
    const updateDataBtn = async (item) => {
        // e.preventDefault();

        setUpdateRorE(item.RorE);
        setUpdateCampus(item.campus);
        setUpdateCollege(item.college);
        setUpdateResearch(item.research);
        setUpdateStatus(item.status);
        setUpdateProposed(item.proposed);
        setUpdateStarted(item.started);
        setUpdateCompleted(item.completed);
        setUpdateId(item.id);

        const id = item.id;
        const updateIdString = id.toString();
        try {
            const response = await axios.post(`${backendUrl}/fetch/each-author`, { updateIdString }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                // do something here
                setFetchedAuthors(response.data.results);
                setIsEmpty(false);

            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log(error.response.data.message);
                setIsEmpty(true);
                setFetchedAuthors([]);
            } else {
                console.log('Error: ', error);
            }
        }
    }

    // update data request
    const updateData = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const updateRorEString = updateRorE.toString();
        const updateCampusString = updateCampus.toString();
        const updateCollegeString = updateCollege.toString();
        const updateResearchString = updateResearch.toString();
        const updateStatusString = updateStatus.toString();
        const updateProposedString = updateProposed.toString();
        const updateStartedString = updateStarted.toString();
        const updateCompletedString = updateCompleted.toString();
        const updateIdString = updateId.toString();

        const updateDataRequest = new FormData();
        updateDataRequest.append('file', updateFile);
        updateDataRequest.append('user_id', user_id);
        updateDataRequest.append('completed', updateCompletedString);
        updateDataRequest.append('proposed', updateProposedString);
        updateDataRequest.append('started', updateStartedString);
        updateDataRequest.append('college', updateCollegeString);
        updateDataRequest.append('research', updateResearchString);
        updateDataRequest.append('status', updateStatusString);
        updateDataRequest.append('RorE', updateRorEString);
        updateDataRequest.append('campus', updateCampusString);
        updateDataRequest.append('id', updateIdString);

        try {
            const response = await axios.post(`${backendUrl}/update/data`, updateDataRequest, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 200) {
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

    // ###############################################################  DELETE RESEARCH OR EXTENSION DATA REQUEST  ############################################################################################
    const [deleteId, setDeleteId] = useState('');
    const [deleteVisible, setDeleteVisible] = useState(false);

    const deleteData = async (item) => {
        setDeleteId(item.id);
        setDeleteVisible(true);
    }
    const btnDelete = async () => {
        setIsLoading(true);
        // setDeleteVisible(false);

        const deleteIdString = deleteId.toString();

        const requestDeleteId = { deleteIdString };

        try {
            const response = await axios.post(`${backendUrl}/delete/data`, requestDeleteId, {
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

                {/* Generate Document */}
                <br />
                <div className="container-fluid">
                    {/* Left navbar links */}
                    <ul className="navbar-nav" style={{ marginLeft: '85%', fontSize: 20, marginTop: '-40px' }}>
                        <li className="nav-item dropdown no-arrow">
                            <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <span className="mr-2 d-none d-lg-inline text-gray-600 small">Generate Document</span>
                            </a>
                            {/* Dropdown - User Information */}
                            <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown" style={{ marginLeft: '-300px', width: 300, textAlign: 'center' }}>
                                <form action="../../../res api/users account/Admin/create document/createDocument.php" method="POST">
                                    <div className="form-group" style={{ width: '80%', marginLeft: '10%', marginTop: 20 }}>
                                        <select className="form-control" style={{ textAlign: 'center' }} name="selectOption">
                                            <option value="All">All</option>
                                            <option value="Research">Research</option>
                                            <option value="Extension">Extension</option>
                                        </select>
                                    </div>
                                    <div className="form-group" id="proposed" style={{ width: '80%', marginLeft: '10%' }}>
                                        <span>Start Date: </span><input style={{ marginLeft: 10, width: 150, borderColor: 'lightblue' }} type="date" name="startDate" />
                                    </div>
                                    <div className="form-group" id="proposed" style={{ width: '80%', marginLeft: '10%' }}>
                                        <span>End Date: </span><input style={{ marginLeft: 10, width: 150, borderColor: 'lightblue' }} type="date" name="endDate" />
                                    </div>
                                    <div className="modal-footer">
                                        <button type="submit" style={{ width: '80%', marginRight: '10%' }} name="generate" className="btn btn-primary">Generate</button>
                                    </div>
                                </form>
                            </div>
                        </li>
                    </ul>
                </div>


                {/* Adding Data */}
                <div className="modal fade" id="addadminprofile" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Add Data</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                            <form onSubmit={addData}>
                                <div className="modal-body">

                                    {isResponse && (
                                        <div style={{ textAlign: 'center', color: success ? 'lightblue' : 'white', backgroundColor: success ? 'rgb(94, 94, 159)' : 'rgb(219, 164, 164)', padding: '5px', borderRadius: '5px' }}>
                                            <span>{responseMessage}</span>
                                        </div>
                                    )}

                                    {/* Loading screen */}
                                    <div class="modal-pop-up-loading" style={{ display: isLoading ? 'block' : 'none' }}>
                                        <div class="modal-pop-up-loading-spiner"></div>
                                        <p>Loading...</p>
                                    </div>

                                    <div className="form-group">
                                        <label>Research/Extension</label><br />
                                        <select className="form-control" value={RorE} onChange={(e) => setRorE(e.target.value)} required>
                                            <option value="" selected disabled>Select Research/Extension</option>
                                            <option value="Research">Research</option>
                                            <option value="Extension">Extension</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Campus</label><br />
                                        <select className="form-control" value={campus} onChange={(e) => setCampus(e.target.value)} required>
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
                                    <div className="form-group" style={{ display: campus === "Dapitan" ? 'block' : 'none' }}>
                                        <label>College</label><br />
                                        <select className="form-control" value={college} onChange={(e) => setCollege(e.target.value)}>
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
                                    <div className="form-group" style={{ display: campus === "Dipolog" ? 'block' : 'none' }}>
                                        <label>College</label><br />
                                        <select className="form-control" value={college} onChange={(e) => setCollege(e.target.value)}>
                                            <option value="" selected disabled>Select College</option>
                                            <option value="CED">CED</option>
                                            <option value="CAS">CAS</option>
                                            <option value="CIT">CIT</option>
                                            <option value="CBA">CBA</option>
                                            <option value="CCJE">CCJE</option>
                                        </select>
                                    </div>
                                    {/*====================== KATIPUNAN =======================*/}
                                    <div className="form-group" style={{ display: campus === "Katipunan" ? 'block' : 'none' }}>
                                        <label>College</label><br />
                                        <select className="form-control" value={college} onChange={(e) => setCollege(e.target.value)}>
                                            <option value="" selected disabled>Select College</option>
                                            <option value="CBM">CBM</option>
                                            <option value="CAF">CAF</option>
                                            <option value="CCJE">CCJE</option>
                                            <option value="CCS">CCS</option>
                                            <option value="CED">CED</option>
                                        </select>
                                    </div>
                                    {/*====================== SIOCON =======================*/}
                                    <div className="form-group" style={{ display: campus === "Siocon" ? 'block' : 'none' }}>
                                        <label>College</label><br />
                                        <select className="form-control" value={college} onChange={(e) => setCollege(e.target.value)}>
                                            <option value="" selected disabled>Select College</option>
                                            <option value="CCS">CCS</option>
                                            <option value="CED">CED</option>
                                            <option value="CIT">CIT</option>
                                        </select>
                                    </div>
                                    {/*====================== SIBUCO =======================*/}
                                    <div className="form-group" style={{ display: campus === "Sibuco" ? 'block' : 'none' }}>
                                        <label>College</label><br />
                                        <select className="form-control" value={college} onChange={(e) => setCollege(e.target.value)}>
                                            <option value="" selected disabled>Select College</option>
                                            <option value="#">#</option>
                                            <option value="#">#</option>
                                            <option value="#">#</option>
                                        </select>
                                    </div>
                                    {/*====================== TAMPILISAN =======================*/}
                                    <div className="form-group" style={{ display: campus === "Tampilisan" ? 'block' : 'none' }}>
                                        <label>College</label><br />
                                        <select className="form-control" value={college} onChange={(e) => setCollege(e.target.value)}>
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
                                        <label>Title</label>
                                        <input type="text" value={research} onChange={(e) => setResearch(e.target.value)} className="form-control" placeholder="Resesarch Title" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Document</label>
                                        <input type="file" id='fileInput' onChange={(e) => setFile(e.target.files[0])} className="form-control" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Author <input type="number" value={numberInput} onChange={handleNumberInputChange} style={{ borderRadius: 5, width: '50px' }} required /></label>
                                        <div className='form-group'>
                                            {renderInputPairs()}
                                        </div>
                                    </div>


                                    <div className="form-group" style={{ marginTop: '-20px' }}>
                                        <label>Status</label><br />
                                        <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)} required>
                                            <option value="" selected disabled>Select Status</option>
                                            <option value="Proposed">Proposed</option>
                                            <option value="On-Going">On-Going</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ display: status === "Proposed" || status === "On-Going" || status === "Completed" ? 'block' : 'none' }}>
                                        <label>Proposed</label>
                                        <input type="date" value={proposed} onChange={(e) => setProposed(e.target.value)} className="form-control" />
                                    </div>
                                    <div className="form-group" style={{ display: status === "On-Going" || status === "Completed" ? 'block' : 'none' }}>
                                        <label>Started</label>
                                        <input type="date" value={started} onChange={(e) => setStarted(e.target.value)} className="form-control" />
                                    </div>
                                    <div className="form-group" style={{ display: status === "Completed" ? 'block' : 'none' }}>
                                        <label>Completed</label>
                                        <input type="date" value={completed} onChange={(e) => setCompleted(e.target.value)} className="form-control" />
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

                {/* Edit Data */}
                <div className="modal fade" id="editData" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Edit Data</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                            <form onSubmit={updateData}>
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
                                        <label>Research/Extension</label><br />
                                        <select className="form-control" value={updateRorE} onChange={(e) => setUpdateRorE(e.target.value)} required>
                                            <option value="" selected disabled>Select Research/Extension</option>
                                            <option value="Research">Research</option>
                                            <option value="Extension">Extension</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Campus</label><br />
                                        <select className="form-control" value={updateCampus} onChange={(e) => setUpdateCampus(e.target.value)} required>
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
                                        <label>Document</label>
                                        <input type="file" onChange={(e) => setUpdateFile(e.target.files[0])} className="form-control" />
                                    </div>
                                    <div className="form-group">
                                        <label>Title</label>
                                        <input type="text" value={updateResearch} onChange={(e) => setUpdateResearch(e.target.value)} className="form-control" id="research2" required />
                                    </div>

                                    <div className='form-group'>
                                        <label>Author/s</label>
                                        {isEmpty && (
                                            <div style={{ textAlign: 'center', color: 'red' }}><span>No Author</span></div>
                                        )}
                                        {fetchedAuthors.map(item => (
                                            <div key={item.id}>
                                                <input type="text" value={item.fullname} placeholder='Author' className='form-control' readOnly />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="form-group">
                                        <label>Status</label><br />
                                        <select className="form-control" value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)} required>
                                            <option value="" selected disabled>Select Status</option>
                                            <option value="Proposed" >Proposed</option>
                                            <option value="On-Going">On-Going</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ display: updateStatus === "Proposed" || updateStatus === "On-Going" || updateStatus === "Completed" ? 'block' : 'none' }}>
                                        <label>Proposed</label>
                                        <input type="date" value={updateProposed} onChange={(e) => setUpdateProposed(e.target.value)} className="form-control" />
                                    </div>
                                    <div className="form-group" style={{ display: updateStatus === "On-Going" || updateStatus === "Completed" ? 'block' : 'none' }}>
                                        <label>Started</label>
                                        <input type="date" value={updateStarted} onChange={(e) => setUpdateStarted(e.target.value)} className="form-control" />
                                    </div>
                                    <div className="form-group" style={{ display: updateStatus === "Completed" ? 'block' : 'none' }}>
                                        <label>Completed</label>
                                        <input type="date" value={updateCompleted} onChange={(e) => setUpdateCompleted(e.target.value)} className="form-control" />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                    <button type="submit" className="btn btn-primary">Update</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                {/* End of editing data */}

                {/* DataTales Example */}
                <div className="card shadow mb-4" id="data1">
                    <div className="card-header py-3">
                        <h6 className="m-0 font-weight-bold text-primary"><span style={{ fontSize: 20 }}><span id="a1" style={{ display: 'visible', fontSize: 20 }}>Research &amp; Extension Works </span><span id="a5" style={{ display: 'none' }}>Approved Research &amp; Extension Programs</span><span id="a2" style={{ display: 'none' }}>R &amp; E On-Going Papers</span><span id="a3" style={{ display: 'none' }}>R &amp; E Completed Papers</span><span id="a4" style={{ display: 'none' }}>Proposed R &amp; E Papers</span></span>
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
                                            <select name id="showRorE" style={{ width: 100, borderColor: '#ccc', color: 'rgb(117, 107, 107)' }} onchange="showRorE()">
                                                <option value="all">All</option>
                                                <option value="myProposed">Proposed</option>
                                                <option value="on-going">On-Going</option>
                                                <option value="myCompleted">Completed</option>
                                                <option value="myApproved">Approved Papers</option>
                                            </select>
                                            <input type="text" name="table_search" style={{ marginLeft: 10 }} className="form-control float-right" value={searchList} onChange={(e) => setSearchList(e.target.value)} placeholder="Search From Table..." />
                                            <div className="input-group-append">
                                                <button type="submit" className="btn btn-default"><i className="fas fa-search" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <style dangerouslySetInnerHTML={{ __html: "\n                table {\n                  width: 100%;\n                  border-collapse: collapse;\n                  border-spacing: 0;\n                  margin-bottom: 1em;\n                }\n                th{\n                  background-color:lightgreen;\n                }\n                .hover:hover{\n                  background-color:rgb(187, 187, 222);\n                }\n                .exist{\n                  display: none;\n                }\n                th, td {\n                  text-align: left;\n                  padding: 0.5em;\n                  border-bottom: 1px solid #ddd;\n                }\n                tr:nth-child(odd) {\n                  background-color: white;\n                }\n                tr:nth-child(even) {\n                  background-color: #ddd;\n                }\n                @media screen and (max-width: 767px) {\n                  .s{\n                      display: none;\n                  }\n                  .exist{\n                    display:block;\n                    background-color: white;\n                    padding: 20px;\n                  }\n                  th, td {\n                    display: block;\n                    width: 100%;\n                  }\n                  th:before {\n                    content: attr(data-title);\n                    float: left;\n                    font-weight: bold;\n                  }\n                  td:before {\n                    content: attr(data-title) \" \";\n                    float: left;\n                    font-weight: bold;\n            \n                  }\n                }\n              " }} />
                                <div className="card-body table-responsive p-0" style={{ height: 450 }}>

                                    <table id="my-table" style={{ display: 'visible', fontSize: 13 }}>
                                        <thead>
                                            <tr>
                                                <th className="s"></th>
                                                <th className="s">Title</th>
                                                <th className="s">Authors</th>
                                                <th className="s">Status</th>
                                                <th id="proposedDate" style={{ display: 'visible' }} className="s">Proposed Date</th>
                                                <th className="s" id="startedDate" style={{ display: 'visible' }}>Started Date</th>
                                                <th id="completedDate" className="s" style={{ display: 'visible' }}>Completed Date</th>
                                                <th className="s">Research/Extension</th>
                                                <th className="s">Campus</th>
                                                <th className="s">College</th>
                                                <th className="s">Added By</th>
                                                <th className="s">Originality</th>
                                                <th className="s">Similarity</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{ display: 'visible' }}>
                                            {filteredList.map(item => (
                                                <tr key={item.id} className="hover">
                                                    <td>
                                                        <a id="dropdownSubMenu1" href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className="nav-link dropdown-toggle" />
                                                        <ul aria-labelledby="dropdownSubMenu1" className="dropdown-menu border-0 shadow">
                                                            {/* Check either document is scan or not */}

                                                            <li><a href="#" className="dropdown-item" onclick="loading()">{/*?php echo $display; ?*/} Scan Document</a></li>
                                                            <li><a href="#" className="dropdown-item" onclick="result()">Download Plagiarism Result</a></li>
                                                            <li><a href="#" className="dropdown-item" onClick={() => downloadDocument(item)}>Download Document</a></li>
                                                            <li>
                                                                <button className='dropdown-item'>History</button>
                                                            </li>
                                                            <li>
                                                                <button onClick={() => updateDataBtn(item)} type="button" data-toggle="modal" data-target="#editData" className="dropdown-item edit_me">Edit</button>
                                                            </li>
                                                            <li>
                                                                <button name="Edit" onClick={(e) => deleteData(item)} type="submit" className="dropdown-item">Delete</button>
                                                            </li>
                                                        </ul>
                                                    </td>
                                                    <td data-title="Title: ">{item.research}</td>
                                                    <td data-title="Authors: ">{item.authors}</td>
                                                    <td data-title="Status: ">{item.status}</td>
                                                    <td data-title="Proposed Date: ">{item.proposed}</td>
                                                    <td data-title="Started Date: ">{item.started}</td>
                                                    <td data-title="Completed Date: ">{item.completed}</td>
                                                    <td data-title="Research/Extension: ">{item.RorE}</td>
                                                    <td data-title="Campus: ">{item.campus}</td>
                                                    <td data-title="College: ">{item.college}</td>
                                                    <td data-title="Added By: ">{item.added_by}</td>
                                                    <td style={{ color: 'blue' }} data-title="Originality: ">50%</td>
                                                    <td style={{ color: 'red' }} data-title="Similarity: ">50%</td>
                                                    <td className="exist" />
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div></div>


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

export default AllResearchAndExtension
