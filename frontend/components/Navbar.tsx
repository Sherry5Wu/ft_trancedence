/// <reference types="vite-plugin-svgr/client" />

import { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, UserMenu } from './Menu';
import { Toggle } from './IndicatorToggle';
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

{/* HANDLE USER AND DARK MODE STATE */}
export const Navbar = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isOn, setIsOn] = useState(false);
    // const userState = useContext(userContext);
    const navigate = useNavigate();

    const handleTitleClick = () => {
        console.log('Going to title/profile page'); /* ACTUALLY CHANGE THESE LATER */
    }

    const languageMenuItems = [
        {label: 'EN', Icon: <EnglishIcon />, onClick: () => console.log('English')},
        {label: 'FR', Icon: <FrenchIcon />, onClick: () => console.log('French')},
        {label: 'PT', Icon: <PortugueseIcon />, onClick: () => console.log('Portuguese')},
        {label: 'FI', Icon: <FinnishIcon />, onClick: () => console.log('Finnish')}
         /* ACTUALLY CHANGE THESE LATER */
    ]

    const accessibilityMenuItems = [
        {label: 'LARGE TEXT SIZE', Button: (isOn: boolean) => <Toggle isOn={isOn} />, onClick: () => {console.log('Text size toggle'); setIsOn(!isOn)}},
        {label: 'HIGH CONTRAST', Button: (isOn: boolean) => <Toggle isOn={isOn} />, onClick: () => {console.log('High contrast toggle'); setIsOn(!isOn)}} /* ACTUALLY CHANGE THESE LATER */
    ]

    const profileMenuItems = [
        {Icon: <SettingsIcon className='menuIcon'/>, onClick: () => {console.log('Go to Settings'), navigate('/settings')}},
        {Icon: <LogOutIcon className='menuIcon'/>, onClick: () => {console.log('Log out'), navigate('/')}} /* REMEMBER TO FLUSH OUT USER*/
    ]

    return (
    <nav className='flex items-center sticky top-0 z-50'>
        <div className='flex flex-1 justify-start gap-5'>
            <Menu aria-label='language options' Icon={<LangIcon />} elements={languageMenuItems} className='menuIcon' />
            <Menu aria-label='accessibility options' Icon={<AccessIcon />} elements={accessibilityMenuItems} className='menuIcon' />
            <Menu aria-label='dark mode' Icon={isDarkMode ? <SunIcon className='menuIcon scale-150 pr-3' /> : <MoonIcon className='menuIcon scale-110 pr-5' />} className='menuIcon' onClick={() => setIsDarkMode(!isDarkMode)}/>
        </div>
        <div className='flex flex-1 justify-center mb-5' >
            <button aria-label='title' onClick={handleTitleClick} className='title'>P | N G - P · N G</button>
            {/* CHANGE THIS TO A LINK LATER */}
        </div>
        <div className='flex flex-1 justify-end scale-110 mr-7'>
            <UserMenu aria-label='profile menu' Icon={<ProfileIcon />} elements={profileMenuItems} className='menuIcon'/>
        </div>
    </nav>
    );
};