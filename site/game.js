const config = {
    type: Phaser.AUTO,
    width: 450,
    height: 900,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);

let bird;
let pipes;
let ground;

let gameStarted = false;
let gameOver = false;

let score = 0;
let scoreText;

let startText;
let restartText;

let pipeSpeed = 150; 
let pipeGap = 180;
const MAX_PIPE_SPEED = 350; 
const MIN_PIPE_GAP = 80; 

function preload() {
    this.load.image('background1', 'assets/background1.png');
    this.load.image('bird', 'assets/bird.png');
    this.load.image('pipe', 'assets/pipe.png');
    this.load.image('ground', 'assets/base.png');
}

function create() {

    gameStarted = false;
    gameOver = false;
    score = 0;
    pipeSpeed = 150;
    pipeGap = 180;

    this.add.image(200, 300, 'background1');

    pipes = this.physics.add.group();
    pipes.setDepth(0);

    bird = this.physics.add.sprite(100, 450, 'bird');

    bird.setScale(0.12);
    bird.body.allowGravity = false;
    bird.setDepth(3);

    ground = this.physics.add.staticImage(225, 860, 'ground');

    ground.setScale(1.4, 2);
    ground.refreshBody();
    ground.setDepth(2);

    scoreText = this.add.text(20, 20, 'Score: 0', {
        fontSize: '32px',
        fill: '#ffffff'
    });

    scoreText.setDepth(4);

    startText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 100, 'НАЧАТЬ ИГРУ', {
        fontSize: '36px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: {
            x: 15,
            y: 10
        }
    });
    startText.setOrigin(0.5);

    startText.setInteractive();
    startText.setDepth(5);

    startText.on('pointerdown', () => {
        startGame.call(this);
    });

    this.physics.add.collider(bird, ground, endGame, null, this);
    this.physics.add.collider(bird, pipes, endGame, null, this);

    this.input.removeAllListeners();

    this.input.on('pointerdown', () => {

        if (!gameStarted || gameOver) {
            return;
        }

        flap();
    });
}

function update() {
    if (!gameStarted || gameOver) return;

    if (bird.y < 0 || bird.y > this.scale.height) {
        endGame.call(this);
        return;  
    }

    pipes.getChildren().forEach(pipe => {
        if (pipe.x < -100) {
            pipe.destroy();
            return;
        }

        if (!pipe.scored && pipe.texture.key === 'pipe' && pipe.flipY) {
            if (pipe.x < bird.x) {
                pipe.scored = true;
                score++;
                scoreText.setText('Score: ' + score);
                increaseDifficulty();
            }
        }
    });
}

function startGame() {

    gameStarted = true;

    bird.body.allowGravity = true;

    startText.destroy();

    this.time.addEvent({
        delay: 1800,
        callback: addPipes,
        callbackScope: this,
        loop: true
    });
}

function flap() {

    bird.setVelocityY(-300);
}
function addPipes() {
    if (gameOver) return;

    const gap = pipeGap;                  
    const pipeHeight = 618;                 
    const gapY = Phaser.Math.Between(350, 650);
    const pipeX = this.scale.width + 100;
    
    const topPipe = pipes.create(pipeX, gapY - gap/2 - pipeHeight/2, 'pipe');
    topPipe.setFlipY(true);
    topPipe.body.allowGravity = false;
    topPipe.setVelocityX(-pipeSpeed);     
    topPipe.scored = false;

    const bottomPipe = pipes.create(pipeX, gapY + gap/2 + pipeHeight/2, 'pipe');
    bottomPipe.body.allowGravity = false;
    bottomPipe.setVelocityX(-pipeSpeed); 
    bottomPipe.scored = false;
}

function endGame() {

    if (gameOver) {
        return;
    }

    gameOver = true;

    this.physics.pause();

    bird.setTint(0xff0000);

    restartText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 120, 'НОВАЯ ИГРА', {
        fontSize: '32px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: {
            x: 15,
            y: 10
        }
    });
    restartText.setOrigin(0.5);

    restartText.setInteractive();
    restartText.setDepth(5);

    restartText.on('pointerdown', () => {
        this.scene.restart();
    });

    
}

function increaseDifficulty() {
    if (pipeSpeed < MAX_PIPE_SPEED) {
        pipeSpeed += 0.5;
        if (pipeSpeed > MAX_PIPE_SPEED) pipeSpeed = MAX_PIPE_SPEED;
    }
    
    if (pipeGap > MIN_PIPE_GAP) {
        pipeGap -= 0.3;
        if (pipeGap < MIN_PIPE_GAP) pipeGap = MIN_PIPE_GAP;
    }
}