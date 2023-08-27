import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';

import Login from './pages/Login';

// Admin Side
import Home from './pages/admin side/Home';
import AdminHeader from './pages/admin side/Header';
import AdminSideBar from './pages/admin side/SideBar';
import AdminPublicRorE from './pages/admin side/PublicResearchOrExtension';
import AdminAuthorAccount from './pages/admin side/AuthorAccount';
import AdminAllRorE from './pages/admin side/AllResearchAndExtension';
import AdminAddUnitHead from './pages/admin side/AddUnitHeadAccount';
import AdminAddChairperson from './pages/admin side/AddAccount';


// unit head side
import UnitHeadHeader from './pages/users/unit head/Header';
import UnitHeadSideBar from './pages/users/unit head/SideBar';
import RorEWorks from './pages/users/unit head/RorEWorks';
import PublicRorE from './pages/users/unit head/PublicRorE';
import ChairpersonAccount from './pages/users/unit head/ChairpersonAccount';
import UnitHeadAuthorAccount from './pages/users/unit head/AuthorAccount';
import UnitHeadHomePage from './pages/users/unit head/HomePage';

// chairperson side
import ChairpersonHeader from './pages/users/chairperson/Header';
import ChairpersonSideBar from './pages/users/chairperson/SideBar';
import ChairpersonHomePage from './pages/users/chairperson/HomePage';
import ChairpersonAuthorAccount from './pages/users/chairperson/AuthorAccount';
import ChairpersonPublicRorE from './pages/users/chairperson/PublicRorE';
import ChairpersonRorEWorks from './pages/users/chairperson/RorEWorks';

// author side
import AuthorHeader from './pages/users/author/Header';
import AuthorSideBar from './pages/users/author/SideBar';
import AuthorMyWorks from './pages/users/author/RorEWorks';
import AuthorPublicWorks from './pages/users/author/PublicWorks';
import AuthorHomePage from './pages/users/author/Home';

function MainContent() {

  const navigate = useNavigate();

  const location = useLocation();
  const isLogin = location.pathname === '/';
  const isAdmin = location.pathname === '/Home' || location.pathname === "/Admin-unit-head" || location.pathname === "/Admin-chairperson" || location.pathname === "/Admin-author" || location.pathname === "/Admin-all-RorE" || location.pathname === "/Admin-public";
  const isAuthor = location.pathname === '/author-homePage' || location.pathname === "/author-public-works" || location.pathname === "/author-myWorks";
  const isChairperson = location.pathname === '/chairperson-homePage' || location.pathname === "/chairperson-author-account" || location.pathname === "/chairperson-public-RorE" || location.pathname === "/chairperson-RorE-works";
  const isUnitHead = location.pathname === '/unitHead-homePage' || location.pathname === '/unitHead-author-account' || location.pathname === '/unitHead-chairperson-account' || location.pathname === '/unitHead-public-RorE' || location.pathname === '/unitHead-RorE-Works';

  const isValidPath = isLogin || isAdmin || isAuthor || isChairperson || isUnitHead;

  return (
    <>
      {!isLogin && (
        <>
          {/* admin side */}
          {isAdmin && (
            <>
              <AdminHeader />
              <AdminSideBar />
            </>
          )}

          {/* chairperson side */}
          {isChairperson && (
            <>
              <ChairpersonHeader />
              <ChairpersonSideBar />
            </>
          )}

          {/* unit head side */}
          {isUnitHead && (
            <>
              <UnitHeadHeader />
              <UnitHeadSideBar />
            </>
          )}

          {/* author side */}
          {isAuthor && (
            <>
              <AuthorHeader />
              <AuthorSideBar />
            </>
          )}
        </>
      )}
      <Routes>
        {/* login page */}
        <Route path='/' element={<Login />} />;

        {/* admin side */}
        <Route path='/Home' element={<Home />} />;
        <Route path='/Admin-chairperson' element={<AdminAddChairperson />} />;
        <Route path='/Admin-unit-head' element={<AdminAddUnitHead />} />;
        <Route path='/Admin-author' element={<AdminAuthorAccount />} />;
        <Route path='/Admin-all-RorE' element={<AdminAllRorE />} />;
        <Route path='/Admin-public' element={<AdminPublicRorE />} />;


        {/* unit head side */}
        <Route path="/unitHead-RorE-Works" element={<RorEWorks />} />
        <Route path="/unitHead-public-RorE" element={<PublicRorE />} />
        <Route path="/unitHead-chairperson-account" element={<ChairpersonAccount />} />
        <Route path="/unitHead-author-account" element={<UnitHeadAuthorAccount />} />
        <Route path="/unitHead-homePage" element={<UnitHeadHomePage />} />

        {/* chairperson side */}
        <Route path="/chairperson-homePage" element={<ChairpersonHomePage />} />
        <Route path="/chairperson-author-account" element={<ChairpersonAuthorAccount />} />
        <Route path="/chairperson-public-RorE" element={<ChairpersonPublicRorE />} />
        <Route path="/chairperson-RorE-Works" element={<ChairpersonRorEWorks />} />

        {/* Author side */}
        <Route path="/author-myWorks" element={<AuthorMyWorks />} />
        <Route path="/author-public-works" element={<AuthorPublicWorks />} />
        <Route path="/author-homePage" element={<AuthorHomePage />} />

        {!isValidPath && <Route path='*' element={<Login />} />}
      </Routes>
    </>
  );
}

function App() {

  return (
    <Router>
      <MainContent />
    </Router>
  );
}

export default App;
