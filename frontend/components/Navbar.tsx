{/* <reference types="vite-plugin-svgr/client" /> */}

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Menu } from './Menu';
import LangIcon from '../assets/noun-globe-1787065.svg?react';
import AccessIcon from '../assets/noun-accessibility-7572350.svg?react';
import SunIcon from '../assets/noun-sun-7956354.svg?react';
import MoonIcon from '../assets/noun-moon-6112326.svg?react';
import ProfileIcon from '../assets/noun-profile-7808629.svg?react';
import SettingsIcon from '../assets/noun-setting-2060937.svg?react';
import LogOutIcon from '../assets/noun-log-out-7682766.svg?react';

const handleDarkMode = () => {
    console.log('Toggling dark mode'); /* ACTUALLY CHANGE THESE LATER */
}

const handleTitleClick = () => {
    console.log('Going to title/profile page'); /* ACTUALLY CHANGE THESE LATER */
}

const languageMenuItems = [
    {label: 'EN', onClick: () => console.log('English')},
    {label: 'FR', onClick: () => console.log('French')},
    {label: 'PT', onClick: () => console.log('Portuguese')} /* ACTUALLY CHANGE THESE LATER */
]

const accessibilityMenuItems = [
    {label: 'LARGE TEXT SIZE', onClick: () => console.log('Text size toggle')},
    {label: 'HIGH CONTRAST', onClick: () => console.log('High contrast toggle')} /* ACTUALLY CHANGE THESE LATER */
]

const profileMenuItems = [
    {Icon: SettingsIcon, onClick: () => console.log('Go to Settings')},
    {Icon: LogOutIcon, onClick: () => console.log('Log out')} /* ACTUALLY CHANGE THESE LATER */
]

{/* TOGGLE BETWEEN MOON AND SUN ICONS */}
{/*HANDLE USER STATE */}
export const Navbar = () => {
    return (
        <>
        {/* <img src={LangIcon} /> */}
        {/* <h2>NAVBAR TEST</h2> */}
        {/* <Menu aria-label='language options' Icon={LangIcon} elements={languageMenuItems} /> */}
        <Menu aria-label='accessibility options' Icon={<AccessIcon/>} elements={accessibilityMenuItems} />
        <button aria-label='dark mode' onClick={handleDarkMode}> <MoonIcon className="menuIcon" /> </button>
        <button aria-label='title' onClick={handleTitleClick}>P | N G - P · N G</button>
        {/* <Menu aria-label='profile menu' Icon={ProfileIcon} elements={profileMenuItems} /> */}
        </>
    );
};