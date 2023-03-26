const {ActV} = require("../constValues");

class Manager {
    constructor(agent) {
        this.agent = agent
        this.at = agent.player_at;
    }

    getAction() {
        return this.execute()
    }

    execute() {
        if (this.at.memoryUpdateGuard()) {
            this.at.next = false;
            this.at.current = "memoryUpdate_start"
        }
        if (this.at.next) {
            if (this.at.nodes[this.at.current]) return this.nextState()
            if (this.at.edges[this.at.current]) return this.nextEdge()
        }
        if (this.at.nodes[this.at.current]) return this.executeState()
        if (this.at.edges[this.at.current]) return this.executeEdge()
    }

    nextState() {
        let node = this.at.nodes[this.at.current]
        for (let name of node.e) {
            let edgeName = `${node.n}_${name}`
            let edge = this.at.edges[edgeName]
            if (!edge.guard || edge.guard(this.at.memory)) {
                console.log("Found:" + edgeName)
                this.at.current = edgeName;
                if (!edge.guard)
                    this.at.next = true;
                else
                    this.at.next = false
                return this.execute()
            }
        }
        this.at.current = this.at.at_term.n;
        this.at.next = this.at.at_term.next;
        return this.execute();
    }

    nextEdge() {
        this.at.current = this.at.current.split("_")[1]
        this.at.next = false
        return this.execute()
    }

    executeState() {
        let node = this.at.nodes[this.at.current]
        if (this.at.actions[node.n]) {
            this.at.action = this.at.actions[node.n];
            if (!this.at.action && this.at.next)
                return this.execute()
            this.at.next = true
            return this.at.action
        } else {
            this.at.next = true;
            return this.execute()
        }
    }

    executeEdge() {
        let edge = this.at.edges[this.at.current]
        if (edge.guard && edge.guard(this.at.memory) && edge.action) {
            this.at.next = false;
            this.at.action = this.at.actions[edge.action];
            return this.at.action
        }
        this.at.action = null;
        this.at.next = true;
        return this.execute()
    }
}

module.exports = Manager