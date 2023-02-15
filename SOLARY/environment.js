const Flags = require("./constValues")

class Environment {
    constructor(agent) {
        this.agent = agent
        this.x = null
        this.y = null
        this.angle = 90
        this.objects = null
    }

    analyze(cmd, p) {
        if (cmd !== "see")
            return
        for (let i of p) {
            if (typeof (i) == "object")
                this.parseObjInfo(i)
        }
        this.processObjs(p)
    }

    parseObjInfo(objInfo) {

        let cmd = objInfo.cmd

        let tmpFlagType = cmd.p.join("")
        objInfo.x = Flags[tmpFlagType] ? Flags[tmpFlagType].x : null
        objInfo.y = Flags[tmpFlagType] ? Flags[tmpFlagType].y : null

        //Type detect
        if (objInfo.x) objInfo.type = "flag"
        if (tmpFlagType === "b") objInfo.type = "ball"
        if (cmd.p[0] === "p") {
            if (cmd.p.length > 1) {
                objInfo.team = cmd.p[1]
                objInfo.type = objInfo.team === this.agent.team ? "ally" : "enemy"
            }
            if (cmd.p.length > 2) objInfo.number = parseInt(cmd.p[2])
            objInfo.goalie = cmd.p.length > 3
        }

        //Parse Info
        let p = objInfo.p

        objInfo.direction = p.length > 1 ? p[1] : p[0]
        objInfo.distance = p.length >= 2 ? p[0] : null
        objInfo.distanceChange = p.length >= 4 ? p[2] : null
        objInfo.directionChange = p.length >= 4 ? p[3] : null
        objInfo.bodyFacingDirection = p.length >= 6 ? p[4] : null
        objInfo.headFacingDirection = p.length >= 6 ? p[5] : null
    }

    processObjs(objs) {
        let flags = objs.filter(o => o.x)
        flags.sort((a, b) => {
            return a.distance - b.distance;
        })

        let minError = null
        let bestCoords = null

        //Find my coords
        let i = 0
        while (true) {
            let cFlags = flags.slice(i, flags.length)
            let coo = this.calcMyCoords(cFlags)
            if (coo == null) break

            let error = 0
            for (let flag of flags) {
                let estimated = Flags.distance(coo, {x: flag.x, y: flag.y})
                error = Math.max(Math.abs(estimated - flag.distance), error)
            }

            if (!minError || minError > error) {
                minError = error
                bestCoords = coo
            }
            i++
        }
        this.x = bestCoords ? bestCoords.x : null
        this.y = bestCoords ? bestCoords.y : null

        console.log("Me: " + this.x + " " + this.y)

        //Find obj coords
        if (!this.x) {
            return null
        }
        minError = null
        let bestZeroVec = null
        for (let flag of flags) {
            let zeroVec = this.rotate(this.calcNormalVec(flag), flag.direction)
            let error = 0

            for (let flag2 of flags) {
                let fVec = this.calcNormalVec(flag2);
                let estimated = Math.acos(zeroVec.x * fVec.x + zeroVec.y * fVec.y)
                error = Math.max(Math.abs(estimated - flag.direction * Math.PI / 180), error)
            }

            if (!minError || minError > error) {
                minError = error
                bestZeroVec = zeroVec
            }
        }

        //Set obj data
        for (let o of objs) {
            if (typeof (o) != "object") {
                continue
            }
            let vec = this.rotate(bestZeroVec, -o.direction)
            o.x = this.x + vec.x * o.distance;
            o.y = this.y + vec.y * o.distance;
            if (o.type === "enemy")
                console.log("Enemy: " + o.x + " " + o.y)
        }
    }

    calcMyCoords(flags) {
        if (flags.length < 2) return null

        let f1 = flags[0], f2 = flags[1]
        let d = Flags.distance({x: f1.x, y: f1.y}, {x: f2.x, y: f2.y})
        let alpha = (f1.direction - f2.direction) / 180 * Math.PI

        if (!f1.distance || !f2.distance) return null
        let d1 = f1.distance, d2 = f2.distance

        if (alpha < 0) {
            [f1, f2] = [f2, f1];
            [d1, d2] = [d2, d1]
        }
        let xt = f2.x - f1.x, yt = f2.y - f1.y
        let len = Math.sqrt(xt ** 2 + yt ** 2)
        xt = xt / len
        yt = yt / len
        let cos_b = Math.min(1, Math.max(-1, (d ** 2 + d1 ** 2 - d2 ** 2) / (2 * d * d1)));//Clamp
        let sin_b = Math.sqrt(Math.abs(1 - cos_b ** 2))
        return {
            x: f1.x + (xt * cos_b - yt * sin_b) * d1,
            y: f1.y + (xt * sin_b + yt * cos_b) * d1
        }
    }

    calcNormalVec(flag) {
        let v = {
            x: flag.x - this.x,
            y: flag.y - this.y
        }
        let len = Math.sqrt(v.x ** 2 + v.y ** 2)
        v.x /= len
        v.y /= len
        return v
    }

    rotate(v, objDir) {
        let angle = objDir * (Math.PI / 180)
        return {
            x: v.x * Math.cos(angle) - v.y * Math.sin(angle),
            y: v.x * Math.sin(angle) + v.y * Math.cos(angle),
        }
    }
}

module.exports = Environment;