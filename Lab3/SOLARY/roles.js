const {calcDistance, getAngleToTarget} = require("./utils");
const Flags = require("./constValues");

const ANGLE_PRECISION = 15 // If greater angle to target - turn
const DISTANCE_PRECISION = 0.5 // If greater - move
const SEARCH_ANGLE = 90
const MOVEMENT_SPEED = 100
const RUN_SPEED = 250
const DRIBBLE_FORCE = 25
const KICK_FORCE = 100
const GOAL_DISTANCE = 25

class Role {
    constructor(agent) {
        this.state = "none"
        this.agent = agent
        this.controls = this.agent.controls
        this.env = this.agent.environment
    }

    update() {
        this.updateState()
        //console.log(this.agent.role + " " + this.state)
        return this.updateAction()
    }

    updateState() {
    }

    updateAction() {
    }

    goto(target, speed, withBall = false) {
        let distance = calcDistance(this.env, target);
        let angle = getAngleToTarget(this.env, this.env.zeroVec, target)

        if (withBall) {
            return () => {
                this.controls.KickWithAngle(DRIBBLE_FORCE, -angle)
            }
        }

        if (Math.abs(angle) > ANGLE_PRECISION) {
            return () => {
                this.controls.Turn(-angle);
            }
        }
        if (distance > DISTANCE_PRECISION) {
            return () => {
                this.controls.Dash(speed);
            }
        }
        return () => {

        }
    }
}

class Goalie extends Role {
    constructor(agent) {
        super(agent);
        this.name = "goalie"
        this.previousAction = null;
        this.previousBall = null;
        this.ball = null;
        this.state = "root";
        this.action = null;
        this.pointInGates = {x: -51, y: 0};
        this.catched = false;
        this.posAccordingly = null;
    }

    updateState() {
        this.action = null
        let tmpBall = this.env.objects.find(el => el.type === "ball");
        if (tmpBall != null) {
            this.previousBall = this.ball != null ? this.ball : this.previousBall;
            this.ball = this.env.objects.find(el => el.type === "ball");
        }
        while (this.action == null) {
            switch (this.state) {
                case "root":
                    if (this.catched)
                        this.action = "kick"
                    else
                        this.state = "calcBall"
                    break
                case "calcBall":
                    if (this.ball != null)
                        this.state = "checkBall"
                    else
                        this.action = "findBall"
                    break;
                case "checkBall":
                    if (calcDistance(this.env, this.ball) <= DISTANCE_PRECISION * 16)
                        this.state = "smallDistance"
                    else
                        this.state = "bigDistance"
                    break
                case "smallDistance":
                    if (calcDistance(this.env, this.ball) > DISTANCE_PRECISION * 6)
                        this.action = "getBall"
                    else
                        this.state = "blockGoal"
                    break;
                case "readyToBlockGoal":
                    if (calcDistance(this.env, this.ball) > DISTANCE_PRECISION * 6)
                        this.action = "rotateOnMemory"
                    else
                        this.state = "blockGoal"
                    break
                case "blockGoal":
                    if (calcDistance(this.env, this.ball) > DISTANCE_PRECISION * 4)
                        this.action = "kick"
                    else
                        this.action = "catch"
                    break
                case "bigDistance":
                    if (calcDistance(this.env, this.pointInGates) <= DISTANCE_PRECISION * 2)
                        this.action = "backToGates"
                    else
                        this.state = "control"
                    break;
                case "control":
                    if (Math.abs(this.env.y - this.ball.y) <= DISTANCE_PRECISION * 4)
                        this.action = "rotateOnMemory";
                    else
                        this.action = "moveToBall"
                    break;
            }
        }
    }

    updateAction() {
        console.log(this.action)
        this.previousAction = this.action;
        switch (this.action) {
            case "catch":
                return this.catchBall();
            case "kick":
                return this.kickBall();
            case "getBall":
                return this.getBall();
            case "backToGates":
                return this.backToGates();
            case "rotateOnMemory":
                return this.rotateOnMemory();
            case "findBall":
                return this.findBall();
            case "moveToBall":
                return this.moveToBall();
        }
    }

    catchBall() {
        this.catched = true;
        this.state = "root"
        let angle = getAngleToTarget(this.env, this.env.zeroVec, this.ball)
        return () => {
            this.controls.Catch(-angle);
        }
    }

    kickBall() {
        this.catched = false;
        this.state = "calcBall"
        let angle = getAngleToTarget(this.env, this.env.zeroVec, this.agent.side === "r" ? Flags.gl : Flags.gr)
        return () => {
            this.controls.KickWithAngle(KICK_FORCE, -angle);
        }
    }

    getBall() {
        let x3 = this.env.x
        let y1 = this.ball.y, x1 = this.ball.x;
        let y2 = this.previousBall.y, x2 = this.previousBall.x;
        this.posAccordingly = {
            x: x3,
            y: y1 + ((y2 - y1) / (x2 - x1)) * (x3 - x1)
        }
        if (calcDistance(this.env, this.posAccordingly) <= DISTANCE_PRECISION * 2) {
            this.state = "readyToBlockGoal"
            this.updateState()
            return this.updateAction();
        }
        return this.goto(this.posAccordingly, RUN_SPEED)
    }

    backToGates() {
        return this.goto(this.pointInGates, MOVEMENT_SPEED)
    }

    rotateOnMemory() {
        this.state = "root"
        let angle = getAngleToTarget(this.env, this.env.zeroVec, this.ball)
        return () => {
            this.controls.Turn(-angle);
        }
    }

    findBall() {
        if (this.previousBall != null) {
            let angle = getAngleToTarget(this.env, this.env.zeroVec, this.previousBall)
            return () => {
                this.controls.Turn(-angle);
            }
        }
        let tmpBall = this.env.objects.find(el => el.type === "ball");
        if (tmpBall != null) {
            this.ball = tmpBall;
            this.state = "root"
            this.updateState()
            return this.updateAction();
        }
        return () => {
            this.controls.Turn(SEARCH_ANGLE);
        }
    }

    moveToBall() {
        this.posAccordingly = {
            x: this.env.x,
            y: Math.min(5, Math.max(-5, this.ball.y))
        }
        if (calcDistance(this.env, this.posAccordingly) <= DISTANCE_PRECISION * 2) {
            this.state = "readyToBlockGoal"
            this.updateState()
            return this.updateAction();
        }
        return this.goto(this.posAccordingly, MOVEMENT_SPEED)
    }
}


class Attacker extends Role {
    constructor(agent) {
        super(agent);
        this.name = "attacker"
        this.ballMemory = null;
        this.ball = null;
        this.state = "root"
        this.action = null;
        this.targets = [{x: 20, y: 20}, {x: 20, y: -20}, Flags.gr]
        this.targetNum = 0;
    }

    updateState() {
        this.state = "root"
        this.action = null;
        this.ball = this.env.objects.find(el => el.type === "ball");
        if (this.ball != null) {
            this.ballMemory = this.ball;
        }
        this.gates = this.agent.side === "r" ? Flags.gl : Flags.gr
        while (this.action == null) {
            switch (this.state) {
                case "root":
                    if (this.ball == null)
                        this.action = "searching"
                    else
                        this.state = "moveToBall"
                    break
                case "moveToBall":
                    if (calcDistance(this.env, this.ball) > DISTANCE_PRECISION)
                        this.action = "getBall"
                    else
                        this.state = "gatesPerformance"
                    break
                case "gatesPerformance":
                    if (calcDistance(this.env, this.gates) > GOAL_DISTANCE)
                        this.action = "gotoTarget"
                    else
                        this.action = "performGoal"
                    break
            }
        }
    }

    updateAction() {
        switch (this.action) {
            case "searching":
                return this.searching();
            case "getBall":
                return this.goto(this.ball, MOVEMENT_SPEED);
            case "gotoTarget":
                return this.gotoTarget();
            case "performGoal":
                return this.performGoal();
        }
    }

    searching() {
        if (this.ballMemory != null) {
            let angle = getAngleToTarget(this.env, this.env.zeroVec, this.ballMemory)
            this.ballMemory = null;
            return () => {
                this.controls.Turn(-angle)
            }
        }
        return () => {
            this.controls.Turn(SEARCH_ANGLE);
        }
    }

    gotoTarget() {
        let target = this.targets[this.targetNum];
        if (calcDistance(this.env, target) <= DISTANCE_PRECISION * 5 && this.targetNum < 3) {
            this.targetNum++;
        }
        return this.goto(target, MOVEMENT_SPEED, true)
    }

    performGoal() {
        let angle = getAngleToTarget(this.env, this.env.zeroVec, this.gates)
        return () => {
            this.controls.KickWithAngle(KICK_FORCE, -angle)
        }
    }
}

class SubAttacker
    extends Role {
    constructor(agent) {
        super(agent);
        this.name = "subattacker"
        this.state = "root"
        this.attacker = null;
        this.turned = false;
    }

    updateState() {
        this.state = "root"
        this.action = null;

        this.attacker = this.env.objects.find(el => el.team === this.agent.team && el.number == this.attackerId);

        while (this.action == null) {
            switch (this.state) {
                case "root":
                    if (this.attacker == null)
                        this.action = "searching"
                    else
                        this.state = "turnToAttacker"
                    break
                case "turnToAttacker":
                    if (!this.turned)
                        this.action = "turn"
                    else
                        this.state = "moveToAttacker"
                    break
                case "moveToAttacker":
                    this.turned = false;
                    if (calcDistance(this.env, this.attacker) > DISTANCE_PRECISION * 10)
                        this.action = "move"
                    else
                        this.action = "wait"
                    break
            }
        }
    }

    updateAction() {
        switch (this.action) {
            case "searching":
                return this.searching();
            case "turn":
                return this.turning()
            case "move":
                return () => {
                    this.controls.Dash(MOVEMENT_SPEED)
                }
            case "wait":
                return () => {
                    this.controls.Dash(MOVEMENT_SPEED / 2)
                }
        }
    }

    searching() {
        return () => {
            this.controls.Turn(SEARCH_ANGLE);
        }
    }

    turning() {
        this.turned = true;
        let angle = getAngleToTarget(this.env, this.env.zeroVec, this.attacker)
        return () => {
            this.controls.Turn(angle + 10)
        }
    }
}

class Keeper extends Role {
    constructor(agent) {
        super(agent);
    }

    updateState() {

    }

    updateAction() {
        return () => {

        }
    }
}

module.exports = {
    Role: Role,
    Goalie: Goalie,
    Attacker: Attacker,
    SubAttacker: SubAttacker,
    Keeper: Keeper
}