const args = require('args-parser')(process.argv)
const Agent = require('./agent')
const socket = require('./socket')

if (args.team == null) args.team = "SOLARY"
if (args.x == null) args.x = -15
if (args.y == null) args.y = 0
if (args.version == null) args.version = 7
if (args.role == null) args.role = "unknown"

let agent = new Agent(args.team, args.role);
socket(agent.bridge)

agent.bridge.onConnectAction = () => {
    agent.bridge.socketSend("move", args.x+" "+args.y)
}

agent.bridge.connect(args)