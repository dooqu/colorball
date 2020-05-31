function LinkedBall() {
    this.headBall = null;
    this.rearBall = null;
    this.previous = null;
    this.next = null;

    this.add = function(ball) {
        if(this.headBall == null) {
            this.headBall = ball;
        }

        if(this.rearBall == null) {
            this.rearBall = ball;
        }
        else {
            this.rearBall.next = ball;
            ball.previous = this.rearBall;
            this.rearBall = ball;
        }
    }
}