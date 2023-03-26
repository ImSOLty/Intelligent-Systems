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
            this.agent.run = false
        }
        if (this.agent.gamemode === "play_on") {
            this.agent.player_at.current = "memoryUpdate_start"
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
        console.log(this.msg)
        let to = -1
        switch (arr[1]) {
            case Messages.goto:
                to = parseInt(arr[2] + arr[3])
                if (to !== this.agent.id && to !== 99) {
                    return
                }
                let x = arr[4] === '-' ? (-1) * parseInt(arr[5] + arr[6]) : parseInt(arr[5] + arr[6])
                let y = arr[7] === '-' ? (-1) * parseInt(arr[8] + arr[9]) : parseInt(arr[8] + arr[9])
                this.agent.role.target = {x: x, y: y}
                break
            case Messages.switchAttacker:
                to = parseInt(arr[2] + arr[3])
                if (to === this.agent.id) {
                    this.agent.role = new Attacker(this.agent)
                } else {
                    if (this.agent.role.name !== "subattacker")
                        this.agent.role = new SubAttacker(this.agent)
                    this.agent.role.attackerId = to;
                }
                break
            case Messages.getPass:
                to = parseInt(arr[2] + arr[3])
                if (to === this.agent.id) {
                    let xPlayer = arr[4] === '-' ? (-1) * parseInt(arr[5] + arr[6]) : parseInt(arr[5] + arr[6])
                    let yPlayer = arr[7] === '-' ? (-1) * parseInt(arr[8] + arr[9]) : parseInt(arr[8] + arr[9])
                    this.agent.role.getBallFrom = {x: xPlayer, y: yPlayer}
                }
                break
            case Messages.sendMe:
                let playerId = parseInt(arr[2] + arr[3])
                if (this.agent.role.name === "attacker") {
                    let xPlayer = arr[4] === '-' ? (-1) * parseInt(arr[5] + arr[6]) : parseInt(arr[5] + arr[6])
                    let yPlayer = arr[7] === '-' ? (-1) * parseInt(arr[8] + arr[9]) : parseInt(arr[8] + arr[9])
                    this.agent.role.ballRequested = {x: xPlayer, y: yPlayer, playerId: playerId}
                }
                break
            case Messages.go:
                this.agent.role.go = true;
                break
        }
    }
}

module.exports = SoundProcessor