// Espera a que se cargue el documento antes de ejecutar cualquier código
document.addEventListener('DOMContentLoaded', function () {
    initCanvas(); // Llama a la función initCanvas para iniciar el juego
});

function initCanvas() {
    // Obtiene una referencia al elemento canvas en el documento
    const canvas = document.getElementById('my_canvas');
    const ctx = canvas.getContext('2d'); // Obtiene el contexto 2D del canvas
    const cW = canvas.width; // Ancho del canvas
    const cH = canvas.height; // Alto del canvas

    // Carga las imágenes y sonidos del juego
    const backgroundImage = new Image();
    const naveImage = new Image(); // Imagen de la nave
    const enemiespic1 = new Image(); // Imagen del enemigo 1
    const shootAudio = new Audio('sounds/shoot.mp3'); // Sonido de disparo
    const scoreElement = document.querySelector('.barra'); // Elemento para mostrar la puntuación
    const gameTitle = document.querySelector('.game-title'); // Elemento para el título del juego
    const gameContainer = document.querySelector('.game-container'); // Contenedor principal del juego
    const levelElement = document.querySelector('.level'); // Elemento para mostrar el nivel actual

    // Establece las rutas de las imágenes y sonidos
    backgroundImage.src = 'images/background-pic.jpg'; // Imagen de fondo
    naveImage.src = 'images/spaceship-pic.png'; // Imagen de la nave
    enemiespic1.src = 'images/enemigo1.png'; // Imagen del enemigo 1

    let score = 0; // Puntuación del jugador
    let enemySpeed = 0.5; // Velocidad de movimiento de los enemigos
    let enemyCount = 5; // Cantidad inicial de enemigos
    let enemyLevel = 1; // Nivel actual del juego
    const enemies = []; // Arreglo para almacenar los enemigos

    // Función para crear enemigos
    function createEnemies() {
        enemies.length = 0; // Limpia la lista de enemigos antes de crear nuevos
        for (let i = 0; i < enemyCount; i++) {
            const x = Math.random() * (cW - 50); // Posición X aleatoria
            const y = Math.random() * (cH / 2) + 10; // Posición Y aleatoria (evita borde inferior)
            enemies.push({ x, y, w: 50, h: 30 }); // Agrega un enemigo al arreglo
        }
    }

    createEnemies(); // Llama a la función para crear enemigos

    // Función para renderizar los enemigos en el canvas
    function renderEnemies() {
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            ctx.drawImage(enemiespic1, enemy.x, enemy.y, enemy.w, enemy.h); // Dibuja el enemigo
            enemy.y += enemySpeed; // Mueve el enemigo hacia abajo

            // Si el enemigo pasa la parte inferior del canvas, reinícialo en la parte superior
            if (enemy.y > cH) {
                enemy.y = -30;
                enemy.x = Math.random() * (cW - 50);
            }

            // Comprueba si hay colisión entre la nave y el enemigo
            if (checkCollision(launcher, enemy)) {
                gameOver('You Died!'); // Termina el juego si hay colisión
                return;
            }
        }
    }

    // Clase Launcher para la nave del jugador
    function Launcher() {
        this.x = cW * 0.5 - 25; // Posición inicial X de la nave
        this.y = 500; // Posición inicial Y de la nave
        this.w = 100; // Ancho de la nave
        this.h = 100; // Alto de la nave
        this.direction = ''; // Dirección de movimiento
        this.color = 'yellow'; // Color de la nave
        this.missiles = []; // Arreglo para almacenar los misiles disparados por la nave
        this.gameOver = false; // Estado del juego (terminado o no)

        // Función para renderizar la nave y los misiles en el canvas
        this.render = function () {
            ctx.fillStyle = this.color;
            ctx.drawImage(backgroundImage, 10, 10); // Dibuja la imagen de fondo
            ctx.drawImage(naveImage, this.x, this.y, 100, 90); // Dibuja la nave

            for (let i = 0; i < this.missiles.length; i++) {
                const missile = this.missiles[i];
                ctx.fillRect(missile.x, missile.y -= 5, missile.w, missile.h); // Dibuja los misiles

                // Elimina los misiles que salen de la pantalla
                if (missile.y <= 0) {
                    this.missiles.splice(i, 1);
                    i--;
                }

                // Comprueba si hay colisión entre un misil y un enemigo
                for (let j = 0; j < enemies.length; j++) {
                    const enemy = enemies[j];
                    if (checkCollision(missile, enemy)) {
                        this.missiles.splice(i, 1); // Elimina el misil
                        i--;

                        enemies.splice(j, 1); // Elimina el enemigo
                        j--;

                        score++; // Incrementa la puntuación
                        scoreElement.innerHTML = 'Destroyed: ' + score; // Actualiza la puntuación

                        // Si no quedan enemigos, pasa al siguiente nivel
                        if (enemies.length === 0) {
                            levelElement.innerHTML = 'Level: ' + enemyLevel;
                            increaseDifficulty(); // Aumenta la dificultad
                        }
                    }
                }
            }
        };

        // Función para disparar un misil
        this.shoot = function () {
            shootAudio.play();
            this.missiles.push({ x: this.x + this.w * 0.5, y: this.y, w: 3, h: 10 });
        };

        // Funciones para mover la nave en diferentes direcciones
        this.moveLeft = function () {
            this.direction = 'left';
            if (this.x > 10) {
                this.x -= 10; // Aumenta la velocidad de movimiento a 10
            }
        };

        this.moveRight = function () {
            this.direction = 'right';
            if (this.x < cW - 110) {
                this.x += 10; // Aumenta la velocidad de movimiento a 10
            }
        };

        this.moveUp = function () {
            this.direction = 'up';
            if (this.y > 10) {
                this.y -= 10; // Aumenta la velocidad de movimiento a 10
            }
        };

        this.moveDown = function () {
            this.direction = 'down';
            if (this.y < cH - 110) {
                this.y += 10; // Aumenta la velocidad de movimiento a 10
            }
        };
    }

    const launcher = new Launcher(); // Crea una instancia de la nave del jugador

    // Función principal de animación del juego
    function animate() {
        ctx.clearRect(0, 0, cW, cH); // Limpia el canvas
        launcher.render(); // Renderiza la nave y los misiles
        renderEnemies(); // Renderiza los enemigos

        // Comprueba si algún enemigo llega al límite inferior del canvas
        for (let i = 0; i < enemies.length; i++) {
            if (enemies[i].y > cH) {
                gameOver('You Lost!'); // Termina el juego si un enemigo llega al límite inferior
                return;
            }
        }

        // Comprueba si los enemigos han superado completamente a la nave en el eje Y
        for (let i = 0; i < enemies.length; i++) {
            if (enemies[i].y + enemies[i].h > launcher.y) {
                gameOver('You Lost!'); // Termina el juego si un enemigo supera a la nave
                return;
            }
        }

        // Comprueba si no hay enemigos restantes para pasar al siguiente nivel
        if (enemies.length === 0) {
            increaseDifficulty(); // Aumenta la dificultad
        }

        if (!launcher.gameOver) {
            requestAnimationFrame(animate); // Continúa la animación si el juego no ha terminado
        }
    }

    // Función para comprobar colisiones entre dos objetos
    function checkCollision(objA, objB) {
        return (
            objA.x < objB.x + objB.w &&
            objA.x + objA.w > objB.x &&
            objA.y < objB.y + objB.h &&
            objA.y + objA.h > objB.y
        );
    }

    // Función para finalizar el juego
    function gameOver(message) {
        launcher.gameOver = true;
        launcher.color = 'red'; // Cambia el color de la nave a rojo
        launcher.direction = '';
        launcher.missiles = [];
        gameTitle.innerHTML = message; // Muestra un mensaje de juego terminado
    }

    // Función para aumentar la dificultad del juego
    function increaseDifficulty() {
        enemySpeed += 0.1; // Aumenta la velocidad de los enemigos
        enemyCount += 2; // Añade más enemigos
        enemyLevel++; // Aumenta el nivel actual
        levelElement.innerHTML = 'Level: ' + enemyLevel; // Actualiza el elemento del nivel
        createEnemies(); // Crea nuevos enemigos al subir de nivel
    }

    // Event listeners para los controles de teclado
    document.addEventListener('keydown', function (event) {
        if (!launcher.gameOver) {
            if (event.keyCode === 37 || event.keyCode === 65) {
                launcher.moveLeft();
            } else if (event.keyCode === 39 || event.keyCode === 68) {
                launcher.moveRight();
            } else if (event.keyCode === 32 || event.keyCode === 87) {
                launcher.shoot();
            } else if (event.keyCode === 38 || event.keyCode === 87) {
                launcher.shoot();
            } else if (event.keyCode === 83) {
                launcher.moveDown();
            }
        }
    });

    // Event listeners para los controles de botones
    const left_btn = document.getElementById('left_btn');
    const right_btn = document.getElementById('right_btn');
    const fire_btn = document.getElementById('fire_btn');
    const reload_btn = document.getElementById('reload_btn');

    left_btn.addEventListener('mousedown', function (event) {
        launcher.moveLeft();
    });

    left_btn.addEventListener('mouseup', function (event) {
        launcher.direction = '';
    });

    right_btn.addEventListener('mousedown', function (event) {
        launcher.moveRight();
    });

    right_btn.addEventListener('mouseup', function (event) {
        launcher.direction = '';
    });

    fire_btn.addEventListener('mousedown', function (event) {
        launcher.shoot();
    });

    // Event listener para reiniciar el juego
    reload_btn.addEventListener('click', function (event) {
        window.location.reload(); // Recarga la página para reiniciar el juego
    });

    // Inicia la animación del juego cuando se carga la página
    window.addEventListener('load', function (event) {
        animate();
    });
}
