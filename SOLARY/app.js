const args = require('args-parser')(process.argv)
const Agent = require('./agent')
const readline = require("readline");
const socket = require('./socket')

if (args.team == null) args.team = "SOLARY"
if (args.x == null) args.x = -15
if (args.y == null) args.y = 0
if (args.version == null) args.version = 7
if (args.manual == null) args.manual = false

let agent = new Agent(args.team);
socket(agent.bridge)

if (args.manual) {
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    rl.on('line', (input) => {
        if ("w" === input) agent.act = () => agent.Dash(100)
        else if ("d" === input) agent.act = () => agent.Turn(20)
        else if ("a" === input) agent.act = () => agent.Turn(-20)
        else if ("s" === input) agent.act = () => agent.Kick(100)
        agent.act()
    })
}

agent.bridge.onConnectAction = () => {
    console.log("connected")
    agent.Move(args.x, args.y)
}

agent.bridge.connect(args)