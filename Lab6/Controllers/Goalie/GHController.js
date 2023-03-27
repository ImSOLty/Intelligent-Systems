const GMController = require("./GMController")
const {ActV} = require("../../constValues");
const {calcDistance} = require("../../utils");

class GHController {
    constructor(agent) {
        this.agent = agent;
        this.mcontroller = new GMController(agent)
        this.data = null;
    }

    getAction() {
        this.compileEverything()
        let ball = this.agent.environment.objects.find(el => el.type === "ball")
        if (ball == null) {
            if (this.agent.memory.age > ActV.UPDATE_MEMORY_DIFF) {
                return this.mcontroller.updateMemory(this.data, this.agent.memory);
            } else {
                return this.mcontroller.getAction(this.data);
            }
        } else {
            this.agent.memory.age = ActV.UPDATE_MEMORY_DIFF-4;
            return this.mcontroller.getAction(this.data);
        }

    }

    compileEverything() {
        this.data = this.agent.memory.rem;
        this.data.side = this.agent.side;
        this.data.playerId = this.agent.id;
        this.data.team = this.agent.team;
        this.data.canKick = this.data.ball && calcDistance(this.data.pos, this.data.ball) < ActV.DISTANCE_PRECISION * 2;
        this.data.canCatch = this.data.ball && calcDistance(this.data.pos, this.data.ball) < ActV.DISTANCE_PRECISION;
    }
}

module.exports = GHController