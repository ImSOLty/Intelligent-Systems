const {ActV} = require("../constValues")
const {calcDistance, getAngleToTarget} = require("../utils");

class GKAT {
    constructor(agent) {
        this.memory = agent.memory
        this.at_term = {n: "wait", next: false}
        this.env = agent.environment
        this.controls = agent.controls
        this.current = "start"
        this.next = true;
        this.action = null

        this.initial = {x: 51, y: 0}

        this.nodes = {
            start: {n: "start", e: ["closeBall", "nearBall", "farBall"]},
            closeBall: {n: "closeBall", e: ["catch"]},
            catch: {n: "catch", e: ["kick"]},
            kick: {n: "kick", e: ["start"]},
            nearBall: {n: "nearBall", e: ["intercept"]},
            memoryUpdate: {n: "memoryUpdate", e: ["start"]},
            farBall: {n: "farBall", e: ["backToGates", "controlBall"]},
            controlBall: {n: "controlBall", e: ["start"]},
            intercept: {n: "intercept", e: ["start"]},
            wait: {n: "wait", e: ["start"]},
            backToGates: {n: "backToGates", e: ["start"]}
        }

        this.memoryUpdateGuard = () => {
            return this.memory.age > ActV.UPDATE_MEMORY_DIFF
        }

        this.edges = {
            start_closeBall: {
                guard: (memory) => {
                    return calcDistance(memory.rem.pos, memory.rem.ball) < ActV.DISTANCE_PRECISION * 2
                }
            },
            start_nearBall: {
                guard: (memory) => {
                    return calcDistance(memory.rem.pos, memory.rem.ball) < ActV.INTERCEPT_DISTANCE
                }
            },
            start_farBall: {
                guard: (memory) => {
                    return calcDistance(memory.rem.pos, memory.rem.ball) > ActV.INTERCEPT_DISTANCE
                }
            },
            closeBall_catch: {},
            catch_kick: {},
            kick_start: {},
            controlBall_start: {},
            backToGates_start: {},
            intercept_start: {
                guard: (memory) => {
                    return calcDistance(memory.rem.pos, memory.rem.ball) > ActV.DISTANCE_PRECISION * 2
                },
                action: "interceptBall"
            },
            wait_start: {},
            nearBall_controlBall: {
                guard: (memory) => {
                    return calcDistance(memory.rem.pos, memory.rem.ball) > ActV.INTERCEPT_DISTANCE
                }
            },
            nearBall_intercept: {},
            memoryUpdate_start: {
                guard: (memory) => {
                    return memory.age > ActV.UPDATE_MEMORY_DIFF
                },
                action: "updateMemory"
            },
            farBall_controlBall: {
                guard: (memory) => {
                    this.destination = {x: this.memory.rem.pos.x, y: Math.min(Math.max(this.memory.rem.pos, -5), 5)}
                    return calcDistance(memory.rem.pos, this.destination) > ActV.DISTANCE_PRECISION*3
                },
                action: "moveAccordingly"
            },
            farBall_backToGates: {
                guard: (memory) => {
                    return calcDistance(memory.rem.pos, this.initial) > ActV.DISTANCE_PRECISION
                },
                action: "moveToGates"
            }
        }
        this.actions = {
            wait: () => {
                let angle = getAngleToTarget(this.env, this.env.zeroVec, this.memory.rem.ball)
                return this.controls.Turn(-angle);
            },
            kick: () => {
                let angle = getAngleToTarget(this.env, this.env.zeroVec, this.memory.rem.enemyGates)
                return this.controls.KickWithAngle(ActV.KICKOUT_FORCE, -angle);
            },
            catch: () => {
                let angle = getAngleToTarget(this.env, this.env.zeroVec, this.memory.rem.ball)
                return this.controls.Catch(-angle);
            },
            interceptBall: () => {
                let angle = getAngleToTarget(this.env, this.env.zeroVec, this.memory.rem.ball)
                if (Math.abs(angle) > ActV.ANGLE_PRECISION) {
                    return this.controls.Turn(-angle);
                }
                return this.controls.Dash(ActV.WALK_SPEED);
            },
            moveAccordingly: () => {
                this.destination = {x: this.memory.rem.pos.x, y: Math.min(Math.max(this.memory.rem.pos, -5), 5)}
                let angle = getAngleToTarget(this.env, this.env.zeroVec, this.destination)
                if (Math.abs(angle) > ActV.ANGLE_PRECISION) {
                    return this.controls.Turn(-angle);
                }
                return this.controls.Dash(ActV.MOVEMENT_SPEED);
            },
            moveToGates: () => {
                let angle = getAngleToTarget(this.env, this.env.zeroVec, this.initial)
                if (Math.abs(angle) > ActV.ANGLE_PRECISION) {
                    return this.controls.Turn(-angle);
                }
                return this.controls.Dash(ActV.MOVEMENT_SPEED);
            },
            updateMemory: () => {
                return this.memory.updateMemory(this.controls, "goalie", this)
            }
        }
    }
}

module.exports = GKAT