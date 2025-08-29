// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import HomePage from '../pages/Home';
import SignInPage from '../pages/SignIn';
import SignUpPage from '../pages/SignUp';
import CompleteProfilePage from '../pages/Registration/CompleteProfile';
import UserPage from '../pages/UserPage';
import Setup2faMainPage from '../pages/Auth/Setup2faMain';
import Setup2faBackupPage from '../pages/Auth/Setup2faBackup';
import Setup2faSuccessPage from '../pages/Auth/Setup2faSuccess';
import Verify2faPage from '../pages/Auth/Verify2fa';
import Verify2faBackupCodePage from '../pages/Auth/Verify2faBackup';
import ChoosePlayersPage from '../pages/Play/ChoosePlayers';
import LogInPlayerPage from '../pages/Play/LogInPlayer';
import SettingsPage from '../pages/User/UserSettings';
import ChangePasswordPage from '../pages/User/UserChangePassword';
import ChangePINPage from '../pages/User/UserChangePIN';
import TournamentsPage from '../pages/Tournament/TournamentMain';
import NewTournamentPage from '../pages/Tournament/TournamentNew';
import TournamentPlayers from '../pages/Tournament/TournamentConfirm';
import LeaderboardPage from '../pages/Leaderboard';
import RivalsPage from '../pages/Rivals/Rivals';
import NotFoundPage from '../pages/NotFoundPage';
import GamePage from '../pages/GamePage/GamePage';
import AboutPage from '../pages/Infos/About';
import ContactPage from '../pages/Infos/Contact';
import PrivacyPage from '../pages/Infos/Privacy';
import ProtectedRoute from '../components/ProtectedRoute';

const App = () => {

	return (
		// <div className='bg-[#FFCC00] scale-[1.0]'>
		<div className="bg-[#FFCC00] min-h-screen w-full mx-auto overflow-x-hidden">
		<Router>
			<div className="flex flex-col min-h-screen">
			<header className='sticky top-0 z-50'>
				<Navbar />
			</header>
			<main className="flex-grow p-4">
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/signin" element={<SignInPage />} />
				<Route path="/verify2fa" element={<Verify2faPage />} />
				<Route path="/verify2fa/recovery" element={<Verify2faBackupCodePage />} />
				<Route path="/signup" element={<SignUpPage />} />
				<Route path="/signup/complete-profile" element={<CompleteProfilePage />} />
				<Route element={<ProtectedRoute />}>
					<Route path='/user/:username' element={<UserPage />} />
					<Route path="/setup2fa" element={<Setup2faMainPage />} />
					<Route path="/setup2fa-backup" element={<Setup2faBackupPage />} />
					<Route path="/setup2fa-success" element={<Setup2faSuccessPage />} />
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
				</Route>
				<Route path="/about" element={<AboutPage />} />
				<Route path="/contact" element={<ContactPage />} />
				<Route path="/privacy" element={<PrivacyPage />} />
				{/* 404 Catch-all route */}
				<Route path="*" element={<NotFoundPage />} />
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