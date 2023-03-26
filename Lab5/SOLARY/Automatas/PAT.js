const {ActV} = require("../constValues")
const {calcDistance, getAngleToTarget} = require("../utils");

class PAT {
    constructor(agent) {
        this.memory = agent.memory
        this.at_term = {n: "start", next: true}
        this.env = agent.environment
        this.controls = agent.controls
        this.current = "start"
        this.next = true;
        this.action = null
        this.nodes = {
            start: {n: "start", e: ["nearBall", "farBall"]},
            nearBall: {n: "nearBall", e: ["gatesNear", "gatesFar"]},
            memoryUpdate: {n: "memoryUpdate", e: ["start"]},
            farBall: {n: "farBall", e: ["nearBall"]},
            gatesNear: {n: "gatesNear", e: ["start"]},
            gatesFar: {n: "gatesFar", e: ["gatesNear"]},
        }

        this.memoryUpdateGuard = () => {
            return this.memory.age > ActV.UPDATE_MEMORY_DIFF
        }

        this.edges = {
            start_nearBall: {
                guard: (memory) => {
                    return calcDistance(memory.rem.pos, memory.rem.ball) < ActV.DISTANCE_PRECISION
                }
            },
            start_farBall: {
                guard: (memory) => {
                    return calcDistance(memory.rem.pos, memory.rem.ball) > ActV.DISTANCE_PRECISION
                },
                action: "moveToBall"
            },
            nearBall_gatesNear: {
                guard: (memory) => {
                    return calcDistance(memory.rem.pos, memory.rem.enemyGates) < ActV.GOAL_DISTANCE
                }
            },
            nearBall_gatesFar: {
                guard: (memory) => {
                    return calcDistance(memory.rem.pos, memory.rem.enemyGates) > ActV.GOAL_DISTANCE &&
                        calcDistance(memory.rem.pos, memory.rem.ball) < ActV.DISTANCE_PRECISION
                },
                action: "dribbleToGates"
            },
            memoryUpdate_start: {
                guard: (memory) => {
                    return memory.age > ActV.UPDATE_MEMORY_DIFF
                },
                action: "updateMemory"
            },
            farBall_nearBall: {
                guard: (memory) => {
                    return calcDistance(memory.rem.pos, memory.rem.ball) < ActV.DISTANCE_PRECISION
                }
            },
            gatesNear_start: {
                guard: () => {
                    return true
                },
                action: "performGoal"
            },
            gatesFar_gatesNear: {
                guard: (memory) => {
                    return calcDistance(memory.rem.pos, memory.rem.enemyGates) < ActV.GOAL_DISTANCE
                },
                action: "dribbleToGates"
            }
        }
        this.actions = {
            dribbleToGates: () => {
                let angle = getAngleToTarget(this.env, this.env.zeroVec, this.memory.rem.enemyGates)
                return this.controls.KickWithAngle(ActV.DRIBBLE_FORCE, -angle);
            },
            moveToBall: () => {
                let angle = getAngleToTarget(this.env, this.env.zeroVec, this.memory.rem.ball)
                if (Math.abs(angle) > ActV.ANGLE_PRECISION) {
                    return this.controls.Turn(-angle);
                }
                if (this.env.objects.find(el => el.type === "ball") == null) {
                    this.memory.age = 1000
                    return this.controls.Turn(90)
                }
                return this.controls.Dash(ActV.MOVEMENT_SPEED);
            },
            performGoal: () => {
                let angle = getAngleToTarget(this.env, this.env.zeroVec, this.memory.rem.enemyGates)
                return this.controls.KickWithAngle(ActV.KICK_FORCE, -angle);
            },
            updateMemory: () => {
                return this.memory.updateMemory(this.controls, "kicker", this)
            }
        }
    }
}

module.exports = PAT