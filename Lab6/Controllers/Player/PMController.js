const PLController = require("./PLController")
const {Flags, ActV} = require("../../constValues");
const {calcDistance, getAngleToTarget} = require("../../utils");

class PMController {
    constructor(agent) {
        this.agent = agent;
        this.waysToLook = null;
        this.lcontroller = new PLController(agent);
    }

    getAction(data) {
        //Define strategy
        if([4,5,8,9,10].includes(data.playerId)){
            return this.lcontroller.getActionForDefender(data)
        }else{
            return this.lcontroller.getActionForAttacker(data)
        }
    }

    updateMemory(data, memory) {
        //Calculate where to turn to update memory
        let pos = data.pos
        if (this.waysToLook === null) {
            this.waysToLook = [
                {x: pos.x, y: pos.y + 10},
                {x: pos.x + 10, y: pos.y},
                {x: pos.x, y: pos.y - 10},
                {x: pos.x - 10, y: pos.y}
            ]
        }
        let angle = getAngleToTarget(this.agent.environment, this.agent.environment.zeroVec, this.waysToLook[0])
        this.waysToLook.shift();
        if (this.waysToLook.length === 0) {
            this.waysToLook = null;
            memory.age = 0;
        }
        return this.agent.controls.Turn(-angle);
    }
}

module.exports = PMController