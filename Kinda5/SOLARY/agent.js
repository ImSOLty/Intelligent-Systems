const Msg = require('./msg')
const AgentBridge = require('./agentbridge')
const Sense = require('./sense')
const Environment = require('./environment')
const Controls = require('./controls')
const SoundProcessor = require('./soundProcessor')
const GKAT = require("./Automatas/GKAT");
const PAT = require("./Automatas/PAT");
const ATManager = require("./Automatas/ATManager");

class Agent {
    constructor(teamName, role) {
        this.sense = new Sense()
        this.environment = new Environment(this)
        this.soundProcessor = new SoundProcessor(this)
        this.controls = new Controls(this);
        this.at = role === "goalie" ? GKAT : PAT;
        this.atManager = new ATManager()
        this.side = "r"
        this.id = -1
        this.gamemode = "before_kick_off"
        this.run = false
        this.act = null
        this.bridge = new AgentBridge(this)
        this.team = teamName
    }

    processMsg(msg) {
        let data = Msg.parseMsg(msg)
        if (!data) throw new Error("Parse error\n" + msg)

        if (data.cmd === "hear") {
            this.soundProcessor.analyze(data.p)
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
        if (data.cmd === 'see') {
            this.MakeAction(data.p)
        }
    }

    analyzeAll(cmd, p) {
        this.sense.analyze(cmd, p)
        this.environment.analyze(cmd, p)
    }

    MakeAction(p) {
        if (!this.run) {
            if (this.settled == null && this.side === "r") {
                this.controls.PerformAction(Controls.Turn(180))
                this.settled = true
            }
            return
        }
        this.act = this.atManager.getAction(p, this)
        if (this.act != null) {
            this.controls.PerformAction(this.act)
        }
    }
}

module.exports = Agent