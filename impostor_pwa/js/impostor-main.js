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
        const currentPlayer = (gameData.queue && gameData.queue.length)
            ? gameData.queue[gameData.currentPlayerIndex]
            : gameData.players[gameData.currentPlayerIndex];
        
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
        
        // Determinar longitud de la cola (si existe) o usar players
        const queueLength = (gameData.queue && gameData.queue.length) ? gameData.queue.length : gameData.players.length;
        if (gameData.currentPlayerIndex >= queueLength) {
            // Rehacer la cola mezclada para un nuevo ciclo
            function shuffleArray(arr) {
                const a = arr.slice();
                for (let i = a.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [a[i], a[j]] = [a[j], a[i]];
                }
                return a;
            }

            gameData.queue = shuffleArray(gameData.players || []);
            gameData.currentPlayerIndex = 0;
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

            // Si no existe la cola, crearla a partir de players y mezclarla
            if (!gameData.queue || !Array.isArray(gameData.queue) || gameData.queue.length === 0) {
                function shuffleArray(arr) {
                    const a = arr.slice();
                    for (let i = a.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [a[i], a[j]] = [a[j], a[i]];
                    }
                    return a;
                }

                gameData.queue = shuffleArray(gameData.players || []);
                gameData.currentPlayerIndex = gameData.currentPlayerIndex || 0;
            }
        } catch (error) {
            console.error('Error al cargar datos del juego:', error);
            alert('Error en los datos del juego. Regresando al inicio.');
            window.location.href = 'index.html';
        }
    }
    
    function updateCurrentPlayer() {
        if (!gameData || !gameData.queue) return;

        const currentPlayer = gameData.queue[gameData.currentPlayerIndex];
        currentPlayerName.textContent = currentPlayer;

        // Actualizar contador
        const playerCount = `${gameData.currentPlayerIndex + 1}/${gameData.queue.length}`;
        document.title = `El Impostor - ${playerCount}`;
    }
    
    function resetCard() {
        isRevealed = false;
        roleInstruction.innerHTML = 'MANTENÉ PRESIONADO<br>PARA REVELAR<br>EL JUGADOR';
        gameCard.classList.remove('revealed', 'impostor');
        gameCard.style.cursor = 'pointer';
    }
    
    function endGame() {
        // Mantener por compatibilidad: reiniciamos la cola y continuamos.
        function shuffleArray(arr) {
            const a = arr.slice();
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }

        gameData.queue = shuffleArray(gameData.players || []);
        gameData.currentPlayerIndex = 0;
        localStorage.setItem('gameData', JSON.stringify(gameData));
        updateCurrentPlayer();
        resetCard();
    }
});