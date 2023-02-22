const args = require('args-parser')(process.argv)
const Agent = require('./agent')
const readline = require("readline");
const socket = require('./socket')

if (args.team == null) args.team = "SOLARY"
if (args.x == null) args.x = -15
if (args.y == null) args.y = 0
if (args.version == null) args.version = 7
if (args.manager == null && args.manager !== "coach")
    args.manager = "coach"
else
    args.manager = "manual"

let agent = new Agent(args.team);
socket(agent.bridge)

rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

if (args.manager === "manual") {
    rl.on('line', (input) => {
        if ("w" === input) agent.act = () => agent.controls.Dash(100)
        else if ("d" === input) agent.act = () => agent.controls.Turn(20)
        else if ("a" === input) agent.act = () => agent.controls.Turn(-20)
        else if ("s" === input) agent.act = () => agent.controls.Kick(100)
        agent.act()
    })
}else{
    rl.on('line', (input) => {
        agent.controls.ParseCoachMSG(input);
    })
}

agent.bridge.onConnectAction = () => {
    agent.controls.Move(args.x, args.y)
}

agent.bridge.connect(args)