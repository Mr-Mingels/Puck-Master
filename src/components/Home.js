import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Home.css'

const Home = () => {
    const [rulesOpen, setRulesOpen] = useState(false)
    const [highScoreOpen, setHighScoreOpen] = useState(false)

    const navigate = useNavigate()

    const toggleOpenAndCloseRulesModal = () => {
        if (!rulesOpen) {
            setRulesOpen(true)
        } else {
            setRulesOpen(false)
        }
    }

    const toggleOpenAndCloseHighScoresModal = () => {
        if (!highScoreOpen) {
            setHighScoreOpen(true)
        } else {
            setHighScoreOpen(false)
        }
    }

    const navigateToEasyMode = () => {
        navigate('/game/mode=easy')
    }

    const navigateToMediumMode = () => {
        navigate('/game/mode=medium')
    }

    const navigateToHardMode = () => {
        navigate('/game/mode=hard')
    }
    return (
        <section className="homeWrapper">
            <div className="homeContent">
                <h1 className="homeTitle">Puck Master</h1>
                <div className="difficultyOptionsWrapper">
                    <h3 className="selectDiffTxt">Select Difficulty:</h3>
                    <div className="difficultyBtnsWrapper">
                        <button className="difficultyBtn" onClick={() => navigateToEasyMode()}>Easy</button>
                        <button className="difficultyBtn" onClick={() => navigateToMediumMode()}>Medium</button>
                        <button className="difficultyBtn" onClick={() => navigateToHardMode()}>Hard</button>
                    </div>
                    <div className="gameInfoBtnsWrapper">
                    <button className="gameInfoBtn" onClick={() => toggleOpenAndCloseRulesModal()}>Rules</button>
                    <button className="gameInfoBtn" onClick={() => toggleOpenAndCloseHighScoresModal()}>High Scores</button>
                    </div>
                </div>
            </div>
            {rulesOpen &&(
            <div className="rulesModalWrapper">
                <div className="rulesModalContent">
                    <h2 className="rulesTitle">Rules</h2>
                    <ul className="rulesListWrapper">
                        <li className="rule">Each player is given a figure to hit the puck towards the opponent's side in an attempt to score 
                        a goal.</li>
                        <li className="rule">You can control your figure using the 'W, A, S, D' keys or the 'UP, DOWN, LEFT, RIGHT' arrow keys 
                        on your keyboard.</li>
                        <li className="rule">Alternatively, you can control your figure by clicking and dragging it around the board using your 
                        mouse or touchscreen.</li>
                        <li className="rule">The objective of the game is to score goals by maneuvering the puck into the opponent's goal using 
                        the figure.</li>
                        <li className="rule">A goal is scored when the puck enters and remains in the opponent's goal.</li>
                        <li className="rule">After a goal is scored, you will serve the puck to resume the game.</li>
                        <li className="rule">Each game lasts until one of the players reaches 15 points. The first player to score 15 points 
                        wins the game.</li>
                    </ul>
                    <button className="closeBtn" onClick={() => toggleOpenAndCloseRulesModal()}>Close</button>
                </div>
            </div>
            )}
            {highScoreOpen &&(
            <div className="highScoresModalWrapper">
                <div className="highScoresModalContent">
                    <h2 className="highScoreTitle">High Scores</h2>
                    <ul className="highScoreDifficultyTypeWrapper">
                        <li className="highScoreDifficultyType">Easy:<span className="points">0 points</span></li>
                        <li className="highScoreDifficultyType">Medium:<span className="points">0 points</span></li>
                        <li className="highScoreDifficultyType">Hard:<span className="points">0 points</span></li>
                    </ul>
                    <button className="closeBtn highScoreModal" onClick={() => toggleOpenAndCloseHighScoresModal()}>Close</button>
                </div>
            </div>
            )}
        </section>
    )
}

export default Home