// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { Navbar } from '../components/Navbar';
// import { Footer } from '../components/Footer';

// const App = () => {
//     return (
//         <>
//         <header>
//             <Navbar />
//         </header>
//         <main>
//             <h1 className="h1">P | N G - P · N G</h1>
//         </main>
//         <footer>
//             <Footer />
//         </footer>
//         </>
//     );
// }

// export default App;

// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import HomePage from '../pages/Home';
import SignInPage from '../pages/SignIn';
import SignUpPage from '../pages/SignUp';
import HomeUserPage from '../pages/HomeUser';


const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <header>
          <Navbar />
        </header>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/homeuser" element={<HomeUserPage />} />
          </Routes>
        </main>

        <footer>
          <Footer />
        </footer>
      </div>
    </Router>
  );
};

export default App;
