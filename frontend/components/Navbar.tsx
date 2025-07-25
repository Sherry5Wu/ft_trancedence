/// <reference types="vite-plugin-svgr/client" />

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Menu } from './Menu';
import { ToggleButton } from './ToggleButton';
import LangIcon from '../assets/noun-globe-7929553.svg?react';
import AccessIcon from '../assets/noun-accessibility-4682113.svg?react';
import SunIcon from '../assets/noun-sun-7956354.svg?react';
import MoonIcon from '../assets/noun-moon-5258339.svg?react';
import ProfileIcon from '../assets/noun-profile-7808629.svg?react';
import SettingsIcon from '../assets/noun-setting-2060937.svg?react';
import LogOutIcon from '../assets/noun-log-out-7682766.svg?react';

const handleTitleClick = () => {
    console.log('Going to title/profile page'); /* ACTUALLY CHANGE THESE LATER */
}

const languageMenuItems = [
    {label: 'EN', onClick: () => console.log('English')},
    {label: 'FR', onClick: () => console.log('French')},
    {label: 'PT', onClick: () => console.log('Portuguese')} /* ACTUALLY CHANGE THESE LATER */
]

const accessibilityMenuItems = [
    {label: 'LARGE TEXT SIZE', button: <ToggleButton />, onClick: () => console.log('Text size toggle')},
    {label: 'HIGH CONTRAST', button: <ToggleButton />, onClick: () => console.log('High contrast toggle')} /* ACTUALLY CHANGE THESE LATER */
]

const profileMenuItems = [
    {Icon: <SettingsIcon className='menuIcon'/>, onClick: () => console.log('Go to Settings')},
    {Icon: <LogOutIcon className='menuIcon'/>, onClick: () => console.log('Log out')} /* ACTUALLY CHANGE THESE LATER */
]

{/* HANDLE USER AND DARK MODE STATE */}
export const Navbar = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    return (
    <nav className='flex items-center'>
        <div className='flex flex-1 justify-start gap-5'>
            <Menu aria-label='language options' Icon={<LangIcon />} elements={languageMenuItems} className='menuIcon' />
            <Menu aria-label='accessibility options' Icon={<AccessIcon />} elements={accessibilityMenuItems} className='menuIcon' />
            <Menu aria-label='dark mode' Icon={isDarkMode ? <SunIcon className='menuIcon scale-150 pr-3' /> : <MoonIcon className='menuIcon scale-110 pr-5' />} className='menuIcon' onClick={() => setIsDarkMode(!isDarkMode)}/>
        </div>
        <div className='flex flex-1 justify-center -top-3' >
            <button aria-label='title' onClick={handleTitleClick} className='title'>P | N G - P · N G</button>
        </div>
        <div className='flex flex-1 justify-end scale-110 -top-2 mr-7'>
            <Menu aria-label='profile menu' Icon={<ProfileIcon />} elements={profileMenuItems} className='menuIcon'/>
        </div>
    </nav>
    );
};