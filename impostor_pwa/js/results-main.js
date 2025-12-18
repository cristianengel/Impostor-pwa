// results-main.js - Funcionalidad de la pantalla de resultados

let gameData = null;
let isRevealed = false;

document.addEventListener('DOMContentLoaded', function() {
    const impostorCard = document.getElementById('impostorCard');
    const impostorName = document.getElementById('impostorName');
    const gameDetails = document.getElementById('gameDetails');
    const finalImpostorName = document.getElementById('finalImpostorName');
    const finalFamousPlayer = document.getElementById('finalFamousPlayer');
    const totalPlayers = document.getElementById('totalPlayers');
    const newGameBtn = document.getElementById('newGameBtn');
    
    // Cargar datos del juego
    loadGameData();
    
    // Mostrar datos básicos
    if (gameData) {
        finalImpostorName.textContent = gameData.impostor;
        finalFamousPlayer.textContent = gameData.famousPlayer;
        totalPlayers.textContent = gameData.players.length;
    }
    
    // Funcionalidad de revelar impostor
    impostorCard.addEventListener('click', function() {
        if (!isRevealed && gameData) {
            revealImpostor();
        }
    });
    
    // Botón nueva partida - mantiene automáticamente los jugadores
    newGameBtn.addEventListener('click', function() {
        // Limpiar solo los datos del juego, mantener la lista de jugadores
        localStorage.removeItem('gameData');
        window.location.href = 'index.html';
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
    
    function revealImpostor() {
        isRevealed = true;
        
        // Actualizar el nombre del impostor en la carta
        impostorName.textContent = gameData.impostor;
        
        // Agregar clase de revelado
        impostorCard.classList.add('revealed');
        
        // Mostrar detalles del juego después de un breve delay
        setTimeout(() => {
            gameDetails.style.display = 'block';
            gameDetails.style.animation = 'fadeIn 0.5s ease-out';
        }, 500);
        
        // Cambiar cursor
        impostorCard.style.cursor = 'default';
    }
});

// Agregar animación CSS para fadeIn
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);