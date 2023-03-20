class AgentBridge {
    constructor(agent) {
        this.agent = agent
        this.connected = false
        this.onConnectAction = function () {
        }
    }

    setSocket(socket) {
        this.socket = socket;
    }

    connect(args) {
        this.socket.sendMsg(`(init ${args.team} (version ${args.version})${args.role === "goalie" ? " (goalie)" : ""})`)
    }

    onConnect() {
        this.connected = true
        this.onConnectAction()
    }

    socketSend(cmd, value) {
        this.socket.sendMsg(`(${cmd} ${value})`)
    }

    msgGot(msg) {
        if (!this.connected) {
            this.onConnect()
        }
        let data = msg.toString()
        this.agent.processMsg(data)
    }

    disconnect() {
        this.connected = false
        this.agent.socketSend(`bye`)
    }
}

module.exports = AgentBridge