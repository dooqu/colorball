var BALL_SHOT_STEP_DIST = 12;

var Turret = new Phaser.Class({
    Extends: Phaser.GameObjects.Container,
    scene: null,
    bombBalls: [],
    colorAnims: [],
    bombShotting: null,
    ballGroup: null,
    body: null,

    shotInfo: {
        destX: 0,
        destY: 0,
        srcX: 0,
        srcY: 0,
        angle: 0,
        stepDistance: 0,
        stepCount: 0,
        distance: 0,
        shotting: false,
        shottingBall: null,
        shottingTail: null,
    },

    initialize: function Turret(scene, x, y, ballGroup) {
        Phaser.GameObjects.Container.call(this, scene, x, y);
        this.scene = scene;
        //this.ballGroup = ballGroup;
        this.body = this.scene.add.image(0, 0, "turret");
        this.shotInfo.shottingTail = this.scene.add.image(0, 0, "bluetail").setActive(false).setVisible(false).setOrigin(1, 0.5);
        this.shotInfo.shottingBall = this.scene.add.sprite(0, 0, "blueballsheet", 0).setVisible(false).setActive(false);

        for (var i = 0; i < 3; i++) {
            var color = Utils.randomColorBall();
            var ball = scene.add.sprite(0, 0, color + "ballsheet", 0);
            ball.play(color + "ball", false, Phaser.Math.Between(0, 89));
            this.add(ball);
            this.bombBalls.push(ball);
            this.colorAnims.push(color);
        }

        this.bombBalls[0].x = 52;
        this.bombBalls[1].x = 0;
        this.bombBalls[2].x = -29;
        this.add(this.body);

        this.setAngle(-90)
            .setSize(this.body.width, this.body.height)
            .setInteractive()
            .on("pointerdown", function (event) {
                this.circulate();
                event.stopPropagation();
            }, this);
    },


    update: function (arg) {
        console.log("turret.update()");
    },

    circulate: function () {
        this.colorAnims.push(this.colorAnims.shift());
        for (var i = 0; i < 3; i++) {
            this.bombBalls[i].play(this.colorAnims[i] + "ball", false, Phaser.Math.Between(0, 89));
        }
    },

    turnToAndShot: function (destX, destY) {
        //计算角度
        var rotateAngle = Utils.reckonAngle(this.x, this.y, destX, destY);
        this.setAngle(rotateAngle);
        if (this.shotInfo.shotting == false) {
            var rotatePos = Phaser.Math.RotateAround({ x: this.x + 52, y: this.y }, this.x, this.y, Phaser.Math.DegToRad(rotateAngle));
            this.shotInfo.destX = destX;
            this.shotInfo.destY = destY;
            this.shotInfo.srcX = rotatePos.x;
            this.shotInfo.srcY = rotatePos.y;
            this.shotInfo.angle = rotateAngle;
            this.shotInfo.distance = Math.sqrt(Math.pow(destY - this.shotInfo.srcY, 2) + Math.pow(destX - this.shotInfo.srcX, 2));
            var shotColor = this.colorAnims.shift();
            this.colorAnims.push(Utils.randomColorBall());
            for (var i = 0; i < 3; i++) {
                this.bombBalls[i].play(this.colorAnims[i] + "ball", false, Phaser.Math.Between(0, 89));
            }
            //this.shotInfo.shottingBall = this.ballGroup.get(shotColor, rotatePos.x, rotatePos.y);
            this.shotInfo.shottingBall.setTexture(shotColor + "ballsheet")
                .setAngle(rotateAngle)
                .setVisible(true)
                .setActive(true)
                .setDepth(this.depth + 1)
                .setX(rotatePos.x)
                .setY(rotatePos.y)
                .setData("color", shotColor);
            this.shotInfo.shottingTail.setActive(true)
                .setVisible(true)
                .setTexture(shotColor+"tail")
                .setAngle(rotateAngle)
                .setOrigin(1, 0.5);
            this.shotInfo.shotting = true;

            return shotColor;
        }
        return null;
    },

    isShotting : function() {
        return this.shotInfo.shotting;
    },

    updateShottingBall: function () {
        var si = this.shotInfo;
        if (si.shotting) {
            si.stepCount++;
            var totalSlopeDist = si.stepCount * BALL_SHOT_STEP_DIST;
            var newStepX = totalSlopeDist * Math.abs(si.destX - si.srcX) / si.distance;
            var newStepY = totalSlopeDist * Math.abs(si.destY - si.srcY) / si.distance;
            var nextX, nextY;

            if (si.destX < si.srcX) {
                //turret.bombShotting.x = (turret.x - newStepX);
                nextX = (si.srcX - newStepX);
            }
            else if (si.destX > si.srcX) {
                //turret.bombShotting.x = (turret.x + newStepX);
                nextX = (si.srcX + newStepX);
            }

            if (si.destY < si.srcY) {
                //turret.bombShotting.y = (turret.y - newStepY);
                nextY = (si.srcY - newStepY);
            }
            else if (si.destY > si.srcY) {
                //turret.bombShotting.y = (turret.y + newStepY);
                nextY = (si.srcY + newStepY);
            }

            si.shottingBall.x = nextX;
            si.shottingBall.y = nextY;
            si.shottingTail.x = nextX;
            si.shottingTail.y = nextY;

            if (nextX < -24 || nextY < -24 || nextX > (720 + 24) || nextY > (1140 + 24)) {
                this.prepareNextBombBall();
            }
            //var rs = this.physics.overlap(this.ball1, this.ball2);
        }
    },

    prepareNextBombBall: function () {
        var si = this.shotInfo;
        si.shotting = false;
        //this.ballGroup.close(si.shottingBall);
        this.shotInfo.shottingTail.setVisible(false).setActive(false);
        si.stepCount = 0;
    }
});