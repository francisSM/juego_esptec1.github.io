const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.fillRect(0, 0, canvas.width, canvas.height);
const gravity = 1;

class Sprite {
    constructor({ position, velocity, offset }) {
        this.position = position;
        this.velocity = velocity;
        this.width = 50; 
        this.height = 150;
        this.lastKey;
        this.isOnGround = false;
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            offset: offset,
            width: 100,
            height: 50
        };
        this.isAttacking = false;
        this.health = 100;
        this.facingRight = true;  // Bandera para determinar hacia dónde está mirando
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        
        // Dibujar el attackBox solo si está atacando
        if (this.isAttacking) {
            ctx.fillStyle = 'yellow';
            ctx.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
        }
    }

    update(opponent) {
        this.draw();

        // Determinar si el jugador debe atacar a la izquierda o a la derecha
        if (this.position.x < opponent.position.x) {
            this.facingRight = true;
            this.attackBox.offset.x = 0; // El ataque se desplaza a la derecha
        } else {
            this.facingRight = false;
            this.attackBox.offset.x = -this.attackBox.width/2; // El ataque se desplaza a la izquierda
        }

        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y;

        // Actualiza la posición horizontal
        this.position.x += this.velocity.x;

        // Mantener al jugador dentro de los límites del canvas
        if (this.position.x <= 0) {
            this.position.x = 0;
        } else if (this.position.x + this.width >= canvas.width) {
            this.position.x = canvas.width - this.width;
        }

        // Actualiza la posición vertical
        this.position.y += this.velocity.y;

        // Verificar si el jugador está tocando el suelo
        if (this.position.y + this.height + this.velocity.y >= canvas.height - 100) {
            this.velocity.y = 0;
            this.isOnGround = true;  // El jugador está tocando el suelo
        } else {
            this.velocity.y += gravity;
            this.isOnGround = false; // El jugador está en el aire
        }
    }

    attack() {
        this.isAttacking = true;
        setTimeout(() => {
            this.isAttacking = false;
        }, 100);
    }
}

const player = new Sprite({
    position: {
        x: 150,
        y: 474
    },
    velocity: {
        x: 0,
        y: 10
    },
    offset: {
        x: 0,
        y: 0
    }
});

const enemy = new Sprite({
    position: {
        x: 1300,
        y: 474
    },
    velocity: {
        x: 0,
        y: 0
    },
    offset: {
        x: -50,
        y: 0
    }
});

const keys = {
    a: { pressed: false },
    d: { pressed: false },
    ArrowRight: { pressed: false },
    ArrowLeft: { pressed: false }
};

let lastKey;

function rectangularcollision({ rectangle1, rectangle2 }) {
    return (
        rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
        rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
        rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
    );
}

let gameOver = false; // Variable para controlar el estado del juego

function displayResult(result) {
    const displayTextElement = document.getElementById('displayText');
    displayTextElement.innerHTML = result;
    displayTextElement.style.display = 'flex'; // Mostrar el texto
}

// Suponiendo que esta función se llame cuando se determina el ganador
function determineWinner() {
    if (enemy.health <= 0) {
        displayResult('Player Wins!');
        gameOver = true;
    } else if (player.health <= 0) {
        displayResult('Enemy Wins!');
        gameOver = true;
    } else if (enemy.health <= 0 && player.health <= 0) {
        displayResult('It\'s a Tie!');
        gameOver = true;
    }
}

let animationId; // Variable para almacenar el id de la animación

function animate() {
    if (gameOver) return; // Si el juego ha terminado, salir de la función
    animationId = window.requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Actualizar y dibujar al jugador y al enemigo
    player.update(enemy); // Pasar el enemigo para determinar la dirección
    enemy.update(player); // Pasar el jugador para determinar la dirección

    // Movimiento del jugador
    if (keys.a.pressed && player.position.x > 30 && lastKey === 'a') {
        player.velocity.x = -10;
    } else if (keys.d.pressed && player.position.x + player.width < canvas.width - 30 && lastKey === 'd') {
        player.velocity.x = 10;
    } else {
        player.velocity.x = 0;
    }

    // Movimiento del enemigo
    if (keys.ArrowLeft.pressed && enemy.position.x > 30 && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -10;
    } else if (keys.ArrowRight.pressed && enemy.position.x + enemy.width < canvas.width - 30 && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 10;
    } else {
        enemy.velocity.x = 0;
    }

    // Colisión del jugador atacando al enemigo
    if (
        rectangularcollision({
            rectangle1: player,
            rectangle2: enemy
        }) && player.isAttacking
    ) {
        player.isAttacking = false;
        enemy.health -= 20;
        document.querySelector('#enemyHealth').style.width = enemy.health + '%';
        console.log('Player hit enemy');
        determineWinner(); // Verificar ganador después del golpe
    }

    // Colisión del enemigo atacando al jugador
    if (
        rectangularcollision({
            rectangle1: enemy,
            rectangle2: player
        }) && enemy.isAttacking
    ) {
        enemy.isAttacking = false;
        player.health -= 20;
        document.querySelector('#playerHealth').style.width = player.health + '%';
        console.log('enemy hit player');
        determineWinner(); // Verificar ganador después del golpe
    }
}

animate();

// Movimiento
window.addEventListener('keydown', (event) => {
    if (gameOver) return; // No permitir movimiento si el juego ha terminado

    switch (event.key) {
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd';
            break;
        case 'a':
            keys.a.pressed = true;
            lastKey = 'a';
            break;
        case 'w':
            if (player.isOnGround) {
                player.velocity.y = -20;
                player.isOnGround = false;
            }
            break;
        case 'g':
            player.attack();
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            enemy.lastKey = 'ArrowRight';
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            enemy.lastKey = 'ArrowLeft';
            break;
        case 'ArrowUp':
            if (enemy.isOnGround) {
                enemy.velocity.y = -20;
                enemy.isOnGround = false;
            }
            break;
        case ',':
            enemy.attack();
            break;
    }
});

window.addEventListener('keyup', (event) => {
    if (gameOver) return; // No permitir movimiento si el juego ha terminado

    switch (event.key) {
        case 'd':
            keys.d.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
    }
    switch (event.key) {
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
    }
});
