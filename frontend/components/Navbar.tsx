import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Menu } from './Menu';
import { ReactComponent as LangIcon } from '../assets/noun-globe-1787065.svg';
import { ReactComponent as AccessIcon } from '../assets/noun-accessibility-7572350.svg';
import { ReactComponent as SunIcon } from '../assets/noun-sun-7956354.svg';
import { ReactComponent as MoonIcon } from '..assets/noun-moon-6112326.svg';
import { ReactComponent as ProfileIcon } from '../assets/noun-profile-7808629.svg';
import { ReactComponent as SettingsIcon } from '../assets/noun-setting-2060937.svg';
import { ReactComponent as LogOutIcon } from '../assets/noun-log-out-7682766.svg';

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
    {icon: {SettingsIcon}, onClick: () => console.log('Go to Settings')},
    {icon: {LogOutIcon}, onClick: () => console.log('Log out')} /* ACTUALLY CHANGE THESE LATER */
]

export const Navbar = () => {
    return (
        <>
        <Menu aria-label='language options' icon={LangIcon} elements={languageMenuItems} />
        <Menu aria-label='accessibility options' icon={AccessIcon} elements={accessibilityMenuItems} />
        <button aria-label='dark mode' onClick={handleDarkMode}>{MoonIcon}</button> {/* TOGGLE BETWEEN MOON AND SUN ICONS */}
        <button aria-label='title' onClick={handleTitleClick}>P | N G - P · N G</button>
        <Menu aria-label='profile menu' icon={ProfileIcon} elements={profileMenuItems} /> {/* HANDLE USER STATE */}
        </>
    );
};