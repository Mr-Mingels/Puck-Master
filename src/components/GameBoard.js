import React, { useState, useEffect, useRef } from "react";
import '../styles/GameBoard.css'

const GameBoard = () => {
    const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
    const [puckPosition, setPuckPosition] = useState({ x: 0, y: 0 });
    const [puckVelocity, setPuckVelocity] = useState({ x: 0, y: 0 });
    const [keysPressed, setKeysPressed] = useState({});
    const playerFigureRef = useRef(null);
    const playerBoardSideRef = useRef(null);
    const movementIntervalRef = useRef(null);
    const step = 10;
    const friction = 0.98; // Adjust this value to change the slowing down effect
    const impactMultiplier = 1;

    const checkCollision = (rect1, rect2) => {
        return (
          rect1.x < rect2.x + rect2.width &&
          rect1.x + rect1.width > rect2.x &&
          rect1.y < rect2.y + rect2.height &&
          rect1.y + rect1.height > rect2.y
        );
      };
  
    useEffect(() => {
        const updatePlayerPosition = () => {
            if (!playerBoardSideRef.current || !playerFigureRef.current) return;
          
            const boardRect = playerBoardSideRef.current.getBoundingClientRect();
            const figureRect = playerFigureRef.current.getBoundingClientRect();
            const puckRect = document.querySelector('.puck').getBoundingClientRect();
          
            const figureInitialLeft = parseFloat(getComputedStyle(playerFigureRef.current).left);
            const figureInitialTop = parseFloat(getComputedStyle(playerFigureRef.current).top);
          
            setPlayerPosition((prevPosition) => {
              const newPosition = { ...prevPosition };
          
              if (keysPressed["w"] || keysPressed["W"]) {
                newPosition.y -= step;
              }
              if (keysPressed["a"] || keysPressed["A"]) {
                newPosition.x -= step;
              }
              if (keysPressed["s"] || keysPressed["S"]) {
                newPosition.y += step;
              }
              if (keysPressed["d"] || keysPressed["D"]) {
                newPosition.x += step;
              }
          
         /*     // Check boundaries for X-axis
              if (newPosition.x < -figureInitialLeft) {
                newPosition.x = -figureInitialLeft;
              } else if (newPosition.x + figureRect.width > boardRect.width - figureInitialLeft) {
                newPosition.x = boardRect.width - figureRect.width - figureInitialLeft;
              }
          
              // Check boundaries for Y-axis
              if (newPosition.y < -figureInitialTop) {
                newPosition.y = -figureInitialTop;
              } else if (newPosition.y + figureRect.height > boardRect.height - figureInitialTop) {
                newPosition.y = boardRect.height - figureRect.height - figureInitialTop;
              } */
          
              return newPosition;
            });
          };
          const updatePuckPosition = () => {
            if (!playerBoardSideRef.current || !playerFigureRef.current) return;
      
            const boardRect = playerBoardSideRef.current.getBoundingClientRect();
            const figureRect = playerFigureRef.current.getBoundingClientRect();
            const puckRect = document.querySelector(".puck").getBoundingClientRect();
      
            // Check if playerFigure hits the puck
            if (checkCollision(figureRect, puckRect)) {
                const deltaX = (puckRect.x + puckRect.width / 2) - (figureRect.x + figureRect.width / 2);
                const deltaY = (puckRect.y + puckRect.height / 2) - (figureRect.y + figureRect.height / 2);
                const angle = Math.atan2(deltaY, deltaX);

      
                setPuckVelocity((prevVelocity) => ({
                    x: prevVelocity.x + Math.cos(angle) * impactMultiplier,
                    y: prevVelocity.y + Math.sin(angle) * impactMultiplier,
                }));
            }
      
            setPuckPosition((prevPuckPosition) => {
              const newPosition = {
                x: prevPuckPosition.x + puckVelocity.x,
                y: prevPuckPosition.y + puckVelocity.y,
              };
      
              // Check boundaries for X-axis
              if (newPosition.x < 0) {
                newPosition.x = 0;
                setPuckVelocity((prevVelocity) => ({ ...prevVelocity, x: -prevVelocity.x }));
              } else if (newPosition.x + puckRect.width > boardRect.width) {
                newPosition.x = boardRect.width - puckRect.width;
                setPuckVelocity((prevVelocity) => ({ ...prevVelocity, x: -prevVelocity.x }));
              }
      
              // Check boundaries for Y-axis
              if (newPosition.y < 0) {
                newPosition.y = 0;
                setPuckVelocity((prevVelocity) => ({ ...prevVelocity, y: -prevVelocity.y }));
              } else if (newPosition.y + puckRect.height > boardRect.height) {
                newPosition.y = boardRect.height - puckRect.height;
          setPuckVelocity((prevVelocity) => ({ ...prevVelocity, y: -prevVelocity.y }));
        }

        return newPosition;
      });
          
          setPuckVelocity((prevVelocity) => ({
            x: prevVelocity.x * friction,
            y: prevVelocity.y * friction,
          }));
        };    

          const update = () => {
            updatePlayerPosition();
            updatePuckPosition();
          };
      
          if (movementIntervalRef.current) {
            clearInterval(movementIntervalRef.current);
          }
      
          movementIntervalRef.current = setInterval(update, 1000 / 60); // Update position 60 times per second
      
          return () => {
            clearInterval(movementIntervalRef.current);
          };
        }, [keysPressed, puckVelocity]);
  
    useEffect(() => {
      const handleKeyDown = (event) => {
        setKeysPressed((prevKeysPressed) => ({
          ...prevKeysPressed,
          [event.key.toLowerCase()]: true,
        }));
      };
  
      const handleKeyUp = (event) => {
        setKeysPressed((prevKeysPressed) => ({
          ...prevKeysPressed,
          [event.key.toLowerCase()]: false,
        }));
      };
  
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
  
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }, []);
  
    const handleMouseDown = (e) => {
        e.preventDefault();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        const offsetX = clientX - playerPosition.x;
        const offsetY = clientY - playerPosition.y;
      
        const figureInitialLeft = parseFloat(getComputedStyle(playerFigureRef.current).left);
        const figureInitialTop = parseFloat(getComputedStyle(playerFigureRef.current).top);
      
        const handleMouseMove = (e) => {

            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);

            const newPosition = {
            x: clientX - offsetX,
            y: clientY - offsetY,
            };
          
            const borderWidth = 40;
          
            // Check boundaries for X-axis
            if (newPosition.x < -figureInitialLeft) {
              newPosition.x = -figureInitialLeft;
            } else if (newPosition.x + playerFigureRef.current.clientWidth + borderWidth > playerBoardSideRef.current.clientWidth - figureInitialLeft) {
              newPosition.x = playerBoardSideRef.current.clientWidth - playerFigureRef.current.clientWidth - figureInitialLeft - borderWidth;
            }
          
            // Check boundaries for Y-axis
            if (newPosition.y < -figureInitialTop) {
              newPosition.y = -figureInitialTop;
            } else if (newPosition.y + playerFigureRef.current.clientHeight + borderWidth > playerBoardSideRef.current.clientHeight - figureInitialTop) {
              newPosition.y = playerBoardSideRef.current.clientHeight - playerFigureRef.current.clientHeight - figureInitialTop - borderWidth;
            }
          
            setPlayerPosition(newPosition);
          };
      
          const handleMouseUp = () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchmove", handleMouseMove);
            window.removeEventListener("touchend", handleMouseUp);
          };
        
          window.addEventListener("mousemove", handleMouseMove);
          window.addEventListener("mouseup", handleMouseUp);
          window.addEventListener("touchmove", handleMouseMove);
          window.addEventListener("touchend", handleMouseUp);
        };
          
          

    return (
        <section className="gameBoardWrapper">
            <div className="gameBoardContent">
                <div className="playerBoardSide" ref={playerBoardSideRef}>
                    <span className="playerFigure" ref={playerFigureRef} style={{
                    transform: `translate(${playerPosition.x}px, ${playerPosition.y}px)`,
                    }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}></span>
                </div>
                    <span className="gameBoardMidLine"></span>
                    <span className="gameBoardMidCircle"></span>
                    <div className="puckStart">
                        <span className="puck" style={{
                            left: `${puckPosition.x}px`,
                            top: `${puckPosition.y}px`,
                            }}>
                        </span>
                    </div>
                <div className="computerBoardSide">
                    <span className="computerFigure"></span>
                </div>
            </div>
        </section>
    )
}

export default GameBoard