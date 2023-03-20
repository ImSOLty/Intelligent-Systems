function Remember() {
    return {
        state: {team: [], enemyTeam: []},
        setHear(input) {
        },
        parseInput(object) {
            if (!object) {
                return null;
            }
            const parsedData = {f: object.cmd.p.join("")};
            if (object.p.length === 1) {
                parsedData.angle = object.p[0];
            } else {
                parsedData.dist = object.p[0];
                parsedData.angle = object.p[1];
            }
            return parsedData;
        },
        setSee(input, team, side) {
            this.state.time = input[0];
            this.state.ball = this.parseInput(input.find((obj) => obj.cmd && obj.cmd.p[0] === "b"));
            let gr = this.parseInput(input.find((obj) => obj.cmd && obj.cmd.p.join("") === "gr"));
            let gl = this.parseInput(input.find((obj) => obj.cmd && obj.cmd.p.join("") === "gl"));
            this.state.goalOwn = side === "l" ? gl : gr;
            this.state.goal = side === "l" ? gr : gl;
            this.state.lookAroundFlags = {
                fprb: this.parseInput(input.find((obj) => obj.cmd && obj.cmd.p.join("") === "fprb")),
                fprc: this.parseInput(input.find((obj) => obj.cmd && obj.cmd.p.join("") === "fprc")),
                fprt: this.parseInput(input.find((obj) => obj.cmd && obj.cmd.p.join("") === "fprt")),
            };

            this.state.team = input
                .filter((obj) => obj.cmd && obj.cmd.p[0] === "p" && obj.cmd.p.includes(team))
                .map((obj) => this.parseInput(obj));
            this.state.enemyTeam = input
                .filter((obj) => obj.cmd && obj.cmd.p[0] === "p" && !obj.cmd.p.includes(team))
                .map((obj) => this.parseInput(obj));

            return this.state;
        }
    }
}

module.exports = Remember;