class GOTO {
    constructor(targetPos, withBall) {
        this.target = targetPos;
        this.name = "GOTO"
        this.withBall = withBall;
    }
}

class REACHFOLLOW {
    constructor(type, perm, team = null, id = null) {
        this.target = null;
        this.team = team;
        this.id = id;
        if(perm)
            this.name = "FOLLOW"
        else
            this.name = "REACH"
        this.type = type;
    }

    equals(element) {
        if (this.type !== element.type) {
            return false;
        }
        switch (this.type) {
            case "ball":
                return true;
            case "player":
                return this.team === element.team && this.id === element.number;
        }
    }
}

module.exports = {
    GOTO: GOTO,
    REACHFOLLOW: REACHFOLLOW
}
