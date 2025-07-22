import React from 'react';
import ReactDOM from 'react-dom/client';
import { Navbar } from '../components/Navbar';

const App = () => {
    return (
        <>
        <header>
            <Navbar />
        </header>
        <main>
            <h1>P | N G - P · N G</h1>
            <F />
        </main>
        <footer>
            <Footer />
        </footer>
        </>
    );
}

export default App;