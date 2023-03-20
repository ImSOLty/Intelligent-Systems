const {Messages} = require("./constValues");

class Controls {
    constructor(agent) {
        this.agent = agent
        this.type = [];
    }

    static Move(x, y) {
        return {n: 'move', v: `${x} ${y}`}
    }

    static Dash(value) {
        return {n: 'dash', v: `${value}`}
    }

    static Turn(angle) {
        return {n: 'turn', v: `${angle}`}
    }

    static Say(msg) {
        let result = msg.replace(/-/g, "z")
        result = result.replace(/\+/g, "q")
        return {n: 'say', v: `${result}`}
    }

    static Catch(value) {
        return {n: 'catch', v: `${value}`}
    }

    static KickWithAngle(value, angle) {
        return {n: "kick", v: `${value} ${angle}`}
    }

    static Kick(value) {
        return {n: "kick", v: `${value}`}
    }

    SayGo() {
        let message =
            this.agent.team.charAt(0) + Messages.go
        return Controls.Say(message);
    }

    PerformAction(action) {
        this.agent.bridge.socketSend(action.n,action.v)
    }
}

module.exports = Controls;