const BEFORE_ACTION = "beforeAction";

function ATManager() {
    const Remember = require("../Remember")();

    return {
        setHear(input) {
            Remember.setHear(input);
        },
        getAction(input, agent) {
            let remember = Remember.setSee(input, agent.team, agent.side);
            this.incTimers(remember, agent.at);

            if (agent.at.actions[BEFORE_ACTION]) {
                agent.at.actions[BEFORE_ACTION](remember, agent.at.state);
            }

            return this.execute(remember, agent.at);
        },
        incTimers(remember, at) {
            if (!this.lastTime) {
                this.lastTime = 0;
            }
            if (remember.time > this.lastTime) {
                this.lastTime = remember.time;
                for (let key in at.state.timers) {
                    at.state.timers[key] = at.state.timers[key] + 1;
                }
            }
        },
        execute(remember, at) {
            if (at.state.synch) {
                let cond = at.state.synch.slice(0, at.state.synch.length - 1);
                return at.actions[cond](remember, at.state);
            }
            if (at.state.next) {
                if (at.nodes[at.current]) return this.nextState(remember, at);
                if (at.edges[at.current]) return this.nextEdge(remember, at);
            }
            if (at.nodes[at.current]) return this.executeState(remember, at);
            if (at.edges[at.current]) return this.executeEdge(remember, at);
        },
        nextState(remember, at) {
            let node = at.nodes[at.current];
            for (let name of node.e) {
                let edgeName = `${node.n}_${name}`;
                let edge = at.edges[edgeName];
                for (let e of edge) {
                    if (e.guard) {
                        let guard = true;
                        for (let g of e.guard) {
                            if (!this.guard(remember, at, g)) {
                                guard = false;
                                break;
                            }
                        }
                        if (!guard) {
                            continue;
                        }
                    }
                    if (e.synch) {
                        if (e.synch.endsWith("?")) {
                            let cond = e.synch.slice(0, e.synch.length - 1);
                            if (!at.actions[cond](remember, at.state)) {
                                continue;
                            }
                        }
                    }
                    at.current = edgeName;
                    at.state.next = false;
                    return this.execute(remember, at);
                }
            }
        },
        nextEdge(remember, at) {
            let arr = at.current.split("_");
            at.current = arr[1];
            at.state.next = false;
            return this.execute(remember, at);
        },
        executeState(remember, at) {
            let node = at.nodes[at.current];
            if (at.actions[node]) {
                let action = at.actions[node](remember, at.state);

                if (!action && at.state.next) {
                    return this.execute(remember, at);
                }

                return action;
            } else {
                at.state.next = true;
                return this.execute(remember, at);
            }
        },
        executeEdge(remember, at) {
            let edges = at.edges[at.current];
            for (let e of edges) {
                if (e.guard) {
                    let guard = true;
                    for (let g of e.guard) {
                        if (!this.guard(remember, at, g)) {
                            guard = false;
                            break;
                        }
                    }
                    if (!guard) continue;
                }

                if (e.assign) {
                    for (let a of e.assign) {
                        if (a.type === "timer") {
                            if (!at.state.timers[a.n]) {
                                return;
                            }
                            at.state.timers[a.n] = a.v;
                        } else {
                            if (!at.state.variables[a.n]) return;
                            at.state.variables[a.n] = a.v;
                        }
                    }
                }
                if (e.synch) {
                    if (e.synch.endsWith("!")) {
                        let cond = e.synch.slice(0, e.synch.length - 1);
                        let actionRes = at.actions[cond](remember, at.state);

                        if (!actionRes) {
                            at.state.next = true;
                            return this.execute(remember, at);
                        }

                        return actionRes;
                    }
                }
            }
            at.state.next = true;
            return this.execute(remember, at);
        },

        guard(remember, at, g) {
            function atStateObject(o, at) {
                if (typeof o == "object") {
                    return o.v ? at.state.variables[o.v] : at.state.timers[o.t];
                } else {
                    return o;
                }
            }

            let leftValue = atStateObject(g.l, at);
            let rightValue = atStateObject(g.r, at);

            switch (g.s) {
                case "lt":
                    return leftValue < rightValue;
                case "eq":
                    return leftValue === rightValue;
                case "lte":
                    return leftValue <= rightValue;
                default:
                    return leftValue > rightValue;
            }
        }
    }
}

module.exports = ATManager;