var Utils = {
	ballColors: ["blue", "yellow", "green", "red", "purple", "white"],
	reckonAngle: function (srcX, srcY, destX, destY) {
		var radian = Phaser.Math.Angle.Between(srcX, srcY, destX, destY);
		return Phaser.Math.RadToDeg(radian);
	},

	randomColorBall: function () {
		return this.ballColors[Phaser.Math.Between(0, this.ballColors.length - 1)];
	}
};
