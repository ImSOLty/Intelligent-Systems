const {calcDistance, getAngleToTarget} = require("../../utils");
const {ActV} = require("../../constValues");

class PLController {
    constructor(agent) {
        this.agent = agent;
        this.controls = agent.controls;
        this.data = null;
    }

    getActionForAttacker(data) {
        this.data = data;
        let circle = this.getCircle()
        if (data.canKick) {
            let indanger = calcDistance(data.pos, circle) > circle.r * 4 / 5;
            for (let e of data.enemies) {
                if (calcDistance(data.pos, e) <= ActV.ENEMY_DANGER_DISTANCE) {
                    indanger = true;
                    break;
                }
            }
            if (indanger) {
                return this.passSomeone()
            } else {
                return this.moveToGates()
            }
        } else {
            let atLeastOneNearer = false;
            for (let e of data.allies) {
                if (calcDistance(data.ball, e) < calcDistance(data.pos, data.ball)) {
                    atLeastOneNearer = true;
                    break;
                }
            }
            if (!atLeastOneNearer && calcDistance(data.pos, data.ball) < circle.r) {
                return this.moveToGates();
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

    getActionForDefender(data) {
        this.data = data
        let circle = this.getCircle()
        let atLeastOneNearer = false;
        for (let e of data.allies) {
            if (calcDistance(data.ball, e) < calcDistance(data.pos, data.ball)) {
                atLeastOneNearer = true;
                break;
            }
        }
        if (!atLeastOneNearer && calcDistance(data.pos, data.ball) < circle.r) {
            if (data.canKick) {
                return this.passSomeone()
            } else {
                return this.getBall();
            }
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

    passSomeone() {
        let where = null
        let min = calcDistance(this.data.enemyGates, this.data.pos);
        for (let e of this.data.allies) {
            let dist = calcDistance(this.data.enemyGates, e);
            if (dist < min) {
                where = e;
                min = dist;
                break;
            }
        }
        if (where == null) {
            return this.kickToGates()
        } else {
            return this.kickToPoint(where)
        }
    }


    getBall() {
        let angle = getAngleToTarget(this.agent.environment, this.agent.environment.zeroVec, this.data.ball)
        if (Math.abs(angle) > ActV.ANGLE_PRECISION) {
            return this.controls.Turn(-angle);
        }
        return this.controls.Dash(ActV.RUN_SPEED)
    }

    kickToGates() {
        let angle = getAngleToTarget(this.agent.environment, this.agent.environment.zeroVec, this.data.enemyGates)
        return this.controls.KickWithAngle(ActV.KICK_FORCE, -angle);
    }

    moveToGates() {
        if (this.data.canKick) {
            let angle = getAngleToTarget(this.agent.environment, this.agent.environment.zeroVec, this.data.enemyGates)
            if (Math.abs(angle) > ActV.ANGLE_PRECISION) {
                return () => {
                    this.controls.Turn(-angle);
                }
            }
            if (calcDistance(this.data.pos, this.data.enemyGates) > ActV.GOAL_DISTANCE)
                return this.controls.KickWithAngle(ActV.DRIBBLE_FORCE, -angle)
            else
                return this.controls.KickWithAngle(ActV.KICK_FORCE, -angle)
        } else {
            let angle = getAngleToTarget(this.agent.environment, this.agent.environment.zeroVec, this.data.ball)
            if (Math.abs(angle) > ActV.ANGLE_PRECISION) {
                return this.controls.Turn(-angle);
            }
            return this.controls.Dash(ActV.RUN_SPEED)
        }
    }

    moveToSpot(spot) {
        let angle = getAngleToTarget(this.agent.environment, this.agent.environment.zeroVec, spot)
        if (Math.abs(angle) > ActV.ANGLE_PRECISION*3) {
            return this.controls.Turn(-angle);
        }
        return this.controls.Dash(ActV.RUN_SPEED)
    }

    controllBall() {
        let angle = getAngleToTarget(this.agent.environment, this.agent.environment.zeroVec, this.data.ball)
        return this.controls.Turn(-angle);
    }

    kickToPoint(point) {
        let angle = getAngleToTarget(this.agent.environment, this.agent.environment.zeroVec, point)
        return this.controls.KickWithAngle(ActV.FORCE_PER_DISTANCE * calcDistance(this.data.pos, point), -angle);
    }


    getCircle() {
        const positions = {
            1: {x: 10, y: 0, r: 20},
            2: {x: 32, y: -15, r: 19},
            3: {x: 32, y: 15, r: 19},
            4: {x: -20, y: -18, r: 16},
            5: {x: -20, y: 18, r: 16},
            6: {x: 5, y: -20, r: 16},
            7: {x: 5, y: 20, r: 16},
            8: {x: -37, y: -20, r: 16},
            9: {x: -34, y: 0, r: 18},
            10: {x: -37, y: 20, r: 16},
        };
        let spot = positions[this.data.playerId];
        spot.ir = [4, 5, 8, 9, 10].includes(this.data.playerId) ? spot.r * 2 / 3 : spot.r * 2 / 3

        if (this.data.side === "r") {
            spot.x *= -1;
            spot.y *= -1;
        }
        return spot
    }
}

module.exports = PLController