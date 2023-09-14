import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import '../styles/GameBoard.css'

const GameBoard = ({ getEasyScore, getMediumScore, getHardScore }) => {
    const [computerPosition, setComputerPosition] = useState({ x: 0, y: 0 });
    const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
    const [prevPlayerPosition, setPrevPlayerPosition] = useState({ x: 0, y: 0 });
    const [prevComputerPosition, setPrevComputerPosition] = useState({ x: 0, y: 0 });
    const [puckVelocity, setPuckVelocity] = useState({ x: 0, y: 0 });
    const [keysPressed, setKeysPressed] = useState({});
    const [gameStarted, setGameStarted] = useState(false)
    const [playerScore, setPlayerScore] = useState(0)
    const [computerScore, setComputerScore] = useState(0)
    const [playerScored, setPlayerScored] = useState(false)
    const [computerScored, setComputerScored] = useState(false)
    const [stopFigureMovement, setStopFigureMovement] = useState(false)
    const [playerWon, setPlayerWon] = useState(false)
    const [computerWon, setComputerWon] = useState(false)
    const playerFigureRef = useRef(null);
    const playerBoardSideRef = useRef(null);
    const computerBoardSideRef = useRef(null)
    const computerFigureRef = useRef(null)
    const movementIntervalRef = useRef(null);
    const gameBoardContentRef = useRef(null);
    const computerGoalPostRef = useRef(null);
    const playerGoalPostRef = useRef(null)
    const puckRef = useRef(null)
    const stopFigureMovementRef = useRef(stopFigureMovement);
    const step = 15;
    const friction = 0.98; // Adjust this value to change the slowing down effect
    const { id } = useParams();
    const navigate = useNavigate()

    const getCenterPosition = (element, puckElement) => {
      if (!element || !puckElement) return { x: 0, y: 0 };
    
      const rect = element.getBoundingClientRect();
      const puckRect = puckElement.getBoundingClientRect();
      const centerX = rect.width / 2 - puckRect.width / 2;
      const centerY = rect.height / 2 - puckRect.height / 2;
    
      // Add small adjustments to center X and Y coordinates, e.g., 2 pixels
      const adjustmentX = -2;
      const adjustmentY = -2;
    
      return { x: centerX + adjustmentX, y: centerY + adjustmentY };
    };
    

    useEffect(() => {
      if (gameBoardContentRef.current && puckRef.current) {
        const centerPosition = getCenterPosition(gameBoardContentRef.current, puckRef.current);
        setPuckPosition(centerPosition);
      }
    }, [gameBoardContentRef, puckRef, window.innerWidth, window.innerHeight]);

    const [puckPosition, setPuckPosition] = useState(getCenterPosition(gameBoardContentRef.current, puckRef.current));


    const [computerStep, setComputerStep] = useState(5)
    const [impactMultiplier, setImpactMultiplier] = useState(4)

    useEffect(() => {
      if (id !== 'mode=easy' && id !== 'mode=medium' && id !== 'mode=hard') {
        navigate('/');
      }
      if (id === 'mode=easy' && window.innerWidth <= 501) {
        setComputerStep(2.5)
      }
      if (id === 'mode=medium') {
        if (window.innerWidth <= 501) {
          setComputerStep(5)
        } else {
          setComputerStep(10)
        }
      } else if (id === 'mode=hard') {
        if (window.innerWidth <= 501) {
          setComputerStep(7.5)
        } else {
          setComputerStep(15)
        }
      }
    }, [id, navigate, window.innerWidth]);

    const checkCollision = (rect1, rect2) => {
        return (
          rect1.x < rect2.x + rect2.width &&
          rect1.x + rect1.width > rect2.x &&
          rect1.y < rect2.y + rect2.height &&
          rect1.y + rect1.height > rect2.y
        );
      };


      const updateComputerPosition = () => {
        if (!gameBoardContentRef.current || !computerBoardSideRef.current || !gameStarted) return;
      
        const boardRect = computerBoardSideRef.current.getBoundingClientRect();
        const compFigureRect = computerFigureRef.current.getBoundingClientRect();
        const puckRect = document.querySelector(".puck").getBoundingClientRect();

        const figureInitialLeft = parseFloat(getComputedStyle(computerFigureRef.current).left);
        const figureInitialTop = parseFloat(getComputedStyle(computerFigureRef.current).top);

        // Calculate the mid-point of the board
        const midBoardX = boardRect.x + boardRect.width / (window.innerWidth > 1536 ? (1.2) : (window.innerWidth >= 800 ? 1.4 : 2.4));
        const midBoardY = boardRect.y + boardRect.height / (window.innerWidth > 1536 ? (2.4) : (window.innerWidth >= 800 ? 2.4 : 4.5));

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
            setPrevComputerPosition({ x: computerPosition.x, y: computerPosition.y })

            return newPosition
          });
        } else {
          // Move the computerFigure back to its default position when the puck is outside its side
          setComputerPosition((prevPosition) => {
            const newPosition = { ...prevPosition };
      
            const computerThreshold = 3;
      
            // Calculate the difference between the default position and the current position
            const diffX = 0 - newPosition.x;
            const diffY = 0 - newPosition.y;
      
            if (Math.abs(diffX) > computerThreshold) {
              const stepX = Math.sign(diffX) * Math.min(Math.abs(diffX), computerStep);
              newPosition.x += stepX;
            }
      
            if (Math.abs(diffY) > computerThreshold) {
              const stepY = Math.sign(diffY) * Math.min(Math.abs(diffY), computerStep);
              newPosition.y += stepY;
            }
            setPrevComputerPosition({ x: computerPosition.x, y: computerPosition.y })
      
            return newPosition;
          });
        }
      };
      
      
  
    useEffect(() => {
        const updatePlayerPosition = () => {
            if (!playerBoardSideRef.current || !playerFigureRef.current || stopFigureMovement) return;
          
            const boardRect = playerBoardSideRef.current.getBoundingClientRect();
            const figureRect = playerFigureRef.current.getBoundingClientRect();
            const puckRect = document.querySelector('.puck').getBoundingClientRect();
          
            const figureInitialLeft = parseFloat(getComputedStyle(playerFigureRef.current).left);
            const figureInitialTop = parseFloat(getComputedStyle(playerFigureRef.current).top);
            
            setPlayerPosition((prevPosition) => {
              const newPosition = { ...prevPosition };
              if (isNaN(newPosition.x) && isNaN(newPosition.y) && !stopFigureMovement) {
                newPosition.x = 0
                newPosition.y = 0
              }

              
          
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
              setPrevPlayerPosition({ x: playerPosition.x, y: playerPosition.y });
          
              return newPosition;
            });
          };


          const updatePuckPosition = () => {
            if (!gameBoardContentRef.current || !playerFigureRef.current || !gameStarted || !computerFigureRef.current) return;
            const boardRect = gameBoardContentRef.current.getBoundingClientRect();
            const figureRect = playerFigureRef.current.getBoundingClientRect();
            const computerFigureRect = computerFigureRef.current.getBoundingClientRect()
            const puckRect = document.querySelector(".puck").getBoundingClientRect();
            const borderWidth = 3; // Adjust this value according to the border width of gameBoardContent
            
          
            setPuckPosition((prevPuckPosition) => {
              // Check if playerFigure or computerFigure hits the puck
              if (checkCollision(figureRect, puckRect) || checkCollision(computerFigureRect, puckRect)) {
                // Determine which figure hit the puck
                const figureThatHit = checkCollision(figureRect, puckRect) ? figureRect : computerFigureRect;

                const deltaX = (puckRect.x + puckRect.width / 2) - (figureThatHit.x + figureThatHit.width / 2);
                const deltaY = (puckRect.y + puckRect.height / 2) - (figureThatHit.y + figureThatHit.height / 2);
                const angle = Math.atan2(deltaY, deltaX);

                const offset = figureThatHit === figureRect ? 6 : 1; // Adjust this value to change the minimum separation between the puck and figure
                prevPuckPosition.x += Math.cos(angle) * offset;
                prevPuckPosition.y += Math.sin(angle) * offset;

                const speed = Math.sqrt(puckVelocity.x * puckVelocity.x + puckVelocity.y * puckVelocity.y);
                const forceMultiplier = figureThatHit === figureRect ? 1.5 : 1.5; // Adjust these values to change the force applied by the figure
                const maxPuckSpeed = (window.innerWidth >= 501 ? 40 : 20) // You can adjust this value to control the maximum speed of the puck
              
                // Calculate the figure's movement direction based on the difference between the previous and current positions
                let figureDirectionX = 0;
                let figureDirectionY = 0;
                if (figureThatHit === figureRect) {
                    figureDirectionX = (playerPosition.x - prevPlayerPosition.x) / step;
                    figureDirectionY = (playerPosition.y - prevPlayerPosition.y) / step;
                } else if (figureThatHit === computerFigureRect) {
                    figureDirectionX = (computerPosition.x - prevComputerPosition.x) / computerStep;
                    figureDirectionY = (computerPosition.y - prevComputerPosition.y) / computerStep;
                }

                setPuckVelocity((prevVelocity) => {
                  const newVelocity = {
                    x: (Math.cos(angle) * speed + figureDirectionX) * forceMultiplier,
                    y: (Math.sin(angle) * speed + figureDirectionY) * forceMultiplier,
                  };

                  const newSpeed = Math.sqrt(newVelocity.x * newVelocity.x + newVelocity.y * newVelocity.y);
                  if (newSpeed > maxPuckSpeed) {
                    const scaleFactor = maxPuckSpeed / newSpeed;
                    newVelocity.x *= scaleFactor;
                    newVelocity.y *= scaleFactor;
                  }

                  return newVelocity;
                });
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
            if (window.innerWidth <= 800) {
              setImpactMultiplier(2)
            }
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
  

    const handleMouseDown = (e = {}) => {
        document.body.style.overflow = 'hidden';
        const clientX = e.clientX || (e.touches && e.touches[0].clientX) || undefined;
        const clientY = e.clientY || (e.touches && e.touches[0].clientY) || undefined; 
        
        let offsetX = clientX - playerPosition.x;
        let offsetY = clientY - playerPosition.y;
        if (isNaN(offsetX) && isNaN(offsetY) && !stopFigureMovement) {
          offsetX = clientX - playerPosition.x;
          offsetY = clientY - playerPosition.y;
        }
      
        const figureInitialLeft = parseFloat(getComputedStyle(playerFigureRef.current).left);
        const figureInitialTop = parseFloat(getComputedStyle(playerFigureRef.current).top);
      
        const handleMouseMove = (e) => {


          const clientX = e.clientX || (e.touches && e.touches[0].clientX) || NaN;
          const clientY = e.clientY || (e.touches && e.touches[0].clientY) || NaN;  


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
          
            if (!isNaN(offsetX) && !isNaN(offsetY) && !stopFigureMovementRef.current) {
              setPlayerPosition(newPosition);
              setPrevPlayerPosition({ x: playerPosition.x, y: playerPosition.y });
            }
            
            const playerFigureRect = playerFigureRef.current.getBoundingClientRect();
            const puckRect = document.querySelector(".puck").getBoundingClientRect();
            if (checkCollision(playerFigureRect, puckRect)) {
              setGameStarted(true)
            }
          };
      
          const handleMouseUp = () => {
            document.body.style.overflow = 'auto';
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
        
        
        useEffect(() => {
          console.log(document.body.style.overflow)
        },[document.body.style.overflow])

          
        const checkForGoal = () => {
          if (!playerGoalPostRef.current) return
          const playerGoalPostRect = playerGoalPostRef.current.getBoundingClientRect();
          const computerGoalPostRect = computerGoalPostRef.current.getBoundingClientRect();
          const puckRect = document.querySelector(".puck").getBoundingClientRect();
          if (checkCollision(computerGoalPostRect, puckRect)) {
            setPlayerPosition({ x: 0, y: 0 });
            setPrevPlayerPosition({ x: playerPosition.x, y: playerPosition.y });
            setComputerPosition({ x: 0, y: 0 });
            setPrevComputerPosition({ x: computerPosition.x, y: computerPosition.y })
            setPuckPosition(getCenterPosition(gameBoardContentRef.current, puckRef.current));
            setStopFigureMovement(true)
            setGameStarted(false)
            setPlayerScore(playerScore + 1)
            setPlayerScored(true)
            setPlayerPosition({ x: 0, y: 0 });
            setPrevPlayerPosition({ x: playerPosition.x, y: playerPosition.y });
            setTimeout(() => {
              setPlayerPosition({ x: 0, y: 0 });
              setPrevPlayerPosition({ x: playerPosition.x, y: playerPosition.y });
              setStopFigureMovement(false)
              setPlayerScored(false)
              setPuckVelocity({ x: 0, y: 0 });
            }, 1000);
          } 
          if (checkCollision(playerGoalPostRect, puckRect)) {
            setPlayerPosition({ x: 0, y: 0 });
            setPrevPlayerPosition({ x: playerPosition.x, y: playerPosition.y });
            setComputerPosition({ x: 0, y: 0 });
            setPrevComputerPosition({ x: computerPosition.x, y: computerPosition.y })
            setPuckPosition(getCenterPosition(gameBoardContentRef.current, puckRef.current));
            setStopFigureMovement(true)
            setGameStarted(false)
            setComputerScore(computerScore + 1)
            setComputerScored(true)
            setPlayerPosition({ x: 0, y: 0 });
            setPrevPlayerPosition({ x: playerPosition.x, y: playerPosition.y });
            setTimeout(() => {
              setPlayerPosition({ x: 0, y: 0 });
              setPrevPlayerPosition({ x: playerPosition.x, y: playerPosition.y });
              setStopFigureMovement(false)
              setComputerScored(false)
              setPuckVelocity({ x: 0, y: 0 });
            }, 1000);
          }
        }

        useEffect(() => {
          stopFigureMovementRef.current = stopFigureMovement;
          if (stopFigureMovement) {
            handleMouseDown()
          }
        },[stopFigureMovement])

        const unStuckThePuck = () => {
          setPlayerPosition({ x: 0, y: 0 });
          setPrevPlayerPosition({ x: playerPosition.x, y: playerPosition.y });
          setComputerPosition({ x: 0, y: 0 });
          setPrevComputerPosition({ x: computerPosition.x, y: computerPosition.y })
          setPuckPosition(getCenterPosition(gameBoardContentRef.current, puckRef.current));
          setPuckVelocity({ x: 0, y: 0 });
          setGameStarted(false)
        }

        useEffect(() => {
          if (playerScore >= 15) {
            setPlayerWon(true)
            setPlayerScored(false)
            setComputerScored(false)
          } else if (computerScore >= 15) {
            setComputerWon(true)
            setPlayerScored(false)
            setComputerScored(false)
          }
        },[playerScore, computerScore])

        useEffect(() => { 
          if(id === 'mode=easy') {
            getEasyScore(playerScore)
          } else if (id === 'mode=medium') {
            getMediumScore(playerScore)
          } else if (id === 'mode=hard') {
            getHardScore(playerScore)
          }
        },[playerScore])

        const Replay = () => {
            setComputerPosition({ x: 0, y: 0 });
            setPrevComputerPosition({ x: computerPosition.x, y: computerPosition.y })
            setPlayerPosition({ x: 0, y: 0 });
            setPrevPlayerPosition({ x: playerPosition.x, y: playerPosition.y });
            setPuckPosition(getCenterPosition(gameBoardContentRef.current, puckRef.current));
            setPuckVelocity({ x: 0, y: 0 });
            setGameStarted(false)
            setPlayerScore(0)
            setComputerScore(0)
            setPlayerScored(false)
            setComputerScored(false)
            setStopFigureMovement(false)
            setPlayerWon(false)
            setComputerWon(false)
        }

    return (
        <section className="gameBoardWrapper">
          <div className="scoreBoardWrapper">
                  <span id="playerScore">Score: {playerScore}</span>
                  <span id="computerScore">Score: {computerScore}</span>
            </div>
            <div className={`gameBoardContent ${playerScored ? 'playerScored' : ''} ${computerScored ? 'computerScored' : ''}`} 
            ref={gameBoardContentRef}>
                <div className="playerBoardSide" ref={playerBoardSideRef}>
                    <span className={`playerFigure ${stopFigureMovement ? 'pointer-event-off' : ''}`} ref={playerFigureRef} style={{
                    transform: `translate(${playerPosition.x}px, ${playerPosition.y}px)`,
                    }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}></span>
                    <span className={`playerGoalCircle ${playerScored ? 'playerScored' : ''} ${computerScored ? 'computerScored' : ''}`}>
                    </span>
                    <span className={`playerGoalPost ${playerScored ? 'playerScored' : ''} ${computerScored ? 'computerScored' : ''}`} 
                    ref={playerGoalPostRef}></span>
                    <span className="mobilePlayerScore">{playerScore}</span>
                </div>
                    <span className={`gameBoardMidLine ${playerScored ? 'playerScored' : ''} ${computerScored ? 'computerScored' : ''}`}>
                    </span>
                    <span className={`gameBoardMidCircle ${playerScored ? 'playerScored' : ''} ${computerScored ? 'computerScored' : ''}`}>

                    </span>
                    <span className="puck" ref={puckRef} style={
                           {
                              left: `${puckPosition.x}px`,
                              top: `${puckPosition.y}px`,
                            }
                      }>
                      </span>
                <div className="computerBoardSide" ref={computerBoardSideRef}>
                    <span className="computerFigure" ref={computerFigureRef} style={{
                    transform: `translate(${computerPosition.x}px, ${computerPosition.y}px)`,
                    }}></span>
                    <span className={`computerGoalCircle ${playerScored ? 'playerScored' : ''} ${computerScored ? 'computerScored' : ''}`}>
                    </span>
                    <span className={`computerGoalPost ${playerScored ? 'playerScored' : ''} ${computerScored ? 'computerScored' : ''}`} 
                    ref={computerGoalPostRef}></span>
                    <span className="mobileComputerScore">{computerScore}</span>
                </div>
            </div>
            {(playerScored || computerScored) && (
              <div className="goalTxtWrapper">
                  <span className={`goalTxt ${playerScored ? 'playerScored' : 'computerScored'}`}>{playerScored ? 'PLAYER' : 'COMPUTER'} SCORED</span>
              </div>
            )}
            <div className="bottomPageBtnsWrapper">
                <button className="unStuckBtn" onClick={() => unStuckThePuck()}>Unstuck</button>
                <Link to='/'><button className="homeBtn">Home</button></Link>
            </div>
            {(playerWon || computerWon) &&(
              <div className="winnerWrapper">
                  <div className={`winnerContent ${playerWon ? 'playerWon' : 'computerWon'}`}>
                    <span className={`winnerTxt ${playerWon ? 'playerWon' : 'computerWon'}`}>
                      {playerWon ? 'You won the game!' : 'You lost the game!'}</span>
                    <div className="winnerBtnsWrapper">
                      <button className={`replayBtn ${playerWon ? 'playerWon' : 'computerWon'}`} onClick={() => Replay()}>Replay</button>
                      <Link to='/'><button className={`winnerHomeBtn ${playerWon ? 'playerWon' : 'computerWon'}`}>Home</button></Link>
                    </div>
                  </div>
              </div>
            )}
        </section>
    )
}

export default GameBoard