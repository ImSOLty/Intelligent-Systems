const GLController = require("./GLController")
const {getAngleToTarget} = require("../../utils");

class GMController {
    constructor(agent) {
        this.agent = agent;
        this.waysToLook = null;
        this.lcontroller = new GLController(agent);
    }

    getAction(data) {
        //Define strategy
        return this.lcontroller.getAction(data);
    }

    updateMemory(data, memory) {
        //Calculate where to turn to update memory
        let pos = data.pos
        if (this.waysToLook === null) {
            if (data.side === "r")
                this.waysToLook = [
                    {x: pos.x - 10, y: pos.y + 10},
                    {x: pos.x - 10, y: pos.y - 10}
                ]
            else
                this.waysToLook = [
                    {x: pos.x + 10, y: pos.y + 10},
                    {x: pos.x + 10, y: pos.y - 10}
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

module.exports = GMController