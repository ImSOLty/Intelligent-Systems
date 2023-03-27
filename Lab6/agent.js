const Msg = require('./msg')
const AgentBridge = require('./agentbridge')
const Sense = require('./sense')
const Environment = require('./environment')
const Controls = require('./controls')
const SoundProcessor = require('./soundProcessor')

const Memory = require('./Memory')

const GHController = require("./Controllers/Goalie/GHController")
const PHController = require("./Controllers/Player/PHController")

class Agent {
    constructor(teamName, role) {
        this.sense = new Sense()
        this.environment = new Environment(this)
        this.controls = new Controls(this)
        this.soundProcessor = new SoundProcessor(this)
        this.side = "r"
        this.id = -1
        this.gamemode = "before_kick_off"
        this.run = false
        this.act = function () {
        }
        this.bridge = new AgentBridge(this)
        this.team = teamName
        this.memory = new Memory(this);
        this.isGoalie = role === "goalie"
        if (this.isGoalie) {
            this.controller = new GHController(this)
        } else {
            this.controller = new PHController(this)
        }
    }

    processMsg(msg) {
        let data = Msg.parseMsg(msg)
        if (!data) throw new Error("Parse error\n" + msg)

        if (data.cmd === "hear") {
            this.soundProcessor.analyze(data.p)
        }

        if (data.cmd === "init") {
            console.log(data)
            if (data.p[0] === "r") {
                this.side = "r"
            } else {
                this.side = "l"
            }
            if (data.p[1] && this.id === -1) this.id = data.p[1]
        }
        this.analyzeAll(data.cmd, data.p)
        if (data.cmd === 'see') {
            this.MakeAction()
        }
    }

    analyzeAll(cmd, p) {
        this.sense.analyze(cmd, p)
        this.environment.analyze(cmd, p)
    }

    MakeAction() {
        if (!this.run) {
            if (this.settled == null && this.side === "r") {
                this.act = this.controls.Turn(180)
                this.act()
                this.settled = true
            }
            return
        }
        this.memory.analyze()
        this.act = this.controller.getAction();
        this.act()
    }
}

module.exports = Agent