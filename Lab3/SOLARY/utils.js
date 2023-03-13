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
    },
    getAngleToTarget(pos, pDir, targetPos) {
        let v = {
            x: targetPos.x - pos.x,
            y: targetPos.y - pos.y
        }
        let len = Math.sqrt(v.x ** 2 + v.y ** 2)
        v.x /= len
        v.y /= len

        let angle = (-Math.atan2(v.y, v.x) - Math.atan2(pDir.y, pDir.x)) * 180 / Math.PI;
        if (angle > 180) angle -= 360
        if (angle < -180) angle += 360

        return angle;
    }
}

