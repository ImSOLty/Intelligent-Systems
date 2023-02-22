module.exports = {
    To2Dec(value) {
        return Math.round(value * 100) / 100;
    },
    calcNormalVec(from, to) {
        let v = {
            x: to.x - from.x,
            y: to.y - from.y
        }
        let len = Math.sqrt(v.x ** 2 + v.y ** 2)
        v.x /= len
        v.y /= len
        return v
    },
    calcDistance(from, to) {
        return Math.sqrt((from.x - to.x) ** 2 + (from.y - to.y) ** 2)
    }
}

