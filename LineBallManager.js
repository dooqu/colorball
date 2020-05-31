var BALL_MOVE_STEP = 2;
var BALL_DIAMETER_IN_PIXEL = 46;
var BALL_DIAMETER_IN_PATH = BALL_DIAMETER_IN_PIXEL / BALL_MOVE_STEP;
var BALL_LINK_LENGTH = 5;

var LineBallManager = function (ballGroup) {
    this.pathPoints = null;
    //this.linkHead = null;
    //this.linkRear = null;
    this.linkHeadPosIndex = -1;
    this.linkedBall = null;
    this.pathCurve = null;
    this.ballGroup = ballGroup;
    this.moveFrontBall = null;
    this.moveBackBall = null;
    this.frontMoveStep = 0;
    this.backMoveStep = 0;
    this.state = 0;
    this.shottingBall = null;
    this.shottingBallDestPos = null;

    this.start = function (count, keyPathPoints) {
        this.linkedBall = new LinkedBall();
        this.pathCurve = new Phaser.Curves.Spline(keyPathPoints);
        this.pathPoints = this.pathCurve.getDistancePoints(2);
        this.linkHeadPosIndex = 0;
    }

    this.createBallLinked = function (x, y) {
        var ball = this.ballGroup.get(null, x, y);//.setCircle(24);
        /*
        if (this.linkHead == null) {
            this.linkHead = ball;
            console.log("linkHead=" + this.linkHead);
        }
        if (this.linkRear == null) {
            this.linkRear = ball;
            console.log("linkRear=" + this.linkRear);
        }
        else {
            this.linkRear.next = ball;
            ball.previous = this.linkRear;
            this.linkRear = ball;
            console.log("linkNode=" + ball);
        }
        */
       this.linkedBall.add(ball);
        return ball;
    }



    this.moveBall = function () {
        if (this.linkHeadPosIndex <= -1 || this.pathPoints == null) {
            return;
        }

        //path的最后一个索引并不是pathPoins的长度，要留出半个球的距离，方便目标球打击头球的而导致替换头球或者头球向前被挤出的计算空间，否则会出现数组索引的溢出
        //so，头球中心的最大位索引，是pathPoints.length - 球的单位直径
        if (this.linkHeadPosIndex >= (this.pathPoints.length - BALL_DIAMETER_IN_PATH)) {
            //如果当前头节点位置索引(linkHeadPosIndex)已经走到了最后一个格子;
            //那么处理头节点，并将头结点的指向向后移动，头节点重新指向
            var preHeadBall = this.linkedBall.headBall;
            this.linkedBall.headBall = preHeadBall.next;
            if (this.linkedBall.rearBall == preHeadBall) {
                this.linkedBall.rearBall = null;
            }
            this.ballGroup.close(preHeadBall);
            if (this.linkedBall.headBall == null) {
                //没有球了
                return;
            }
            this.linkHeadPosIndex = this.pathPoints.length - 2 * BALL_DIAMETER_IN_PATH;
        }
        var posIndex = this.linkHeadPosIndex;
        var currBall = this.linkedBall.headBall;
        var ballSize = 0
        //从头结点开始，依次处理链上的球体数据
        while (++ballSize <= BALL_LINK_LENGTH && posIndex >= 0) {
            var srcPosX, srcPosY, destPosX, destPosY;
            var ballPos = this.pathPoints[posIndex];

            if ((posIndex + 1) < this.pathPoints.length) {
                srcPosX = ballPos.x;
                srcPosY = ballPos.y;
                destPosX = this.pathPoints[posIndex + 1].x;
                destPosY = this.pathPoints[posIndex + 1].y;
            }
            else {
                srcPosX = this.pathPoints[posIndex - 1].x;
                srcPosY = this.pathPoints[posIndex - 1].y;
                destPosX = ballPos.x;
                destPosY = ballPos.y;
            }
            if (currBall == null) {
                currBall = this.createBallLinked(ballPos.x, ballPos.y);
            }
            currBall.setPosition(ballPos.x, ballPos.y).setAngle(Utils.reckonAngle(srcPosX, srcPosY, destPosX, destPosY));
            currBall.posIndex = posIndex;
            currBall = currBall.next;
            posIndex -= BALL_DIAMETER_IN_PATH;
        }
        if (this.linkHeadPosIndex < (this.pathPoints.length - BALL_DIAMETER_IN_PATH)) {
            ++this.linkHeadPosIndex;
        }
    }


    this.makeSpaceForNewBall = function (bombBall, moveFrontBall, moveBackBall) {
        this.moveFrontBall = moveFrontBall;
        this.moveBackBall = moveBackBall;

        if(this.moveBackBall != null && (parseInt(this.moveBackBall.posIndex) + parseInt(BALL_DIAMETER_IN_PATH / 2)) < this.pathPoints.length) {
            var destPos = this.pathPoints[(parseInt(this.moveBackBall.posIndex) + parseInt(BALL_DIAMETER_IN_PATH / 2))];
            this.shottingBallDestPos = destPos;
        }
        else if(this.moveFrontBall != null) {

        }
        this.shottingBall = bombBall;
        this.shottingBall.setPosition(this.shottingBallDestPos.x, this.shottingBallDestPos.y);
        //alert(this.shottingBall.getData("color"));
        this.shottingBall.play(this.shottingBall.getData("color") + "ball");
        this.state = 1;
    }

    this.moveSpace = function () {
        if (this.moveBackBall != null) {
            this.backMoveStep++;
            var currentBallBackMove = this.linkRear;
            do {
                var posIndex = currentBallBackMove.posIndex;
                if (posIndex > 0) {
                    console.log("back pos=" + posIndex);
                    var previousPos = this.pathPoints[posIndex - 1];
                    currentBallBackMove.setPosition(previousPos.x, previousPos.y);
                    currentBallBackMove.posIndex = posIndex - 1;
                }
                else {
                    //被挤出屏幕的起点
                    currentBallBackMove.setPosition(-100, -100);
                    currentBallBackMove.posIndex = -1;
                }
                if (currentBallBackMove == this.moveBackBall) {
                    break;
                }
                currentBallBackMove = currentBallBackMove.previous;
            }
            while (currentBallBackMove != null);
        }


        if (this.moveFrontBall != null) {
            this.frontMoveStep++;
            var currentBallFrontMove = this.linkHead;
            do {
                var posIndex = currentBallFrontMove.posIndex;
                if (posIndex < (this.pathPoints.length - 1)) {
                    console.log("front pos=" + posIndex);
                    var nextPos = this.pathPoints[posIndex + 1];
                    currentBallFrontMove.setPosition(nextPos.x, nextPos.y);
                    currentBallFrontMove.posIndex = posIndex + 1;
                }
                else {
                    //被挤进洞
                }
                if (currentBallFrontMove == this.moveFrontBall) {
                    break;
                }
                currentBallFrontMove = currentBallFrontMove.next;
            }
            while (currentBallFrontMove != null);
        }

        if (this.backMoveStep >= 11 || this.frontMoveStep >= 11) {
            console.log("position ok;back=" + this.backMoveStep + ";front=" + this.frontMoveStep)
            this.state = 3;
        }

    }

    this.update = function () {
        switch (this.state) {
            case 0:
                this.moveBall();
                break;

            case 1:
                this.moveSpace();
                break;
        }
    };
}
