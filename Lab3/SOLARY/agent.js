const Msg = require('./msg')
const AgentBridge = require('./agentbridge')
const Sense = require('./sense')
const Environment = require('./environment')
const Controls = require('./controls')

const {Goalie, Attacker, SubAttacker, Keeper} = require("./roles");

class Agent {
    constructor(teamName, role) {
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
        if (role === "goalie") {
            this.role = new Goalie(this)
            this.isGoalie = true;
        } else {
            this.role = null;
            this.isGoalie = false;
        }
    }

    processMsg(msg) {
        let data = Msg.parseMsg(msg)
        if (!data) throw new Error("Parse error\n" + msg)

        if (data.cmd === "hear") {
            let info = data.p[2].replace(/"/g, '')
            if(info.startsWith(this.team) && data.p[1]!="self"){
                //parse info
                this.role.attackerId = info.split("x")[1];
            }
            if (data.p[1] === "referee") {
                this.gamemode = data.p[2]
                if(this.role.name === "attacker"){
                    this.controls.Say(this.team+"x"+this.id)
                }
            }
            if (this.gamemode === "play_on") {
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
        if (data.cmd === 'see') {
            if(this.role == null){
                //defining current role
                let countAllies = this.environment.objects.filter((elem) => elem.team===this.team)
                if (countAllies.length === 0) {
                    this.role = new Attacker(this);
                }else{
                    this.role = new SubAttacker(this);
                }
            }
            this.MakeAction()
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
        this.act = this.role.update()
        this.act()
    }
}

module.exports = Agent