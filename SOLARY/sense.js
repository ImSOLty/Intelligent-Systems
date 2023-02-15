class Sense {
    constructor() {
        this.viewQuality = ""
        this.viewWidth = ""
        this.stamina = 0
        this.effort = 1
        this.speed = 0
        this.speedDirection = 0
        this.headAngle = 0
        this.kick = 0
        this.dash = 0
        this.turn = 0
        this.turnNeck = 0
        this.say = 0
        this.catch = 0
        this.move = 0
        this.changeView = 0
    }

    analyze(cmd, p) {
        if (cmd !== "sense_body")
            return
        for(let i of p){
            switch (i.cmd){
                case "view_mode":   {this.viewQuality = i.p[0]; this.viewWidth = i.p[1]; break;}
                case "stamina":     {this.stamina = i.p[0];     this.effort = i.p[1]; break;}
                case "speed":       {this.speed = i.p[0];       this.speedDirection = i.p[1]; break;}
                case "head_angle":  {this.headAngle = i.p[0];   break;}
                case "kick":        {this.kick = i.p[0];        break;}
                case "dash":        {this.dash = i.p[0];        break;}
                case "turn":        {this.turn = i.p[0];        break;}
                case "say":         {this.say = i.p[0];         break;}
                case "turn_neck":   {this.turnNeck = i.p[0];    break;}
                case "catch":       {this.catch = i.p[0];       break;}
                case "move":        {this.move = i.p[0];        break;}
                case "change_view": {this.changeView = i.p[0];  break;}
                default: //console.log(`${i} :(`);
            }
        }
    }
}
module.exports = Sense