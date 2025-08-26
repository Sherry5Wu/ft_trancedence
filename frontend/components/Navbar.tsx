/// <reference types="vite-plugin-svgr/client" />

import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from './Menu';
import { OptionToggle } from './OptionToggle';
import { useUserContext } from '../context/UserContext';
import { useAccessibilityContext } from '../context/AccessibilityContext';
import FrenchIcon from '../assets/noun-france-6661055.svg?react';
import EnglishIcon from '../assets/noun-uk-6661102.svg?react';
import PortugueseIcon from '../assets/noun-brazil-6661040.svg?react';
import LangIcon from '../assets/noun-globe-7929553.svg?react';
import AccessIcon from '../assets/noun-accessibility-4682113.svg?react';
import SunIcon from '../assets/noun-sun-7956354.svg?react';
import MoonIcon from '../assets/noun-moon-5258339.svg?react';
import SettingsIcon from '../assets/noun-setting-2060937.svg?react';
import LogOutIcon from '../assets/noun-log-out-7682766.svg?react';
import { useTranslation } from 'react-i18next';
import SearchIcon from '../assets/noun-search-7526678.svg?react';
import { SearchBar } from '../components/SearchBar';
import { useRequestNewToken, useValidationField } from '../utils/Hooks';
import { isValidUsername } from '../utils/Validation';
import { fetchUsers } from '../utils/Fetch';
import { FetchedUserData } from '../utils/Interfaces';

export const Navbar = () => {  
    const { user, setUser, logOut } = useUserContext();
    const { largeText, setLargeText} = useAccessibilityContext();
    const { t, i18n } = useTranslation();
    const searchField = useValidationField('', isValidUsername, t('common.errors.invalidUsername'));
    const [rivalData, setRivalData] = useState<FetchedUserData[]>([]);
    const navigate = useNavigate();
    const requestNewToken = useRequestNewToken();
    
    // fetch users from search bar
    useEffect(() => {
        const fetchOtherUsers = async () => {
			const token = await requestNewToken();
			if (!user || !token)
				return ;
            const data = await fetchUsers(token);
            setRivalData(data);
            // console.log("DATA FROM SEARCH");
            // console.log(data);
        };
        fetchOtherUsers();
    }, [user])

    // change languages
    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('lang', lang);
    };
    
    //go to title
    const handleTitleClick = () => {
        console.log('Going to title/profile page');
        if (user)
            navigate(`/user/${user?.username}`);
        else
            navigate('/')
    } 

    const handleLogOut = () => {
        logOut();
    }

    const languageMenuItems = [
        {label: 'EN', Icon: <EnglishIcon />, onClick: () => changeLanguage('en')},
        {label: 'FR', Icon: <FrenchIcon />, onClick: () => changeLanguage('fr')},
        {label: 'PT', Icon: <PortugueseIcon />, onClick: () => changeLanguage('pt')},
    ]

    const profileMenuItems = [
        {Icon: <SettingsIcon className='menuIcon'/>, onClick: () => {
            console.log('Go to Settings'), 
            user ? navigate('/settings') : navigate('/signin')}},
        {Icon: <LogOutIcon className='menuIcon'/>, onClick: () => {console.log('Log out'), handleLogOut(), navigate('/signin')}}
    ]

	// console.log('user = ' + user);
	// console.log(user);

    if (!user)
        return (
            <nav className='flex items-center bg-[#FFCC00]'>
                <div className='flex flex-1 justify-start gap-5'>
                    <Menu aria-label='language options' Icon={<LangIcon />} elements={languageMenuItems} className='menuIcon' />
                </div>
                <div className='flex flex-1 justify-center mb-5 translate-x-2.5 translate-y-2.5' >
                    <button aria-label='title' onClick={handleTitleClick} className='title'>P | N G - P · N G</button>
                </div>
                <div className='flex flex-1 justify-end scale-110 mr-7'></div>
            </nav>
    );

    return (
        <nav className='flex items-center bg-[#FFCC00]'>
            <div className='flex flex-1 justify-start gap-5'>
                <Menu aria-label='language options' Icon={<LangIcon />} elements={languageMenuItems} className='menuIcon' />
            </div>
            <div className='flex flex-1 justify-center items-center' >
                <button aria-label='title' onClick={handleTitleClick} className='title'>P | N G - P · N G</button>
            </div>
            <div className='flex flex-1 justify-end items-center mr-2'>
                <div aria-label='rival search bar' className='flex relative z-10 mt-3 justify-start items-center group -translate-x-2'>
                    <SearchIcon className='size-10 translate-x-11 -translate-y-0.5 z-10 transition ease-in-out duration-30
                                        group-focus-within:opacity-50'/>
                    <div className=''>
                        <SearchBar
                        type="username"
                        placeholder="Search for other users"
                        value={searchField.value}
                        options={rivalData}
                        onFilled={searchField.onFilled}
                        onSelect={(selection) => navigate(`/user/${selection}`)}
                        className='h-10 w-55 pl-11 bg-[#FFEE8C] rounded-full mb-3 ring-2 ring-black outline-none transition-all ease-in-out
                                    hover:ring-3 focus:ring-[#4682B4]'
                        />
                    </div>
                </div>
                <Menu aria-label='profile menu' Icon={<img src={user.profilePic} className='profilePicSmall' />} elements={profileMenuItems} className='menuIcon' variant='userMenu'/>
            </div>
        </nav>
    );
};