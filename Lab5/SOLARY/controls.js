const {Messages, S} = require("./constValues");

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
        let result = msg.replace(/-/g, "z")
        result = result.replace(/\+/g, "q")
        this.agent.bridge.socketSend("say", `${result}`)
    }

    Catch(value) {
        this.agent.bridge.socketSend("catch", `${value}`)
    }

    KickWithAngle(value, angle) {
        this.agent.bridge.socketSend("kick", `${value} ${angle}`)
    }
    Kick(value) {
        this.agent.bridge.socketSend("kick", `${value}`)
    }
    SayGo() {
        let message =
            this.agent.team.charAt(0) + Messages.go
        this.Say(message);
    }
    SayGoTo(target, x, y) {
        if (target === "a") {
            target = 99;
        }
        let message =
            this.agent.team.charAt(0) + Messages.goto +
            (target < 10 ? "0" + target : target) +
            (x < 0 ? (x > -10 ? "-0" + Math.abs(x) : "-" + Math.abs(x)) : (x < 10 ? "+0" + x : "+" + x)) +
            (y < 0 ? (y > -10 ? "-0" + Math.abs(y) : "-" + Math.abs(y)) : (y < 10 ? "+0" + y : "+" + y))
        this.Say(message);
    }

    SaySwitchAttacker(id) {
        let message =
            this.agent.team.charAt(0) + Messages.switchAttacker +
            (id < 10 ? "0" + id : id)
        console.log(message)
        this.Say(message);
    }

    SayGetPass(id) {
        let x = Math.round(this.agent.environment.x);
        let y = Math.round(this.agent.environment.y);
        let message =
            this.agent.team.charAt(0) + Messages.getPass +
            (id < 10 ? "0" + id : id) +
            (x < 0 ? (x > -10 ? "-0" + Math.abs(x) : "-" + Math.abs(x)) : (x < 10 ? "+0" + x : "+" + x)) +
            (y < 0 ? (y > -10 ? "-0" + Math.abs(y) : "-" + Math.abs(y)) : (y < 10 ? "+0" + y : "+" + y))
        this.Say(message);
    }
    SaySendMe() {
        let x = Math.round(this.agent.environment.x);
        let y = Math.round(this.agent.environment.y);
        let id = this.agent.id
        let message =
            this.agent.team.charAt(0) + Messages.sendMe +
            (id < 10 ? "0" + id : id) +
            (x < 0 ? (x > -10 ? "-0" + Math.abs(x) : "-" + Math.abs(x)) : (x < 10 ? "+0" + x : "+" + x)) +
            (y < 0 ? (y > -10 ? "-0" + Math.abs(y) : "-" + Math.abs(y)) : (y < 10 ? "+0" + y : "+" + y))
        this.Say(message);
    }
}

module.exports = Controls;