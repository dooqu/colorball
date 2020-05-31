function BallGroup(scene) {
    this.scene = scene;
    this.group = scene.add.group();
    this.colorArray = ["blue", "yellow", "green", "purple", "red", "white"];
    this.randColor = function () {
        return this.colorArray[Phaser.Math.Between(0, this.colorArray.length - 1)];
    }
    this.get = function (color, x, y) {
        var randPos = Phaser.Math.Between(0, 89);
        var ball = this.group.get(x, y, (color ? color + "ballsheet" : color), randPos);
        if (ball != null) {
            ball.setData("color", color);
            ball.play(color ? color + "ball" : this.randColor() + "ball", false, randPos);
        }
        return ball;
    }


    this.close = function (ball) {
        this.group.killAndHide(ball);
    }
}