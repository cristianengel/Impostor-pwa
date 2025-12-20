// main.js - Funcionalidad principal de El Impostor

document.addEventListener('DOMContentLoaded', function() {
    const addBtn = document.getElementById('addPlayerBtn');
    const playerDialog = document.getElementById('playerDialog');
    const playerInput = document.getElementById('playerInput');
    const confirmBtn = document.getElementById('confirmBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const playersList = document.getElementById('playersList');
    const emptyMessage = document.getElementById('emptyMessage');
    const startSection = document.getElementById('startSection');
    const startGameBtn = document.getElementById('startGameBtn');

    // Cargar jugadores guardados al inicio
    loadSavedPlayers();

    function updateUI() {
        const playerCount = playersList.children.length;
        
        // Mostrar/ocultar mensaje vacío
        if (playerCount === 0) {
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
        }
        
        // Mostrar/ocultar botón de comenzar juego
        if (playerCount >= 3) {
            startSection.style.display = 'block';
        } else {
            startSection.style.display = 'none';
        }

        // Guardar jugadores en localStorage
        savePlayersToStorage();
    }

    function savePlayersToStorage() {
        const playerNames = Array.from(playersList.querySelectorAll('.player-name'))
            .map(player => player.textContent.trim());
        localStorage.setItem('savedPlayers', JSON.stringify(playerNames));
    }

    function loadSavedPlayers() {
        const savedPlayers = localStorage.getItem('savedPlayers');
        if (savedPlayers) {
            try {
                const playerNames = JSON.parse(savedPlayers);
                playerNames.forEach(playerName => {
                    const newPlayerElement = createPlayerElement(playerName);
                    playersList.appendChild(newPlayerElement);
                });
                updateUI();
            } catch (error) {
                console.error('Error al cargar jugadores guardados:', error);
            }
        }
    }

    function showDialog() {
        playerDialog.showModal();
        playerInput.focus();
        playerInput.value = '';
    }

    function hideDialog() {
        playerDialog.close();
        playerInput.value = '';
    }

    function createPlayerElement(playerName) {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="player-item">
                <span class="player-name">${playerName}</span>
                <button class="remove-btn">×</button>
            </div>
        `;
        
        // Agregar event listener al botón de remover
        const removeBtn = li.querySelector('.remove-btn');
        removeBtn.addEventListener('click', function() {
            li.remove();
            updateUI();
        });
        
        return li;
    }

    // Event listeners para botones principales
    addBtn.addEventListener('click', showDialog);
    cancelBtn.addEventListener('click', hideDialog);

    // Botón de comenzar juego
    startGameBtn.addEventListener('click', async function() {
        // Obtener lista de jugadores de la primera pantalla
        const playerNames = Array.from(playersList.querySelectorAll('.player-name'))
            .map(player => player.textContent.trim());
        
        if (playerNames.length < 3) {
            alert('Necesitas al menos 3 jugadores para comenzar');
            return;
        }
        
        try {
            // Cargar datos de jugadores famosos
            const response = await fetch('../resources/player-data.json');
            const playerData = await response.json();
            
            // Obtener jugadores usados del localStorage
            let usedPlayers = JSON.parse(localStorage.getItem('usedFamousPlayers') || '[]');
            
            // Si todos fueron usados, reiniciar la lista
            if (usedPlayers.length >= playerData.players.length) {
                usedPlayers = [];
            }
            
            // Filtrar jugadores no usados
            const availablePlayers = playerData.players.filter(player => 
                !usedPlayers.includes(player)
            );
            
            // Elegir jugador famoso al azar de los disponibles
            const randomFamousPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
            
            // Agregar a la lista de usados
            usedPlayers.push(randomFamousPlayer);
            localStorage.setItem('usedFamousPlayers', JSON.stringify(usedPlayers));
            
            // Elegir impostor al azar de la lista de jugadores
            const randomImpostorIndex = Math.floor(Math.random() * playerNames.length);
            const impostor = playerNames[randomImpostorIndex];
            
            // Preparar datos del juego
            const gameData = {
                players: playerNames,
                impostor: impostor,
                famousPlayer: randomFamousPlayer,
                currentPlayerIndex: 0
            };
            
            // Guardar en localStorage para pasarlo a la siguiente página
            localStorage.setItem('gameData', JSON.stringify(gameData));
            
            // Ir a la página del juego
            window.location.href = 'impostor.html';
            
        } catch (error) {
            console.error('Error cargando datos de jugadores:', error);
            alert('Error al inicializar el juego. Intenta de nuevo.');
        }
    });

    // Cerrar dialog al hacer clic en el backdrop
    playerDialog.addEventListener('click', function(e) {
        if (e.target === playerDialog) {
            hideDialog();
        }
    });

    confirmBtn.addEventListener('click', function() {
        const playerName = playerInput.value.trim();
        
        if (playerName) {
            // Verificar si el jugador ya existe
            const existingPlayers = Array.from(playersList.querySelectorAll('.player-name'));
            const playerExists = existingPlayers.some(player => 
                player.textContent.toLowerCase() === playerName.toLowerCase()
            );
            
            if (playerExists) {
                alert('Este jugador ya existe en la lista');
                return;
            }
            
            // Agregar nuevo jugador
            const newPlayerElement = createPlayerElement(playerName);
            playersList.appendChild(newPlayerElement);
            updateUI();
            hideDialog();
        }
    });

    // Enter para confirmar
    playerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            confirmBtn.click();
        }
    });

    // Escape para cancelar
    playerDialog.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideDialog();
        }
    });

    // Agregar event listeners a los botones X existentes
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('li').remove();
            updateUI();
        });
    });

    // Inicializar estado de la UI
    updateUI();
});