const {ActV} = require("../../constValues");
const PMController = require("./PMController")
const {calcDistance} = require("../../utils");

class PHController {
    constructor(agent) {
        this.agent = agent;
        this.mcontroller = new PMController(agent)
        this.data = null;
    }

    getAction() {
        this.compileEverything()
        let ball = this.agent.environment.objects.find(el => el.type === "ball")
        if (this.agent.memory.age > ActV.UPDATE_MEMORY_DIFF && ball == null) {
            return this.mcontroller.updateMemory(this.data, this.agent.memory);
        } else {
            return this.mcontroller.getAction(this.data);
        }
    }

    compileEverything() {
        this.data = this.agent.memory.rem;
        this.data.side = this.agent.side;
        this.data.playerId = this.agent.id;
        this.data.team = this.agent.team;
        this.data.canKick = this.data.ball && calcDistance(this.data.pos, this.data.ball) < ActV.DISTANCE_PRECISION * 2;
    }

}

module.exports = PHController