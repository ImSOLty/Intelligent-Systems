module.exports = {
    parseMsg(msg){
        if(msg.endsWith("\u0000"))
            msg = msg.substring(0, msg.length - "\u0000".length)
        let array = msg.match(/(\(|[-\d\.]+|[\\\"\w]+|\))/g)
        let res = {msg, p:[]}
        this.parse(array, {idx: 0}, res)
        this.makeCmd(res)
        return res
    },
    parse(array, index, res){
        if(array[index.idx]!="(")
            return
        index.idx++;
        this.parseInner(array, index, res)
    },
    parseInner(array, index, res) {
        while (array[index.idx] != ")") {
            if (array[index.idx] == "(") {
                let r = {p: []}
                this.parse(array, index, r)
                res.p.push(r)
            } else {
                let num = parseFloat(array[index.idx])
                res.p.push(isNaN(num) ? array[index.idx] : num)
                index.idx++
            }
        }
        index.idx++;
    },
    makeCmd(res) { // Выделение команды
        if (res.p && res.p.length > 0) {
            res.cmd = res.p.shift()
            for (let value of res.p)
                this.makeCmd(value)
        }
    }
}