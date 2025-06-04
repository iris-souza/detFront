import React, { useState } from 'react';
import MysterySelector from './components/MysterySelector';
import ChatGame from './components/ChatGame';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('intro');
  const [activeMysteryId, setActiveMysteryId] = useState(null);
  const [activeMysteryDuration, setActiveMysteryDuration] = useState(null);

  const handleShowMysteries = () => {
    setCurrentScreen('mystery_selection');
  };

  const handleSelectMystery = (id, duration) => {
    setActiveMysteryId(id);
    setActiveMysteryDuration(duration);
    setCurrentScreen('game');
  };

  const handleGameEnd = () => {
    setActiveMysteryId(null);
    setActiveMysteryDuration(null);
    setCurrentScreen('mystery_selection');
  };

  return (
    <div className="container">
      <h1>Detetive Generativo</h1>

      {currentScreen === 'intro' && (
        <div id="intro-screen" className="screen">
          <p>Seja bem-vindo(a), detetive! Prepare-se para mistérios nunca antes vistos.</p>
          <button onClick={handleShowMysteries}>Começar um Mistério</button>
        </div>
      )}

      {currentScreen === 'mystery_selection' && (
        <div id="mystery-selection-screen" className="screen">
          <MysterySelector onSelectMystery={handleSelectMystery} />
          <button onClick={() => setCurrentScreen('intro')}>Voltar</button>
        </div>
      )}

      {currentScreen === 'game' && activeMysteryId && activeMysteryDuration && (
        <div id="game-screen" className="screen">
          <ChatGame 
            mysteryId={activeMysteryId} 
            duration={activeMysteryDuration} 
            onGameEnd={handleGameEnd}
          />
        </div>
      )}
    </div>
  );
}

export default App;