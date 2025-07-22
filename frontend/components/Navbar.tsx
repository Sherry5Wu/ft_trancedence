import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Menu } from './Menu';
import LangIcon from '../assets/noun-globe-1787065.svg';
import AccessIcon from '../assets/noun-accessibility-7572350.svg';
import SunIcon from '../assets/noun-sun-7956354.svg';
import MoonIcon from 
import ProfileIcon from '../assets/noun-profile-7808629.svg'

export const Navbar = () => {
    return (
        <>
        <Menu aria-label='language options' icon={LangIcon}
            elements={[{label: 'EN', onClick: () => console.log('English')},
                    {label: 'FR', onClick: () => console.log('French')},
                    {label: 'PT', onClick: () => console.log('Portuguese')},]}/> {/* ACTUALLY CHANGE THESE LATER */}
        <Menu aria-label='accessibility options' icon={AccessIcon}
            elements={[{label: 'LARGE TEXT SIZE', onClick: () => console.log('Text size toggle')},
                        {label: 'HIGH CONTRAST', onClick: () => console.log('High contrast toggle')}]} /> {/* ACTUALLY CHANGE THESE LATER */}
        <button aria-label='dark mode' onClick='handleDarkMode'>MOON</button>
        <button aria-label='title' onClick='handleTitleClick'>P | N G - P · N G</button>
        <Menu aria-label='profile menu' icon={ProfileIcon} /> {/* HANDLE USER STATE */}
        </>
    );
};