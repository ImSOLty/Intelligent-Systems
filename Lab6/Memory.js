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
        this.moreActs = -1;
        this.heardAllies = []
    }

    analyze() {
        this.age++;
        let cell = this.formMemoryCell()
        this.stack.push(cell)
        this.rem = this.retrieveLastInfo()
        this.heardAllies = this.agent.soundProcessor.heardAllies
    }

    clearMemory() {
        this.stack = []
        this.age = 1000;
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
}

module.exports = Memory