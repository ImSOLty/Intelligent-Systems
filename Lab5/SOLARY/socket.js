const dgram = require('dgram')
module.exports = function (bridge){
    const socket = dgram.createSocket({type: 'udp4', reuseAddr: true})
    bridge.setSocket(socket)

    socket.on('message', (msg)=>{
        bridge.msgGot(msg)
    })
    socket.on('error', (err)=>{
        console.log(`Server Error: ${err.stack}`)
        socket.close()
    })

    socket.sendMsg = function (msg){
        socket.send(Buffer.from(msg), 6000, 'localhost', (err, bytes)=>{
            if(err) throw err
        })
    }
}