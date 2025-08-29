/// <reference types="vite-plugin-svgr/client" />

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from './Menu';
import { useUserContext } from '../context/UserContext';
import FrenchIcon from '../assets/icons/multi-language/flag-france.svg?react';
import EnglishIcon from '../assets/icons/multi-language/flag-uk.svg?react';
import PortugueseIcon from '../assets/icons/multi-language/flag-brazil.svg?react';
import LangIcon from '../assets/icons/multi-language/globe-icon-v2.svg?react';
import SettingsIcon from '../assets/icons/setting-icon-v2.svg?react';
import LogOutIcon from '../assets/icons/log-out-icon.svg?react';
import SearchIcon from '../assets/icons/search-icon.svg?react';
import { useTranslation } from 'react-i18next';
import { SearchBar } from '../components/SearchBar';
import { useRequestNewToken, useValidationField } from '../utils/Hooks';
import { isValidUsername } from '../utils/Validation';
import { fetchUsers } from '../utils/Fetch';
import { FetchedUserData } from '../utils/Interfaces';
import { usePlayersContext } from '../context/PlayersContext';

export const Navbar = () => {  
    const { user, setUser, logOut } = useUserContext();
    const { t, i18n } = useTranslation();
    const searchField = useValidationField('', isValidUsername, t('common.errors.invalidUsername'));
    const [rivalData, setRivalData] = useState<FetchedUserData[]>([]);
    const navigate = useNavigate();
    const requestNewToken = useRequestNewToken();
    const { setIsTournament, resetPlayers } = usePlayersContext();
	const location = useLocation();
	const isGame = location.pathname.includes('/game');
    
    // fetch users from search bar
    useEffect(() => {
        const fetchOtherUsers = async () => {
			const token = await requestNewToken();
			if (!user || !token)
				return ;
            const data = await fetchUsers(token);
            setRivalData(data);
        };
        fetchOtherUsers();
    }, [user])

    // change languages
    const changeLanguage = (lang: any) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('lang', lang);
    };
    
    //go to title
    const handleTitleClick = () => {
        console.log('Going to title/profile page');
        if (user) {
            setIsTournament(false);
            resetPlayers();
            navigate(`/user/${user?.username}`);
        } else {
            navigate('/')
        }
    } 

    const handleLogOut = () => {
        logOut();
    }

    const languageMenuItems = [
        {label: 'EN', Icon: <EnglishIcon className='scale-90'/>, onClick: () => changeLanguage('en')},
        {label: 'FR', Icon: <FrenchIcon className='scale-90'/>, onClick: () => changeLanguage('fr')},
        {label: 'PT', Icon: <PortugueseIcon className='scale-90'/>, onClick: () => changeLanguage('pt')},
    ]

    const profileMenuItems = [
        {Icon: <SettingsIcon className='menuIcon scale-90'/>, onClick: () => {
            console.log('Go to Settings'), 
            user ? navigate('/settings') : navigate('/signin')}},
        {Icon: <LogOutIcon className='menuIcon scale-85 translate-x-1'/>, onClick: () => {console.log('Log out'), handleLogOut(), navigate('/signin')}}
    ]

    if (!user)
        return (
            <nav className='flex items-center bg-[#FFCC00]'>
                <div className='flex flex-1 justify-start gap-5'>
                    <Menu aria-label='language options' Icon={<LangIcon className='scale-80'/>} elements={languageMenuItems} className='menuIcon' />
                </div>
                <div className='flex flex-1 justify-center mb-5 -translate-x-0.5 translate-y-2.75' >
                    <button aria-label='title' onClick={handleTitleClick} className='title'>P | N G - P · N G</button>
                </div>
                <div className='flex flex-1 justify-end scale-110 mr-7'></div>
            </nav>
    );

    return (
        <nav className='flex items-center bg-[#FFCC00]'>
            <div className='flex flex-1 justify-start gap-5'>
				{isGame ? 
                <Menu aria-label='language options' Icon={<LangIcon className='scale-80'/>} elements={languageMenuItems} className='menuIcon pointer-events-none opacity-50 transition ease-in-out duration-300' />
				:
				<Menu aria-label='language options' Icon={<LangIcon className='scale-80'/>} elements={languageMenuItems} className='menuIcon' />
				}
            </div>
            <div className='flex flex-1 justify-center items-center -translate-x-3' >
                <button aria-label='title' onClick={handleTitleClick} className='title'>P | N G - P · N G</button>
            </div>
            <div className='flex flex-1 justify-end items-center mr-2'>
                <div aria-label='rival search bar' className='flex relative z-10 mt-3 justify-start items-center group -translate-x-2'>
                    <SearchIcon className='size-6 translate-x-9 -translate-y-1 z-10 transition ease-in-out duration-30
                                        group-focus-within:opacity-50'/>
                    <div className=''>
                        <SearchBar
                        type="username"
                        placeholder={t('components.navBar.searchBar')}
                        value={searchField.value}
                        options={rivalData}
                        onFilled={searchField.onFilled}
                        onSelect={(selection) => navigate(`/user/${selection}`)}
                        className='h-10 w-55 pl-11 bg-[#FFEE8C] rounded-full mb-3 ring-2 ring-black outline-none transition-all ease-in-out
                                    hover:ring-3 focus:ring-[#4682B4]'
                        />
                    </div>
                </div>
                <Menu aria-label='profile menu' Icon={<img src={user.profilePic} className='profilePicSmall -translate-x-1' />} elements={profileMenuItems} className='menuIcon' variant='userMenu'/>
            </div>
        </nav>
    );
};