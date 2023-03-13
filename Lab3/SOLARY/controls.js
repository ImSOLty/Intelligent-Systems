class Controls {
    constructor(agent) {
        this.agent = agent
        this.type = [];
    }

    Move(x, y) {
        this.agent.bridge.socketSend("move", `${x} ${y}`)
    }

    Dash(value) {
        this.agent.bridge.socketSend("dash", `${value}`)
    }

    Turn(angle) {
        this.agent.bridge.socketSend("turn", `${angle}`)
    }

    Say(msg) {
        this.agent.bridge.socketSend("say", `${msg}`)
    }

    Catch(value) {
        this.agent.bridge.socketSend("catch", `${value}`)
    }

    KickWithAngle(value, angle) {
        this.agent.bridge.socketSend("kick", `${value} ${angle}`)
    }
}

module.exports = Controls;