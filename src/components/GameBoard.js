import React, { useState, useEffect, useRef } from "react";
import '../styles/GameBoard.css'

const GameBoard = () => {
    const [computerPosition, setComputerPosition] = useState({ x: 0, y: 0 });
    const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
    const [puckPosition, setPuckPosition] = useState({ x: 665, y: 257 });
    const [puckVelocity, setPuckVelocity] = useState({ x: 0, y: 0 });
    const [keysPressed, setKeysPressed] = useState({});
    const [gameStarted, setGameStarted] = useState(false)
    const [playerScore, setPlayerScore] = useState(0)
    const [computerScore, setComputerScore] = useState(0)
    const [playerScored, setPlayerScored] = useState(false)
    const [computerScored, setComputerScored] = useState(false)
    const [stopFigureMovement, setStopFigureMovement] = useState(false)
    const playerFigureRef = useRef(null);
    const playerBoardSideRef = useRef(null);
    const computerBoardSideRef = useRef(null)
    const computerFigureRect = useRef(null)
    const movementIntervalRef = useRef(null);
    const gameBoardContentRef = useRef(null);
    const computerGoalPostRef = useRef(null);
    const playerGoalPostRef = useRef(null)
    const step = 15;
    const computerStep = 5;
    const friction = 0.98; // Adjust this value to change the slowing down effect
    const impactMultiplier = 3;

    const checkCollision = (rect1, rect2) => {
        return (
          rect1.x < rect2.x + rect2.width &&
          rect1.x + rect1.width > rect2.x &&
          rect1.y < rect2.y + rect2.height &&
          rect1.y + rect1.height > rect2.y
        );
      };


      const updateComputerPosition = () => {
        if (!gameBoardContentRef.current || !computerFigureRect.current || !gameStarted) return;
      
        const boardRect = computerBoardSideRef.current.getBoundingClientRect();
        const compFigureRect = computerFigureRect.current.getBoundingClientRect();
        const puckRect = document.querySelector(".puck").getBoundingClientRect();

        const figureInitialLeft = parseFloat(getComputedStyle(computerFigureRect.current).left);
        const figureInitialTop = parseFloat(getComputedStyle(computerFigureRect.current).top);

        // Calculate the mid-point of the board
        const midBoardX = boardRect.x + boardRect.width / 1.4;
        const midBoardY = boardRect.y + boardRect.height / 2;

        // Adjust targetX and targetY based on the mid-point of the board
        const targetX = puckRect.x + puckRect.width / 2 - midBoardX;
        const targetY = puckRect.y + puckRect.height / 2 - midBoardY;

        // Check if the puck is in the computer's side
        if (checkCollision(boardRect, puckRect)) {
          setComputerPosition((prevPosition) => {
            const newPosition = { ...prevPosition };

            const computerThreshold = 3;

            const diffX = targetX - (newPosition.x + compFigureRect.width / 2);
            const diffY = targetY - (newPosition.y + compFigureRect.height / 2);

            if (Math.abs(diffX) > computerThreshold) {
              const stepX = Math.sign(diffX) * Math.min(Math.abs(diffX), computerStep);
              newPosition.x += stepX;
            }

            if (Math.abs(diffY) > computerThreshold) {
              const stepY = Math.sign(diffY) * Math.min(Math.abs(diffY), computerStep);
              newPosition.y += stepY;
            }

      
            // Check boundaries for X-axis
            if (newPosition.x < -figureInitialLeft) {
              newPosition.x = -figureInitialLeft;
            } else if (newPosition.x + compFigureRect.width > boardRect.width - figureInitialLeft) {
              newPosition.x = boardRect.width - compFigureRect.width - figureInitialLeft;
            }
      
            // Check boundaries for Y-axis
            if (newPosition.y < -figureInitialTop) {
              newPosition.y = -figureInitialTop;
            } else if (newPosition.y + compFigureRect.height > boardRect.height - figureInitialTop) {
              newPosition.y = boardRect.height - compFigureRect.height - figureInitialTop;
            }
      
            // Check collision between computerFigure and puck
            if (checkCollision(compFigureRect, puckRect)) {
              const puckCenterX = puckRect.x + puckRect.width / 2;
              const puckCenterY = puckRect.y + puckRect.height / 2;
              const compCenterX = compFigureRect.x + compFigureRect.width / 2;
              const compCenterY = compFigureRect.y + compFigureRect.height / 2;
      
              const impactDirectionX = Math.sign(puckCenterX - compCenterX);
              const impactDirectionY = Math.sign(puckCenterY - compCenterY);
      
              setPuckVelocity((prevVelocity) => ({
                x: prevVelocity.x + impactDirectionX * impactMultiplier,
                y: prevVelocity.y + impactDirectionY * impactMultiplier,
              }));
            }
      
            return newPosition;
          });
        }
      };
      
      
  
    useEffect(() => {
        const updatePlayerPosition = () => {
            if (!playerBoardSideRef.current || !playerFigureRef.current || stopFigureMovement) return;
          console.log('moving')
            const boardRect = playerBoardSideRef.current.getBoundingClientRect();
            const figureRect = playerFigureRef.current.getBoundingClientRect();
            const puckRect = document.querySelector('.puck').getBoundingClientRect();
          
            const figureInitialLeft = parseFloat(getComputedStyle(playerFigureRef.current).left);
            const figureInitialTop = parseFloat(getComputedStyle(playerFigureRef.current).top);
            
            setPlayerPosition((prevPosition) => {
              const newPosition = { ...prevPosition };
              console.log(newPosition)

              
          
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
          
              // Check boundaries for X-axis
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
              } 
          
              return newPosition;
            });
          };


          const updatePuckPosition = () => {
            if (!gameBoardContentRef.current || !playerFigureRef.current || !gameStarted) return;
          
            const boardRect = gameBoardContentRef.current.getBoundingClientRect();
            const figureRect = playerFigureRef.current.getBoundingClientRect();
            const puckRect = document.querySelector(".puck").getBoundingClientRect();
            const borderWidth = 3; // Adjust this value according to the border width of gameBoardContent
            
          
            setPuckPosition((prevPuckPosition) => {
              // Check if playerFigure hits the puck
              if (checkCollision(figureRect, puckRect)) {
                const deltaX = (puckRect.x + puckRect.width / 2) - (figureRect.x + figureRect.width / 2);
                const deltaY = (puckRect.y + puckRect.height / 2) - (figureRect.y + figureRect.height / 2);
                const angle = Math.atan2(deltaY, deltaX);
          
                const offset = 6; // Adjust this value to change the minimum separation between the puck and player figure
                prevPuckPosition.x += Math.cos(angle) * offset;
                prevPuckPosition.y += Math.sin(angle) * offset;
          
                setPuckVelocity((prevVelocity) => ({
                  x: prevVelocity.x + Math.cos(angle) * impactMultiplier,
                  y: prevVelocity.y + Math.sin(angle) * impactMultiplier,
                }));
              }
          
              const newPosition = {
                x: prevPuckPosition.x + puckVelocity.x,
                y: prevPuckPosition.y + puckVelocity.y,
              };
          
              if (newPosition.x < borderWidth || newPosition.x + puckRect.width > boardRect.width - borderWidth ||
              newPosition.y < borderWidth || newPosition.y + puckRect.height > boardRect.height - borderWidth) {
  
              // Calculate the angle of the wall that the puck hit
              let normalAngle = 0;
              if (puckRect.x < borderWidth) {
                // Left wall
                normalAngle = 0;
              } else if (puckRect.x + puckRect.width > boardRect.width - borderWidth) {
                // Right wall
                normalAngle = 0;
              } else if (puckRect.y < borderWidth) {
                // Top wall
                normalAngle = 0;
              } else if (puckRect.y + puckRect.height > boardRect.height - borderWidth) {
                // Bottom wall
                normalAngle = 0;
              }

              if (normalAngle !== 0) {
                // Reflect the puck's velocity vector across the normal to the wall
                const angle = 2 * normalAngle - Math.atan2(puckVelocity.y, puckVelocity.x);
                const speed = Math.sqrt(puckVelocity.x * puckVelocity.x + puckVelocity.y * puckVelocity.y) * impactMultiplier;

                setPuckVelocity({
                  x: Math.cos(angle) * speed,
                  y: Math.sin(angle) * speed,
                });
              } else {
                setPuckVelocity({
                  x: puckVelocity.x * friction,
                  y: puckVelocity.y * friction,
                });
              }
            };

          
              // Check boundaries for X-axis
              if (newPosition.x < borderWidth) {
                newPosition.x = borderWidth;
                setPuckVelocity((prevVelocity) => ({ ...prevVelocity, x: -prevVelocity.x }));
              } else if (newPosition.x + puckRect.width > boardRect.width - borderWidth) {
                newPosition.x = boardRect.width - puckRect.width - borderWidth;
                setPuckVelocity((prevVelocity) => ({ ...prevVelocity, x: -prevVelocity.x }));
              }
          
              // Check boundaries for Y-axis
              if (newPosition.y < borderWidth) {
                newPosition.y = borderWidth;
                setPuckVelocity((prevVelocity) => ({ ...prevVelocity, y: -prevVelocity.y }));
              } else if (newPosition.y + puckRect.height > boardRect.height - borderWidth) {
                newPosition.y = boardRect.height - puckRect.height - borderWidth;
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
            updateComputerPosition();
            checkForGoal();
          };
      
          if (movementIntervalRef.current) {
            clearInterval(movementIntervalRef.current);
          }
      
          movementIntervalRef.current = setInterval(update, 1000 / 60); // Update position 60 times per second
      
          return () => {
            clearInterval(movementIntervalRef.current);
          };
        }, [keysPressed, puckVelocity, gameStarted, stopFigureMovement]);
  
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
      console.log(e)
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        const offsetX = clientX - playerPosition.x;
        const offsetY = clientY - playerPosition.y;
        console.log(clientX)
      
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
            const playerFigureRect = playerFigureRef.current.getBoundingClientRect();
            const puckRect = document.querySelector(".puck").getBoundingClientRect();
            if (checkCollision(playerFigureRect, puckRect)) {
              setGameStarted(true)
            }
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


        useEffect(() => {
          if (gameStarted) return
          const playerFigureRect = playerFigureRef.current.getBoundingClientRect();
          const puckRect = document.querySelector(".puck").getBoundingClientRect();
          if (checkCollision(playerFigureRect, puckRect)) {
            setGameStarted(true)
          }
        },[playerPosition])

          
        const checkForGoal = () => {
          const playerGoalPostRect = playerGoalPostRef.current.getBoundingClientRect();
          const computerGoalPostRect = computerGoalPostRef.current.getBoundingClientRect();
          const puckRect = document.querySelector(".puck").getBoundingClientRect();
          if (checkCollision(computerGoalPostRect, puckRect)) {
            setPlayerPosition({ x: 0, y: 0 });
            setComputerPosition({ x: 0, y: 0 });
            setPuckPosition({ x: 665, y: 257 });
            setStopFigureMovement(true)
            setGameStarted(false)
            setPlayerScore(playerScore + 1)
            setPlayerScored(true)
            setTimeout(() => {
              setStopFigureMovement(false)
              setPlayerScored(false)
            }, 3000);
          } 
          if (checkCollision(playerGoalPostRect, puckRect)) {
            setPlayerPosition({ x: 0, y: 0 });
            setComputerPosition({ x: 0, y: 0 });
            setPuckPosition({ x: 665, y: 257 });
            setStopFigureMovement(true)
            setGameStarted(false)
            setComputerScore(computerScore + 1)
            setComputerScored(true)
            setTimeout(() => {
              setStopFigureMovement(false)
              setComputerScored(false)
            }, 3000);
            console.log('true')
          }
        }

    return (
        <section className="gameBoardWrapper">
            <div className="gameBoardContent" ref={gameBoardContentRef}>
                <div className="playerBoardSide" ref={playerBoardSideRef}>
                    <span className={`playerFigure ${stopFigureMovement ? 'pointer-event-off' : ''}`} ref={playerFigureRef} style={{
                    transform: `translate(${playerPosition.x}px, ${playerPosition.y}px)`,
                    }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}></span>
                    <span className="playerGoalCircle"></span>
                    <span className="playerGoalPost" ref={playerGoalPostRef}></span>
                </div>
                    <span className="gameBoardMidLine"></span>
                    <span className="gameBoardMidCircle"></span>
                        <span className="puck" style={{
                            left: `${puckPosition.x}px`,
                            top: `${puckPosition.y}px`,
                            }}>
                        </span>
                <div className="computerBoardSide" ref={computerBoardSideRef}>
                    <span className="computerFigure" ref={computerFigureRect} style={{
                    transform: `translate(${computerPosition.x}px, ${computerPosition.y}px)`,
                    }}></span>
                    <span className="computerGoalCircle"></span>
                    <span className="computerGoalPost" ref={computerGoalPostRef}></span>
                </div>
            </div>
            <div className="scoreBoardWrapper">
                  <span id="playerScore">Score: {playerScore}</span>
                  <span id="computerScore">Score: {computerScore}</span>
            </div>
            {(playerScored || computerScored) && (
              <div className="goalTxtWrapper">
                  <span className={`goalTxt ${playerScored ? 'playerScored' : 'computerScored'}`}>{playerScored ? 'PLAYER' : 'COMPUTER'} SCORED</span>
              </div>
            )}
        </section>
    )
}

export default GameBoard