/// <reference types="vite-plugin-svgr/client" />

import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from './Menu';
import { OptionToggle } from './OptionToggle';
import { useUserContext } from '../context/UserContext';
import { useDarkModeContext } from '../context/DarkModeContext';
import { useAccessibilityContext } from '../context/AccessibilityContext';
import FrenchIcon from '../assets/noun-france-6661055.svg?react';
import EnglishIcon from '../assets/noun-uk-6661102.svg?react';
import PortugueseIcon from '../assets/noun-brazil-6661040.svg?react';
import FinnishIcon from '../assets/noun-finland-6661074.svg?react';
import LangIcon from '../assets/noun-globe-7929553.svg?react';
import AccessIcon from '../assets/noun-accessibility-4682113.svg?react';
import SunIcon from '../assets/noun-sun-7956354.svg?react';
import MoonIcon from '../assets/noun-moon-5258339.svg?react';
import ProfileIcon from '../assets/noun-profile-7808629.svg?react';
import SettingsIcon from '../assets/noun-setting-2060937.svg?react';
import LogOutIcon from '../assets/noun-log-out-7682766.svg?react';
import { useTranslation } from 'react-i18next';

{/* HANDLE USER AND DARK MODE STATE */}
export const Navbar = () => {
    // const [isOn, setIsOn] = useState(false);
    const { user, setUser } = useUserContext();
    const { darkMode, setDarkMode } = useDarkModeContext();
    const { largeText, setLargeText} = useAccessibilityContext();
    const navigate = useNavigate();
    
    const { t, i18n } = useTranslation();
    const changeLanguage = (lang) => {
      i18n.changeLanguage(lang);
      localStorage.setItem('lang', lang);
    };
     
    const handleTitleClick = () => {
        console.log('Going to title/profile page');
        if (user)
            navigate(`/user/${user?.username}`);
        else
            navigate('/signin')
    } 

    const handleLogOut = () => {
        setUser(null);
    }

    const handleDarkMode = () => {
        setDarkMode(!darkMode);
    }

    const handleTextSize = () => {
        setLargeText(!largeText);
    }

    useEffect(() => {
        const value = largeText ? '1.3' : '1.0';
        console.log('Setting --scale-modifier to:', value);
        document.documentElement.style.setProperty('--scale-modifier', value);
    }), [handleTextSize];


    const languageMenuItems = [
        {label: 'EN', Icon: <EnglishIcon />, onClick: () => changeLanguage('en')},
        {label: 'FR', Icon: <FrenchIcon />, onClick: () => changeLanguage('fr')},
        {label: 'PT', Icon: <PortugueseIcon />, onClick: () => changeLanguage('pt')},
    ]

    const accessibilityMenuItems = [
        {   
            label: 'LARGE TEXT SIZE', 
            Button: () => <OptionToggle isOn={largeText}/>, 
            onClick: () => handleTextSize()
        },
    ]

    const profileMenuItems = [
        {Icon: <SettingsIcon className='menuIcon'/>, onClick: () => {
            console.log('Go to Settings'), 
            user ? navigate('/settings') : navigate('/signin')}},
        {Icon: <LogOutIcon className='menuIcon'/>, onClick: () => {console.log('Log out'), handleLogOut(), navigate('/')}}
    ]

    return (
    <nav className='flex items-center bg-[#FFCC00]'>
        <div className='flex flex-1 justify-start gap-5'>
            <Menu aria-label='language options' Icon={<LangIcon />} elements={languageMenuItems} className='menuIcon' />
            {/* <Menu aria-label='accessibility options' Icon={<AccessIcon />} elements={accessibilityMenuItems} className='menuIcon' /> */}
            {/* <Menu aria-label='dark mode' Icon={darkMode ? <SunIcon className='menuIcon scale-150 pr-3' /> : <MoonIcon className='menuIcon scale-110 pr-5' />} className='menuIcon' onClick={() => handleDarkMode()}/> */}
        </div>
        <div className='flex flex-1 justify-center mb-5' >
            <button aria-label='title' onClick={handleTitleClick} className='title'>P | N G - P · N G</button>
        </div>
        <div className='flex flex-1 justify-end scale-110 mr-7'>
            <Menu aria-label='profile menu' Icon={user ? user.profilePic : <ProfileIcon />} elements={profileMenuItems} className='menuIcon' user={true}/>
        </div>
    </nav>
    );
};