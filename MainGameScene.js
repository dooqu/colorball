
var BALL_ANIM_FRAMES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90,
    1, 11, 21, 31, 41, 51, 61, 71, 81, 91,
    2, 3, 4, 5, 6, 7, 8, 9,
    12, 22, 32, 42, 52, 62, 72, 82,
    13, 14, 15, 16, 17, 18, 19,
    23, 33, 43, 53, 63, 73, 83,
    24, 25, 26, 27, 28, 29,
    34, 44, 54, 64, 74, 84,
    35, 36, 37, 38, 39,
    45, 55, 65, 75, 85,
    46, 47, 48, 49,
    56, 66, 76, 86,
    57, 58, 59,
    67, 77, 87,
    68, 69,
    78, 88,
    79, 89
];

var keyPathPointsMap0 = [{ x: 329, y: -24 }, { x: 331, y: 13 }, { x: 344, y: 33 }, { x: 359, y: 68 }, { x: 389, y: 110 }, { x: 407, y: 142 }, { x: 423, y: 171 }, { x: 438, y: 208 }, { x: 457, y: 256 }, { x: 476, y: 315 }, { x: 481, y: 354 }, { x: 472, y: 390 }, { x: 454, y: 392 }, { x: 408, y: 376 }, { x: 368, y: 362 }, { x: 310, y: 358 }, { x: 275, y: 363 }, { x: 235, y: 386 }, { x: 210, y: 417 }, { x: 212, y: 441 }, { x: 233, y: 468 }, { x: 289, y: 465 }, { x: 360, y: 456 }, { x: 444, y: 461 }, { x: 494, y: 480 }, { x: 523, y: 514 }, { x: 533, y: 562 }, { x: 530, y: 601 }, { x: 514, y: 635 }, { x: 491, y: 653 }, { x: 465, y: 661 }, { x: 434, y: 662 }, { x: 375, y: 655 }, { x: 333, y: 620 }, { x: 303, y: 592 }, { x: 274, y: 573 }, { x: 246, y: 569 }, { x: 222, y: 574 }, { x: 204, y: 595 }, { x: 197, y: 636 }, { x: 200, y: 675 }, { x: 201, y: 721 }, { x: 205, y: 772 }, { x: 210, y: 800 }, { x: 213, y: 823 }, { x: 233, y: 872 }, { x: 283, y: 889 }, { x: 345, y: 891 }, { x: 391, y: 890 }, { x: 453, y: 880 }, { x: 509, y: 849 }, { x: 514, y: 800 }, { x: 483, y: 742 }, { x: 406, y: 719 }, { x: 366, y: 706 }, { x: 315, y: 683 }, { x: 286, y: 685 }, { x: 275, y: 717 }, { x: 270, y: 736 }]

var MainGameScene = new Phaser.Class({
    Extends: Phaser.Scene,
    turret: null,
    ballGroup: null,
    lineBallManager: null,
    currentBomb : null,
    currentBall : null,
    isSurveyMode: false,
    frameIndex: 0,
    colliding : false,
    previousBall: null,
    nextBall : null,
    initialize: function MainGameScene() {
        Phaser.Scene.call(this, { key: 'MainGameScene' });
    },

    preload: function () {
        this.load.image("button", "checked.png");
        this.load.image("map", "map002.jpg");
        this.load.image("turret", "turreBody.png");
        this.load.spritesheet('blueballsheet', 'BlueBall.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('yellowballsheet', 'YellowBall.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('greenballsheet', 'GreenBall.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('purpleballsheet', 'PurpleBall.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('redballsheet', 'RedBall.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('whiteballsheet', 'WhitBall.png', { frameWidth: 48, frameHeight: 48 });
        this.load.image("bluetail", "blue_ball_tail.png");
        this.load.image("yellowtail", "yellow_ball_tail.png");
        this.load.image("greentail", "green_ball_tail.png");
        this.load.image("redtail", "red_ball_tail.png");
        this.load.image("purpletail", "purple_ball_tail.png");
        this.load.image("whitetail", "white_ball_tail.png");
    },

    create: function () {
        this.add.image(720 / 2, 1140 / 2, "map");
        this.anims.create({ key: "blueball", frames: this.anims.generateFrameNames("blueballsheet", { frames: BALL_ANIM_FRAMES }), frameRate: 30, repeat: -1 });
        this.anims.create({ key: "yellowball", frames: this.anims.generateFrameNames("yellowballsheet", { frames: BALL_ANIM_FRAMES }), frameRate: 30, repeat: -1 });
        this.anims.create({ key: "greenball", frames: this.anims.generateFrameNames("greenballsheet", { frames: BALL_ANIM_FRAMES }), frameRate: 30, repeat: -1 });
        this.anims.create({ key: "purpleball", frames: this.anims.generateFrameNames("purpleballsheet", { frames: BALL_ANIM_FRAMES }), frameRate: 30, repeat: -1 });
        this.anims.create({ key: "redball", frames: this.anims.generateFrameNames("redballsheet", { frames: BALL_ANIM_FRAMES }), frameRate: 30, repeat: -1 });
        this.anims.create({ key: "whiteball", frames: this.anims.generateFrameNames("whiteballsheet", { frames: BALL_ANIM_FRAMES }), frameRate: 30, repeat: -1 });

        this.ballGroup = new BallGroup(this);
        this.lineBallManager = new LineBallManager(this.ballGroup);
        this.turret = new Turret(this, 424, 553, this.ballGroup);
        this.add.existing(this.turret);
        this.input.on("pointerdown", function (event) {
            var ret = this.turret.turnToAndShot(event.x, event.y);
        }, this);
        this.lineBallManager.start(40, keyPathPointsMap0);
    },

    update: function (t, d) {
        this.frameIndex = ++this.frameIndex % 2;
        this.lineBallManager.update();
        this.turret.updateShottingBall();
        if(this.colliding == false) {

    
    
            if (this.turret.shotInfo.shotting) {
                console.log("isshotting")
                var currLinkBall = this.lineBallManager.linkHead;
                while(currLinkBall != null) {
                    if(Phaser.Math.Distance.Between(this.turret.shotInfo.shottingBall.x, this.turret.shotInfo.shottingBall.y, currLinkBall.x, currLinkBall.y) <= 46) {
                        this.colliding = true;
                        this.currLinkBall = currLinkBall;
                        this.currentBomb = this.turret.shotInfo.shottingBall
                        this.turret.shotInfo.shotting = false;
                        this.onBallCollide(this.turret.shotInfo.shottingBall, currLinkBall)
                        break;
                    }
                    currLinkBall = currLinkBall.next;
                }
            }
        }
        else {
            //this.onBallCollide(this.currentBomb, this.currLinkBall);
        }

    },

    onBallCollide : function (bomb, ball) {
        var moveFrontBall, moveBackBall;
        this.colliding = true;
        ball.play("whiteball");
        //当前这个ball对应的circle数据结构
        var ballCircle = new Phaser.Geom.Circle(ball.x, ball.y, 23);
        //circle运行方向对应的0~1角度
        var position1 = ((ball.angle < 0)? ball.angle + 360 : ball.angle) / 360;
        //circle运行反方向对应的0~1角度
        var position2 = (position1 <= 0.5)? position1 + 0.5 : position1 - 0.5;
        //circle运行方向对应的点
        var p1 = ballCircle.getPoint(position1);
        //circle运行反方向的点
        var p2 = ballCircle.getPoint(position2);
        //alert(ballCircle.x + ":" + ballCircle.y + "\n" + p1.x + ":" + p1.y + "\n" + p2.x + ":" + p2.y);
        //bomb到两个点的对应的距离
        var d1 = Phaser.Math.Distance.Between(bomb.x, bomb.y, p1.x, p1.y);
        var d2 = Phaser.Math.Distance.Between(bomb.x, bomb.y, p2.x, p2.y);

        if(d1 <= d2) {
            console.log("front");
            moveBackBall = ball;
            moveFrontBall = ball.previous;
        }
        else {
            moveFrontBall = ball;
            moveBackBall = ball.next;
        }
        var newLinkBallFromBomb = this.ballGroup.get(this.turret.shotInfo.shottingBall.getData("color"), this.turret.shotInfo.shottingBall.x, this.turret.shotInfo.shottingBall.y);
        this.turret.shotInfo.shottingBall.setActive(false).setVisible(false);
        this.turret.shotInfo.shottingTail.setActive(false).setVisible(false);
        this.lineBallManager.makeSpaceForNewBall(newLinkBallFromBomb, moveFrontBall, moveBackBall);
    }
});