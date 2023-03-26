const {Flags, ActV} = require("./constValues");
const {getAngleToTarget, calcDistance} = require("./utils");

class Memory {
    constructor(agent) {
        this.agent = agent
        this.env = agent.environment;
        this.tick = 0;
        this.stack = []
        this.age = 1000;
        this.rem = null;
        this.updated = 0;
    }

    analyze() {
        this.age++;
        let cell = this.formMemoryCell()
        this.stack.push(cell)
        this.rem = this.retrieveLastInfo()
    }

    formMemoryCell() {
        let ball = this.env.objects.find(el => el.type === "ball")
        let enemies = this.env.objects.filter(el => el.type === "player" && !el.ally)
        let allies = this.env.objects.filter(el => el.type === "player" && el.ally)
        return {
            myGates: this.agent.side === "l" ? Flags.gl : Flags.gr,
            enemyGates: this.agent.side === "l" ? Flags.gr : Flags.gl,
            tick: this.tick,
            pos: {x: this.env.x, y: this.env.y},
            ball: ball,
            enemies: enemies,
            allies: allies,
        }
    }

    retrieveLastInfo() {
        let retCell = {
            myGates: this.agent.side === "l" ? Flags.gl : Flags.gr,
            enemyGates: this.agent.side === "l" ? Flags.gr : Flags.gl,
            pos: -1,
            ball: -1,
            enemies: -1,
            allies: -1
        }
        for (let i = this.stack.length - 1; i >= 0; i--) {
            if (retCell.pos != -1 && retCell.ball != -1 && retCell.enemies != -1 && retCell.allies != -1) {
                break;
            }
            let el = this.stack[i];
            if (el.pos != null)
                retCell.pos = el.pos
            if (el.ball != null)
                if (el.ball.x != null && el.ball.y != null)
                    retCell.ball = el.ball
            if (el.enemies != null)
                retCell.enemies = el.enemies
            if (el.allies != null)
                retCell.allies = el.allies
        }
        // if (retCell.ball)
        //     console.log("Last Ball coo: " + retCell.ball.x + " " + retCell.ball.y)
        return retCell;
    }

    updateMemory(controls, type, at) {
        let pos = at.memory.rem.pos
        let gates = at.memory.rem.enemyGates
        if (this.waysToLook == null)
            if (type === "kicker")
                this.waysToLook = [
                    {x: pos.x, y: pos.y + 10},
                    {x: pos.x + 10, y: pos.y},
                    {x: pos.x, y: pos.y - 10},
                    {x: pos.x - 10, y: pos.y}
                ]
            else if (type === "goalie") {
                if (gates === Flags.gr)
                    if (calcDistance(pos, at.initial) > ActV.DISTANCE_PRECISION * 5) {
                        this.waysToLook = [
                            {x: pos.x, y: pos.y + 10},
                            {x: pos.x + 10, y: pos.y},
                            {x: pos.x, y: pos.y - 10},
                            {x: pos.x - 10, y: pos.y}
                        ]
                    } else {
                        this.waysToLook = [
                            {x: pos.x + 10, y: pos.y + 10},
                            {x: pos.x + 10, y: pos.y - 10}
                        ]
                    }
                else if (calcDistance(pos, at.initial) > ActV.DISTANCE_PRECISION * 5) {
                    this.waysToLook = [
                        {x: pos.x, y: pos.y + 10},
                        {x: pos.x + 10, y: pos.y},
                        {x: pos.x, y: pos.y - 10},
                        {x: pos.x - 10, y: pos.y}
                    ]
                } else {
                    this.waysToLook = [
                        {x: pos.x - 10, y: pos.y + 10},
                        {x: pos.x - 10, y: pos.y - 10}
                    ]
                }

            }
        let way = this.updated
        let angle = getAngleToTarget(at.env, at.env.zeroVec, this.waysToLook[way])
        this.updated++;
        if (this.updated === this.waysToLook.length) {
            this.updated = 0;
            this.age = 0;
            this.waysToLook = null
        }
        console.log(at.memory.rem.pos)
        return controls.Turn(-angle);
    }
}

module.exports = Memory