const {calcNormalVec, calcDistance} = require("./utils");
const Actions = require("./ActionsType")
const Flags = require("./constValues")

const ANGLE_PRECISION = 15 // If greater angle to target - turn
const DISTANCE_PRECISION = 0.5 // If greater - move
const SEARCH_ANGLE = 90
const MOVEMENT_SPEED = 100
const DRIBBLE_FORCE = 25
const KICK_FORCE = 150
const GOAL_DISTANCE = 30

class Controls {
    constructor(agent) {
        this.agent = agent
        this.env = agent.environment;
        this.type = [];
    }

    calculateAction() {
        let action
        do {
            action = () => {
            }

            //If possible, make a goal
            if (this.nearBall()) {
                let flag = this.agent.side === "r" ? Flags.gl : Flags.gr;
                if (calcDistance(this.env, flag) <= GOAL_DISTANCE) {
                    let angle = this.getAngleToTarget(this.env, this.env.zeroVec, flag)
                    action = () => {
                        this.KickWithAngle(KICK_FORCE, -angle)
                    }
                    break;
                }
            }

            if (this.type.length === 0) {
                return action
            }

            switch (this.type[0].name) {
                case "GOTO":
                    action = this.goto(this.type[0]);
                    break;
                case "FOLLOW":
                case "REACH":
                    action = this.follow(this.type[0]);
                    break;
            }
        } while (action == null)
        return action;
    }

    goto(ex) {
        let distance = calcDistance(this.env, ex.target);

        let angle = this.getAngleToTarget(this.env, this.env.zeroVec, ex.target)

        if (distance <= DISTANCE_PRECISION && ex.name !== "FOLLOW") {
            this.type.shift()
            return null
        }

        if (ex.withBall !== null && ex.withBall) {
            if (distance > DISTANCE_PRECISION * 6) {
                if (this.nearBall()) {
                    return () => {
                        this.KickWithAngle(DRIBBLE_FORCE, -angle)
                    }
                } else {
                    this.type.unshift(new Actions.REACHFOLLOW("ball", false, false))
                    return null
                }
            } else {
                this.type.shift();
                return null
            }
        }

        if (Math.abs(angle) > ANGLE_PRECISION) {
            return () => {
                this.Turn(-angle);
            }
        }
        if (distance > DISTANCE_PRECISION) {
            return () => {
                this.Dash(MOVEMENT_SPEED);
            }
        }
        return () => {
        }
    }

    follow(ex) {
        let targetObj = this.env.objects.find(el => ex.equals(el));
        if (targetObj == null) {
            return () => {
                this.Turn(SEARCH_ANGLE);
            }
        }
        ex.target = {x: targetObj.x, y: targetObj.y}
        return this.goto(ex)
    }

    nearBall() {
        let targetObj = this.env.objects.find(el => el.type === "ball");
        if (targetObj == null) {
            return false
        }
        let distance = calcDistance(this.env, targetObj);
        if (distance > DISTANCE_PRECISION) {
            return false
        }
        return true
    }

    getAngleToTarget(pos, pDir, targetPos) {
        let vec = calcNormalVec(pos, targetPos);
        let angle = (-Math.atan2(vec.y, vec.x) - Math.atan2(pDir.y, pDir.x)) * 180 / Math.PI;
        if (angle > 180) angle -= 360
        if (angle < -180) angle += 360
        return angle;
    }


    Move(x, y) {
        this.agent.bridge.socketSend("move", `${x} ${y}`)
    }

    Dash(value) {
        this.agent.bridge.socketSend("dash", `${value}`)
    }

    Turn(angle) {
        this.agent.bridge.socketSend("turn", `${angle}`)
    }

    Say(msg) {
        this.agent.bridge.socketSend("say", `${msg}`)
    }

    Catch(value) {
        this.agent.bridge.socketSend("catch", `${value}`)
    }

    KickWithAngle(value, angle) {
        this.agent.bridge.socketSend("kick", `${value} ${angle}`)
    }

    PushGOTO(targetPos, withBall) {
        this.type.push(new Actions.GOTO(targetPos, withBall))
    }

    PushFOLLOWPlayer(teamName, id) {
        this.type.push(new Actions.REACHFOLLOW("player", true, teamName, id))
    }

    PushFOLLOWBall() {
        this.type.push(new Actions.REACHFOLLOW("ball", true))
    }

    PushREACHPlayer(teamName, id) {
        this.type.push(new Actions.REACHFOLLOW("player", false, teamName, id))
    }

    PushREACHBall() {
        this.type.push(new Actions.REACHFOLLOW("ball", false))
    }

    PushSTOP() {
        if (this.type.length !== 0)
            this.type.shift()
    }

    PushCLEAR() {
        this.type = []
    }
}

module.exports = Controls;