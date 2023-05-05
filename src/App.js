import './App.css'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import React, { lazy, Suspense, useState } from "react";

const Home = lazy(() => import('./components/Home'));
const GameBoard = lazy(() => import('./components/GameBoard'));


const App = () => {

  const RedirectToHome = () => {
    const navigate = useNavigate();
    React.useEffect(() => {
      navigate('/');
    }, [navigate]);
  }
  return (
    <BrowserRouter>
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/game/:id' element={<GameBoard />} />
        <Route path="*" element={<RedirectToHome />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
  );
}

export default App;
