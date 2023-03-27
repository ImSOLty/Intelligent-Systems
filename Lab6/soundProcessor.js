const {Messages} = require('./constValues')
const {Attacker, SubAttacker} = require("./roles");

class SoundProcessor {
    constructor(agent) {
        this.agent = agent
        this.msg = ""
    }

    analyze(data) {
        let tick = data[0]
        let author = data[1]
        this.msg = data[2].replace(/"/g, '')
        if (author === "referee") {
            this.processRefereeMessage()
            return;
        }
        //this.processPlayersMessage()
    }

    processRefereeMessage() {
        this.agent.gamemode = this.msg
        if (this.agent.gamemode.startsWith("goal_")) {
            this.agent.memory.clearMemory()
            this.agent.run = false
        }
        if (this.agent.gamemode === "play_on") {
            this.agent.run = true
        }
    }

    processPlayersMessage() {
        this.msg = this.msg.replace(/z/g, '-')
        this.msg = this.msg.replace(/q/g, '+')
        let arr = this.msg.split('');
        if (arr[0] !== this.agent.team.charAt(0)) {
            return
        }
        //console.log(this.msg)
        switch (arr[1]) {
            case Messages.noise:
                let playerId = parseInt(arr[2] + arr[3])
                let xPlayer = arr[4] === '-' ? (-1) * parseInt(arr[5] + arr[6]) : parseInt(arr[5] + arr[6])
                let yPlayer = arr[7] === '-' ? (-1) * parseInt(arr[8] + arr[9]) : parseInt(arr[8] + arr[9])
                break
        }
    }
}

module.exports = SoundProcessor