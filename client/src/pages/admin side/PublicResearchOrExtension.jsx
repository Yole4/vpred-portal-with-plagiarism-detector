import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import BackEndUrl from '../backend URL/BackEndUrl';

function PublicResearchOrExtension() {

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
    document.title = "Research & Extension Programs";
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

        {/* DataTales Example */}
        <div className="card shadow mb-4">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary"><span style={{ fontSize: 20 }}>Research &amp; Extension Programs
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
                      <input type="text" name="table_search" style={{ marginLeft: 10 }} className="form-control float-right" id="search-input" placeholder="Search From Table..." />
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
                        <th className="s" />
                        <th className="s">Title</th>
                        <th className="s">Authors</th>
                        <th className="s">Status</th>
                        <th className="s">Research/Extension</th>
                        <th className="s">Campus</th>
                        <th className="s">College</th>
                        <th className="s">Date/Time Added</th>
                      </tr>
                    </thead>
                    <tbody style={{ display: 'visible' }} id="all_id">
                      {/*?php 
              $mysql = $conn-*/}<tr className="hover">
                        <td style={{ display: 'none' }}>{/*?php echo $row['id']; ?*/}</td>
                        <td>
                          <form action method="post">
                            <a id="dropdownSubMenu1" href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className="nav-link dropdown-toggle" />
                            <ul aria-labelledby="dropdownSubMenu1" className="dropdown-menu border-0 shadow">
                              <li><a href="../../../res api/users account/Admin/download/index.php?id=<?php echo $row['id']; ?>" className="dropdown-item">Download</a></li>

                            </ul>
                          </form>
                        </td>
                        <td data-title="Title: ">JRMSU Research Development and Extension Portal With Plagiarism Detector</td>
                        <td data-title="Authors: ">Shelo Mora Paglinawan</td>
                        <td data-title="Status: ">Completed</td>
                        <td data-title="Research/Extension: ">Research</td>
                        <td data-title="Campus: ">Dapitan</td>
                        <td data-title="College: ">CSS</td>
                        <td data-title="Date Added: ">August 5, 1999</td>
                        <td className="exist" />
                      </tr>

                      {/* <tr><td /><td>No Data Found!</td></tr> */}

                      {/* ====================================================================================================== */}
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

export default PublicResearchOrExtension
