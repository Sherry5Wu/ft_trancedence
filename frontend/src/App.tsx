import React from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
    return (
        <>
        <header>
            <Navbar />
            <Title />
        </header>
        <main>
            <Login />
        </main>
        <footer>
            <Footer />
        </footer>
        </>
    );
}

export default App;