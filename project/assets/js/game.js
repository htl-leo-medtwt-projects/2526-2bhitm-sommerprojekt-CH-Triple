const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    parent: 'game-container',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 } }
    },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('bedroom', 'assets/sprites/bedroom.jpg');
    this.load.image('hallway', 'assets/sprites/hallway.jpg'); 
    this.load.image('child_s1', 'assets/sprites/crying_child_s1.png');
    this.load.image('child_s2', 'assets/sprites/crying_child_s2.png');
    this.load.image('child_s0', 'assets/sprites/crying_child_s0.png');
}

function create(data) {
    let lvl = data.level || 1;
    this.isTransitioning = false;

    if (lvl === 1) {
        this.add.image(400, 300, 'bedroom');
    } else if (lvl === 2) {
        this.add.image(400, 300, 'hallway');
    }

    this.walls = this.physics.add.staticGroup();
    this.door = this.physics.add.staticGroup();

    if (lvl === 1) {
        this.walls.add(this.add.rectangle(161, 130, 260, 5, 0xffff00).setVisible(false));
        this.walls.add(this.add.rectangle(633, 130, 260, 5, 0xffff00).setVisible(false));
        this.walls.add(this.add.rectangle(45, 300, 5, 300, 0xffff00).setVisible(false));
        this.walls.add(this.add.rectangle(745, 300, 5, 300, 0xffff00).setVisible(false));
        this.walls.add(this.add.rectangle(360, 480, 960, 5, 0xffff00).setVisible(false));
        this.walls.add(this.add.rectangle(660, 230, 125, 225, 0xffff00).setVisible(false));
        this.walls.add(this.add.rectangle(112, 230, 100, 75, 0xffff00).setVisible(false));

        this.door.add(this.add.rectangle(400, 125, 225, 15, 0xffffff));
        let mainDoor = this.add.rectangle(400, 10, 225, 15, 0xffff00);
        this.physics.add.existing(mainDoor, true);
        mainDoor.name = "bedroom_out";
        this.door.add(mainDoor);

        this.player = this.physics.add.sprite(400, 300, 'child_s1');
        
    } else if (lvl === 2) {
        this.player = this.physics.add.sprite(400, 500, 'child_s1');
        
        let backDoor = this.add.rectangle(400, 550, 225, 15, 0xffff00);
        this.physics.add.existing(backDoor, true);
        backDoor.name = "hallway_back";
        this.door.add(backDoor);
    }

    this.player.setScale(0.25);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.walls);

    this.physics.add.overlap(this.player, this.door, (player, doorObj) => {
        if (this.isTransitioning) return;

        if (doorObj.name === "bedroom_out") {
            this.isTransitioning = true;
            this.scene.restart({ level: 2 });
        } else if (doorObj.name === "hallway_back") {
            this.isTransitioning = true;
            this.scene.restart({ level: 1 });
        }
    });

    if (!this.anims.exists('idle')) {
        this.anims.create({
            key: 'idle',
            frames: [ { key: 'child_s0' } ],
            frameRate: 1, 
            repeat: -1
        });

        this.anims.create({
            key: 'walk',
            frames: [ { key: 'child_s1' }, { key: 'child_s2' } ],
            frameRate: 4, 
            repeat: -1
        });
    }

    this.player.play('idle');

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1.5);
    this.cameras.main.setBounds(0, 0, 800, 600);
}

function update() {
    const speed = 150;
    this.player.setVelocity(0);
    
    let isMoving = false;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
        this.player.setVelocityX(-speed);
        this.player.setFlipX(true);
        isMoving = true;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
        this.player.setVelocityX(speed);
        this.player.setFlipX(false);
        isMoving = true;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
        this.player.setVelocityY(-speed);
        isMoving = true;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
        this.player.setVelocityY(speed);
        isMoving = true;
    }

    if (isMoving) {
        this.player.anims.play('walk', true);
    } else {
        this.player.anims.play('idle', true);
    }
}