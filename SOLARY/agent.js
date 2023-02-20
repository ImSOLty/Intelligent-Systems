const Msg = require('./msg')
const AgentBridge = require('./agentbridge')
const Sense = require('./sense')
const Environment = require('./environment')

class Agent {
    constructor(teamName, speed, ranActions) {
        this.sense = new Sense()
        this.environment = new Environment(this)
        this.side = "r"
        this.id = -1
        this.gamemode = "before_kick_off"
        this.run = false
        this.act = function () {
        }
        this.bridge = new AgentBridge(this)
        this.team = teamName

        this.tmpspeed = speed;
        this.ranActions = ranActions;
    }

    processMsg(msg) {
        let data = Msg.parseMsg(msg)
        if (!data) throw new Error("Parse error\n" + msg)

        if (data.cmd === "hear") {
            this.run = true
            if (data.p[1] === "referee")
                this.gamemode = data.p[2]
        }
        if (data.cmd === "init") {
            if (data.p[0] === "r") {
                this.side = "r"
            } else {
                this.side = "l"
            }
            if (data.p[1]) this.id = data.p[1]
        }
        this.analyzeAll(data.cmd, data.p)
        if (this.tmpspeed === null && this.ranActions)
            this.MakeRandomMove();
        else
            this.act = () => this.Turn(this.tmpspeed)
        this.MakeAction()
    }

    MakeRandomMove() {
        if (this.gamemode !== "play_on") {
            this.act = () => this.Turn(18)
            return;
        }
        let tmpAct = Math.floor(Math.random() * 3);
        switch (tmpAct) {
            case 0:
                this.act = () => this.Dash(100)
                break;
            case 1:
                this.act = () => this.Turn(-45)
                break;
            case 2:
                this.act = () => this.Turn(45)
                break;
        }
    }

    analyzeAll(cmd, p) {
        this.sense.analyze(cmd, p)
        this.environment.analyze(cmd, p)
    }

    MakeAction() {
        if (!this.run) {
            return
        }
        this.act()
        this.act = function () {
        }
    }

    Move(x, y) {
        this.bridge.socketSend("move", `${x} ${y}`)
    }

    Dash(value) {
        this.bridge.socketSend("dash", `${value}`)
    }

    Turn(angle) {
        this.bridge.socketSend("turn", `${angle}`)
    }

    TurnNeck(angle) {
        this.bridge.socketSend("turn_neck", `${angle}`)
    }

    Kick(value) {
        this.bridge.socketSend("kick", `${value}`)
    }
}

module.exports = Agent