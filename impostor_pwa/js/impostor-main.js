// impostor-main.js - Funcionalidad de la pantalla del juego

let gameData = null;
let isRevealed = false;

document.addEventListener('DOMContentLoaded', function() {
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    const currentPlayerName = document.getElementById('currentPlayerName');
    const roleInstruction = document.getElementById('roleInstruction');
    const gameCard = document.querySelector('.game-card');
    const nextPlayerBtn = document.getElementById('nextPlayerBtn');
    
    // Cargar datos del juego desde localStorage
    loadGameData();
    
    // Inicializar la pantalla con el primer jugador
    updateCurrentPlayer();
    
    // Botón para volver al inicio
    backToHomeBtn.addEventListener('click', function() {
        const confirmExit = confirm('¿Estás seguro que quieres volver al inicio? Se perderá el progreso del juego actual.');
        
        if (confirmExit) {
            // Limpiar datos del juego
            localStorage.removeItem('gameData');
            window.location.href = 'index.html';
        }
    });
    
    // Funcionalidad de mantener presionado para revelar
    let pressTimer;
    let isPressed = false;
    
    gameCard.addEventListener('mousedown', startPress);
    gameCard.addEventListener('mouseup', endPress);
    gameCard.addEventListener('mouseleave', endPress);
    
    // Para dispositivos táctiles
    gameCard.addEventListener('touchstart', startPress);
    gameCard.addEventListener('touchend', endPress);
    gameCard.addEventListener('touchcancel', endPress);
    
    function startPress(e) {
        e.preventDefault();
        if (isRevealed) return;
        
        isPressed = true;
        gameCard.style.transform = 'scale(0.98)';
        
        pressTimer = setTimeout(() => {
            if (isPressed) {
                revealRole();
            }
        }, 800); // 800ms para revelar
    }
    
    function endPress(e) {
        e.preventDefault();
        isPressed = false;
        gameCard.style.transform = 'scale(1)';
        clearTimeout(pressTimer);
    }
    
    function revealRole() {
        if (isRevealed) return;
        
        isRevealed = true;
        const currentPlayer = gameData.players[gameData.currentPlayerIndex];
        
        if (currentPlayer === gameData.impostor) {
            // Es el impostor
            roleInstruction.textContent = 'IMPOSTOR';
            gameCard.classList.add('impostor');
        } else {
            // No es el impostor, mostrar jugador famoso
            roleInstruction.textContent = gameData.famousPlayer;
            gameCard.classList.add('revealed');
        }
        
        // Cambiar el cursor para indicar que no se puede presionar más
        gameCard.style.cursor = 'default';
    }
    
    // Botón siguiente jugador
    nextPlayerBtn.addEventListener('click', function() {
        if (!isRevealed) {
            const confirmNext = confirm('El jugador actual no ha visto su rol. ¿Continuar al siguiente jugador?');
            if (!confirmNext) return;
        }
        
        // Avanzar al siguiente jugador
        gameData.currentPlayerIndex++;
        
        if (gameData.currentPlayerIndex >= gameData.players.length) {
            // Terminar el juego
            endGame();
            return;
        }
        
        // Actualizar localStorage con el progreso
        localStorage.setItem('gameData', JSON.stringify(gameData));
        
        // Actualizar la pantalla
        updateCurrentPlayer();
        resetCard();
    });
    
    function loadGameData() {
        const savedData = localStorage.getItem('gameData');
        if (!savedData) {
            alert('No se encontraron datos del juego. Regresando al inicio.');
            window.location.href = 'index.html';
            return;
        }
        
        try {
            gameData = JSON.parse(savedData);
        } catch (error) {
            console.error('Error al cargar datos del juego:', error);
            alert('Error en los datos del juego. Regresando al inicio.');
            window.location.href = 'index.html';
        }
    }
    
    function updateCurrentPlayer() {
        if (!gameData || !gameData.players) return;
        
        const currentPlayer = gameData.players[gameData.currentPlayerIndex];
        currentPlayerName.textContent = currentPlayer;
        
        // Actualizar contador
        const playerCount = `${gameData.currentPlayerIndex + 1}/${gameData.players.length}`;
        document.title = `El Impostor - ${playerCount}`;
    }
    
    function resetCard() {
        isRevealed = false;
        roleInstruction.innerHTML = 'MANTENÉ PRESIONADO<br>PARA REVELAR<br>EL JUGADOR';
        gameCard.classList.remove('revealed', 'impostor');
        gameCard.style.cursor = 'pointer';
    }
    
    function endGame() {
        // No limpiar datos aquí, se usarán en la pantalla de resultados
        // Navegar a la pantalla de resultados
        window.location.href = 'results.html';
    }
});