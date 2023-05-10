import './App.css'
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import React, { lazy, Suspense, useState } from "react";

const Home = lazy(() => import('./components/Home'));
const GameBoard = lazy(() => import('./components/GameBoard'));


const App = () => {
  const[currentEasyScore, setCurrentEasyScore] = useState(0)
  const[currentMediumScore, setCurrentMediumScore] = useState(0)
  const[currentHardScore, setCurrentHardScore] = useState(0)
  

  const RedirectToHome = () => {
    const navigate = useNavigate();
    React.useEffect(() => {
      navigate('/');
    }, [navigate]);
  }

  const getEasyScore = (data) => {
    setCurrentEasyScore(data)
  }

  const getMediumScore = (data) => {
    setCurrentMediumScore(data)
  }

  const getHardScore = (data) => {
    setCurrentHardScore(data)
  }

  

  return (
    <BrowserRouter>
    <Suspense fallback={<div className='loadingScreen'></div>}>
      <Routes>
        <Route path="/" element={<Home currentEasyScore={currentEasyScore} currentMediumScore={currentMediumScore} 
        currentHardScore={currentHardScore}/>} />
        <Route path='/game/:id' element={<GameBoard getEasyScore={getEasyScore} getMediumScore={getMediumScore} 
        getHardScore={getHardScore}/>} />
        <Route path="*" element={<RedirectToHome />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
  );
}

export default App;
