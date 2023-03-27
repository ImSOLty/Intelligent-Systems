const {calcDistance, getAngleToTarget} = require("./utils");
const {Flags} = require("./constValues")

const ANGLE_PRECISION = 15 // If greater angle to target - turn
const DISTANCE_PRECISION = 0.5 // If greater - move
const SEARCH_ANGLE = 90
const MOVEMENT_SPEED = 100
const RUN_SPEED = 120
const DRIBBLE_FORCE = 25
const KICK_FORCE = 100
const GOAL_DISTANCE = 35
const FORCE_PER_DISTANCE = 2.3

class Role {
    constructor(agent) {
        this.agent = agent
        this.controls = this.agent.controls
        this.env = this.agent.environment
        this.goalWas = false;
    }

    update() {
        this.updateState()
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
            this.controls.Turn(-angle)
        }
    }
}

class Goalie extends Role {
    constructor(agent) {
        super(agent);
        this.name = "goalie"
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
            this.ball = tmpBall;
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
                    if (tmpBall == null || calcDistance(this.env, this.ball) > DISTANCE_PRECISION * 6) {
                        this.action = "rotateOnMemory"
                        this.ball = {x: 0, y: 0}
                    } else
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
        this.state = "root"
        this.ball = {x: 0, y: 0};
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
        if (calcDistance(this.env, this.posAccordingly) <= DISTANCE_PRECISION) {
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
        if (this.ball != null) {
            let angle = getAngleToTarget(this.env, this.env.zeroVec, this.ball)
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
        this.ball = {x: 0, y: 0};
        this.state = "root"
        this.action = null;
        this.target = Flags.fplc
        this.end = false;
        this.readyToPass = false;
        this.podopnut = false;
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
                    if (this.end) {
                        this.action = "wait"
                    } else {
                        this.state = "notEnded"
                    }
                    break;
                case "notEnded":
                    if (this.target !== null)
                        this.action = "moveToTarget"
                    else
                        this.state = "ballPerformance"
                    break
                case "ballPerformance":
                    if (this.ball == null)
                        this.action = "searching"
                    else
                        this.state = "moveToBall"
                    break
                case "moveToBall":
                    if (calcDistance(this.env, this.ball) > DISTANCE_PRECISION)
                        this.action = "getBall"
                    else
                        this.state = "action"
                    break
                case "action":
                    if (this.podopnut) {
                        this.action = "sendPass"
                    } else {
                        this.action = "podopnut"
                    }
            }
        }
    }

    updateAction() {
        switch (this.action) {
            case "searching":
                return this.searching();
            case "moveToTarget":
                return this.moveToTarget();
            case "getBall":
                return this.goto(this.ball, MOVEMENT_SPEED);
            case "sendPass":
                return this.sendPass();
            case "podopnut":
                return this.podopnutF();
            case "wait":
                return () => {

                }
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

    moveToTarget() {
        if (calcDistance(this.env, this.target) < DISTANCE_PRECISION) {
            this.target = null;
            return () => {
            }
        }
        return this.goto(this.target, MOVEMENT_SPEED);
    }

    sendPass() {
        let destination = {x: 30, y: -8}
        let angle = getAngleToTarget(this.env, this.env.zeroVec, destination)
        if (this.readyToPass) {
            this.controls.SayGo()
            this.end = true;
            return () => {
                this.controls.KickWithAngle(calcDistance(this.env, destination) * FORCE_PER_DISTANCE, -angle)
            }
        } else {
            this.readyToPass = true;
            return () => {
                this.controls.Turn(-angle)
            }
        }
    }

    podopnutF() {
        let angle = getAngleToTarget(this.env, this.env.zeroVec, this.gates)
        this.podopnut = true;
        return () => {
            this.controls.Kick(30, -angle)
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
        this.cur = 0;
        this.target = Flags.fplb
        this.targets = [Flags.fplb, Flags.fgrb];
        this.go = false
        this.ballFound = false;
        this.readyToGoal = false;
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
                    if (this.go)
                        this.state = "waitForBall"
                    else
                        this.action = "moveToTarget"
                    break;
                case "waitForBall":
                    if (this.ball != null || this.ballFound) {
                        this.ballFound = true;
                        this.state = "ballFound"
                    } else {
                        this.withBall = false;
                        this.action = "moveToTarget"
                    }
                    break;
                case "ballFound":
                    if (this.ball == null) {
                        this.action = "findBall"
                    } else {
                        this.state = "toBall"
                    }
                    break
                case "toBall":
                    if (calcDistance(this.env, this.ball) > DISTANCE_PRECISION) {
                        this.target = this.ball;
                        this.withBall = false;
                        this.action = "moveToTarget"
                    } else {
                        this.state = "gatesPerformance"
                    }
                    break
                case "gatesPerformance":
                    if (calcDistance(this.env, this.gates) > GOAL_DISTANCE) {
                        this.target = this.gates;
                        this.withBall = true;
                        this.action = "moveToTarget"
                    } else
                        this.action = "performGoal"
                    break
            }
        }
    }

    updateAction() {
        switch (this.action) {
            case "moveToTarget":
                return this.moveToTarget();
            case "moveForward":
                return this.moveForward();
            case "performGoal":
                return this.performGoal();
            case "findBall":
                return this.findBall();
        }
    }

    moveToTarget() {
        if (calcDistance(this.env, this.target) < DISTANCE_PRECISION) {
            this.cur++;
            if (this.cur < 2) {
                this.target = this.targets[this.cur]
            } else {
                this.target = this.gates
                this.ballFound = true;
            }
            return () => {
            }
        }
        return this.goto(this.target, MOVEMENT_SPEED, this.withBall)
    }

    moveForward() {
        return () => {
            this.controls.Dash(100)
        }
    }

    performGoal() {
        if (this.readyToGoal) {
            let goalie = this.env.objects.find(el => el.team !== this.agent.team);

            let point = this.gates;
            let max = calcDistance(this.env, point)

            if (calcDistance(this.env, {x: this.gates.x, y: this.gates.y + 3}) > max) {
                max = calcDistance(this.env, {x: this.gates.x, y: this.gates.y + 3});
                point = {x: this.gates.x, y: this.gates.y + 3}
            }
            if (calcDistance(this.env, {x: this.gates.x, y: this.gates.y - 3}) > max) {
                point = {x: this.gates.x, y: this.gates.y - 3}
            }
            let angle = getAngleToTarget(this.env, this.env.zeroVec, point)

            return () => {
                console.log("kicked")
                this.controls.KickWithAngle(KICK_FORCE, -angle)
            }
        } else {
            let angle = getAngleToTarget(this.env, this.env.zeroVec, this.gates)
            this.readyToGoal = true;
            return () => {
                this.controls.Turn(-angle)
            }
        }
    }

    findBall() {
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