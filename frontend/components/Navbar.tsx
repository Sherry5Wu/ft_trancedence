import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Menu } from './Menu';

export const Navbar = () => {
    return (
        <>
        <Menu aria-label='language options' icon='L'/> {/* ADD ICONS LATER*/}
        <Menu aria-label='accessibility options' icon='A'/> {/* ADD ICONS LATER*/}
        <button aria-label='dark mode' onClick='handleDarkMode'>MOON</button>
        <button aria-label='title' onClick='handleTitleClick'>P | N G - P · N G</button>
        <Menu aria-label='profile menu' icon='P'/> {/* HANDLE USER STATE */}
        </>
    );
};