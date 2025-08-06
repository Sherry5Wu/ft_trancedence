// src/App.tsx

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import HomePage from '../pages/Home';
import SignInPage from '../pages/SignIn';
import SignUpPage from '../pages/SignUp';
import CompleteProfilePage from '../pages/Registration/CompleteProfile';
import HomeUserPage from '../pages/HomeUser';
import Setup2faMainPage from '../pages/Auth/Setup2faMain';
import Setup2faBackupPage from '../pages/Auth/Setup2faBackup';
import Setup2faSuccessPage from '../pages/Auth/Setup2faSuccess';
import Verify2faPage from '../pages/Auth/Verify2fa';
import ChoosePlayersPage from '../pages/Play/ChoosePlayers';
import LogInPlayerPage from '../pages/Play/LogInPlayer';
import SettingsPage from '../pages/User/UserSettings';
import ChangePasswordPage from '../pages/User/UserChangePassword';
import ChangePINPage from '../pages/User/UserChangePIN';
import TournamentsPage from '../pages/Tournament/TournamentMain';
import NewTournamentPage from '../pages/Tournament/TournamentNew';
import TournamentPlayers from '../pages/Tournament/TournamentConfirm';
import GamePage from '../pages/Game';
import LeaderboardPage from '../pages/Leaderboard';
import RivalsPage from '../pages/Rivals/RivalsMain';


const App = () => {

  // useEffect(() => {
  //   document.documentElement.style.setProperty('--scale-modifier', '1.0');
  // }, [])

  return (
    <div className='bg-[#FFCC00]'>
      <Router>
        <div className="flex flex-col min-h-screen">
          <header className='sticky top-0 z-50'>
            <Navbar />
          </header>
        <main className="flex-grow p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signup/complete-profile" element={<CompleteProfilePage />} />
            <Route path="/homeuser" element={<HomeUserPage />} /> {/* Could we have custom-login-name instead of homeuser? */}
            <Route path="/setup2fa" element={<Setup2faMainPage />} />
            <Route path="/setup2fa-backup" element={<Setup2faBackupPage />} />
            <Route path="/setup2fa-success" element={<Setup2faSuccessPage />} />
            <Route path="/verify2fa" element={<Verify2faPage />} />
            <Route path="/choose-players" element={<ChoosePlayersPage />} />
            <Route path="/login-player" element={<LogInPlayerPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/change-pin" element={<ChangePINPage />} />
            <Route path="/tournaments" element={<TournamentsPage />} />
            <Route path="/tournaments/new" element={<NewTournamentPage />} />
            <Route path="/tournaments/new/players" element={<TournamentPlayers />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/rivals" element={<RivalsPage />} />
          </Routes>
        </main>

          <footer>
            <Footer />
          </footer>
        </div>
      </Router>
    </div>
  );
};

export default App;