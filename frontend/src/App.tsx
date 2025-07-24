import React from 'react';
import ReactDOM from 'react-dom/client';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const App = () => {
    return (
        <>
        <header>
            <Navbar />
        </header>
        <main>
            <h1 className="h1">P | N G - P · N G</h1>
        </main>
        <footer>
            <Footer />
        </footer>
        </>
    );
}

export default App;