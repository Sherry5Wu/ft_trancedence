// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import HomePage from '../pages/Home';
import SignInPage from '../pages/SignIn';
import SignUpPage from '../pages/SignUp';
import HomeUserPage from '../pages/HomeUser';
import Setup2faMainPage from '../pages/Auth/Setup2faMain';
import Setup2faBackupPage from '../pages/Auth/Setup2faBackup';
import Setup2faSuccessPage from '../pages/Auth/Setup2faSuccess';

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <header>
          <Navbar />
        </header>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/homeuser" element={<HomeUserPage />} />
            <Route path="/setup2fa" element={<Setup2faMainPage />} />
            <Route path="/setup2fa-backup" element={<Setup2faBackupPage />} />
            <Route path="/setup2fa-success" element={<Setup2faSuccessPage />} />
          </Routes>
        </main>

        <footer>
          <Footer />
        </footer>
      </div>
    </Router>
  );
};

export default App;