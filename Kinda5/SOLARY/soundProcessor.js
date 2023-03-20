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
        }
    }

    processRefereeMessage() {
        this.agent.gamemode = this.msg
        if (this.agent.gamemode.startsWith("goal_")) {
            this.agent.run = false
        }
        if (this.agent.gamemode === "play_on") {
            this.agent.run = true
        }
    }
}

module.exports = SoundProcessor