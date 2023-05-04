import './App.css'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import React, { lazy, Suspense, useState  } from "react";

const Home = lazy(() => import('./components/Home'));


function App() {
  return (
    <div className="App">
      <Home />
    </div>
  );
}

export default App;
