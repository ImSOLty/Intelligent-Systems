const Msg = require('./msg')
const AgentBridge = require('./agentbridge')
const Sense = require('./sense')
const Environment = require('./environment')
const Controls = require('./controls')

class Agent {
    constructor(teamName) {
        this.sense = new Sense()
        this.environment = new Environment(this)
        this.controls = new Controls(this)
        this.side = "r"
        this.id = -1
        this.gamemode = "before_kick_off"
        this.run = false
        this.act = function () {
        }
        this.bridge = new AgentBridge(this)
        this.team = teamName
    }

    processMsg(msg) {
        let data = Msg.parseMsg(msg)
        if (!data) throw new Error("Parse error\n" + msg)

        if (data.cmd === "hear") {
            if (data.p[1] === "referee")
                this.gamemode = data.p[2]
            if(this.gamemode === "play_on"){
                this.run = true
            }
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
        if(data.cmd==='see')
            this.MakeAction()
    }

    analyzeAll(cmd, p) {
        this.sense.analyze(cmd, p)
        this.environment.analyze(cmd, p)
    }

    MakeAction() {
        if (!this.run) {
            return
        }
        this.act = this.controls.calculateAction();
        this.act()
    }
}

module.exports = Agent