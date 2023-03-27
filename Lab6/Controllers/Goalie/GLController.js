const {calcDistance, getAngleToTarget} = require("../../utils");
const {ActV} = require("../../constValues");

class GLController {
    constructor(agent) {
        this.agent = agent;
        this.controls = agent.controls;
        this.data = null;
        this.catched = false;
    }

    getAction(data) {
        this.data = data;
        let circle = this.getCircle();
        if (data.canCatch && !this.catched) {
            return this.catch()
        } else if (data.canKick || this.catched) {
            return this.kickToGates()
        } else {
            let atLeastOneNearer = false;
            for (let e of data.allies) {
                if (calcDistance(data.ball, e) < calcDistance(data.pos, data.ball)) {
                    atLeastOneNearer = true;
                    break;
                }
            }
            if (!atLeastOneNearer && calcDistance(data.pos, data.ball) < circle.r) {
                return this.getBall();
            } else {
                let ballcoo = this.data.ball;

                let coordToGo;
                let distance = calcDistance(circle, ballcoo);
                if (distance <= circle.ir) {
                    coordToGo = ballcoo;
                } else {
                    let offset = circle.ir * (ballcoo.x - circle.x) / distance;
                    let newx1 = circle.x - offset;
                    let newx2 = circle.x + offset;
                    let newy1 = (newx1 - circle.x) * (ballcoo.y - circle.y) / (ballcoo.x - circle.x) + circle.y;
                    let newy2 = (newx2 - circle.x) * (ballcoo.y - circle.y) / (ballcoo.x - circle.x) + circle.y;
                    if (calcDistance({x: newx1, y: newy1}, ballcoo) < calcDistance({x: newx2, y: newy2}, ballcoo))
                        coordToGo = {x: newx1, y: newy1}
                    else
                        coordToGo = {x: newx2, y: newy2}
                }
                if (calcDistance(data.pos, coordToGo) > ActV.DISTANCE_PRECISION) {
                    return this.moveToSpot(coordToGo)
                } else {
                    return this.controllBall();
                }
            }
        }
    }

    catch() {
        this.catched = true;
        let angle = getAngleToTarget(this.agent.environment, this.agent.environment.zeroVec, this.data.ball)
        return this.controls.Catch(-angle);
    }

    moveToSpot(spot) {
        let angle = getAngleToTarget(this.agent.environment, this.agent.environment.zeroVec, spot)
        if (Math.abs(angle) > ActV.ANGLE_PRECISION*2) {
            return this.controls.Turn(-angle);
        }
        return this.controls.Dash(ActV.RUN_SPEED)
    }

    controllBall() {
        let angle = getAngleToTarget(this.agent.environment, this.agent.environment.zeroVec, this.data.ball)
        return this.controls.Turn(-angle);
    }

    getBall() {
        let angle = getAngleToTarget(this.agent.environment, this.agent.environment.zeroVec, this.data.ball)
        if (Math.abs(angle) > ActV.ANGLE_PRECISION) {
            return this.controls.Turn(-angle);
        }
        if(calcDistance(this.data.pos, this.data.ball) < 5)
            return this.controls.Dash(ActV.MOVEMENT_SPEED)
        return this.controls.Dash(ActV.RUN_SPEED)
    }

    kickToGates() {
        this.catched = false;
        let angle = getAngleToTarget(this.agent.environment, this.agent.environment.zeroVec, this.data.enemyGates)
        return this.controls.KickWithAngle(ActV.KICK_FORCE, -angle);
    }

    getCircle() {
        let spot = {x: -55, y: 0, r: 10};
        spot.ir = spot.r * 2 / 3

        if (this.data.side === "r") {
            spot.x *= -1;
            spot.y *= -1;
        }
        return spot
    }
}

module.exports = GLController