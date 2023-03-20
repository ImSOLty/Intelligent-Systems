const Controls = require('../controls')
const {ActV} = require("../constValues");

module.exports = {
    current: "start",
    state: {
        variables: {dist: null},
        timers: {t: 0},
        next: true,
        synch: null,
        local: {},
    },
    nodes: {
        start: {n: "start", e: ["close", "near", "far"]},
        close: {n: "close", e: ["catch"]},
        catch: {n: "catch", e: ["kick"]},
        kick: {n: "kick", e: ["start"]},
        far: {n: "far", e: ["start"]},
        near: {n: "near", e: ["intercept", "start"]},
        intercept: {n: "intercept", e: ["start"]},
    },
    edges: {
        start_close: [{guard: [{s: "lt", l: {v: "dist"}, r: 1.5}]}],
        start_near: [{
            guard: [
                {s: "lt", l: {v: "dist"}, r: 20},
                {s: "lte", l: 2, r: {v: "dist"}},
            ],
        }],
        start_far: [{guard: [{s: "lte", l: 20, r: {v: "dist"}}]}],
        close_catch: [{synch: "catch!"}],
        catch_kick: [{synch: "kick!"}],
        kick_start: [
            {
                synch: "goBack!",
                assign: [{n: "t", v: 0, type: "timer"}]
            },
        ],
        far_start: [
            {
                guard: [{s: "lt", l: 20, r: {t: "t"}}],
                synch: "lookAround!",
                assign: [{n: "t", v: 0, type: "timer"}],
            },
            {
                guard: [{s: "lte", l: {t: "t"}, r: 20}],
                synch: "ok!",
            },
        ],
        near_start: [
            {
                synch: "empty!",
                assign: [{n: "t", v: 0, type: "timer"}],
            },
        ],
        near_intercept: [{synch: "canIntercept?"}],
        intercept_start: [
            {
                synch: "runToBall!",
                assign: [{n: "t", v: 0, type: "timer"}]
            },
        ],
    },
    actions: {
        init(remember, state) {
            state.local.catch = 0;
        },
        beforeAction(remember, state) {
            if (remember.ball) state.variables.dist = remember.ball.dist;
        },
        catch(remember, state) {
            if (!remember.ball) {
                state.next = true;
                return;
            }
            let angle = remember.ball.angle;
            let dist = remember.ball.dist;
            state.next = false;
            if (dist > ActV.DISTANCE_PRECISION) {
                if (state.local.catch < 3) {
                    state.local.catch++;
                    return Controls.Catch(angle);
                } else {
                    state.local.catch = 0
                }

                if (Math.abs(angle) > ActV.ANGLE_PRECISION) return Controls.Turn(angle);
                return Controls.Dash(ActV.WALK_SPEED);
            }
            state.next = true;
        },
        kick(remember, state) {
            state.next = true;
            if (!remember.ball) return;

            let dist = remember.ball.dist;
            if (dist > ActV.DISTANCE_PRECISION) return;

            let goal = remember.goal;
            let player = remember.team ? remember.team[0] : null;
            let target;
            if (goal && player) target = goal.dist < player.dist ? goal : player;
            else if (goal) target = goal;
            else if (player) target = player;
            if (target)
                return Controls.KickWithAngle(target.dist * 2 + 40, target.angle)
            return Controls.KickWithAngle(ActV.KICK_FORCE, 180)
        },
        goBack(remember, state) {
            state.next = false;
            let goalOwn = remember.goalOwn;
            if (!goalOwn) return Controls.Turn(ActV.SEARCH_ANGLE);
            if (Math.abs(goalOwn.angle) > 2) return Controls.Turn(goalOwn.angle);
            if (goalOwn.dist < 2) {
                state.next = true;
                return Controls.Turn(180)
            }
            return Controls.Dash(goalOwn.dist * 2 + 20);
        },
        lookAround(remember, state) {
            state.next = false;
            state.synch = "lookAround!";

            if (!state.local.look) {
                if (!remember.lookAroundFlags.fprc) return Controls.Turn(ActV.SEARCH_ANGLE)
                state.local.look = "left";
                return Controls.Turn(remember.lookAroundFlags.fprc.angle)
            }

            switch (state.local.look) {
                case "left":
                    if (!remember.lookAroundFlags.fprc) return Controls.Turn(ActV.SEARCH_ANGLE)
                    state.local.look = "center";
                    return Controls.Turn(-ActV.SEARCH_ANGLE)
                case "center":
                    state.local.look = "right";
                    return Controls.Turn(ActV.SEARCH_ANGLE)

                case "right":
                    state.local.look = "back";
                    return Controls.Turn(ActV.SEARCH_ANGLE)
                case "back":
                    state.local.look = "left";
                    state.next = true;
                    state.synch = null;
                    return Controls.Turn(-ActV.SEARCH_ANGLE)
                default:
                    state.next = true;
                    return Controls.Turn(remember.lookAroundFlags.fprc.angle)
            }
        },
        canIntercept(remember, state) {
            let ball = remember.ball;
            state.next = true;
            if (!ball) return false;
            if (remember.enemyTeam) {
                const enemy = remember.enemyTeam.find((enemy) => {
                    let degrees =
                        Math.sign(enemy.angle) === Math.sign(ball.angle)
                            ? Math.max(Math.abs(enemy.angle), Math.abs(ball.angle)) -
                            Math.min(Math.abs(enemy.angle), Math.abs(enemy.angle))
                            : Math.abs(enemy.angle) + Math.abs(ball.angle);
                    const enemyDistanceToBall = Math.sqrt(
                        enemy.dist ** 2 +
                        ball.dist ** 2 -
                        2 * enemy.dist * ball.dist * Math.cos((degrees * Math.PI) / 180)
                    );
                    return enemyDistanceToBall < ball.dist;
                });
                return !enemy;
            }

            return !remember.ballPrev ? true : ball.dist <= ballPrev.dist + ActV.DISTANCE_PRECISION;
        },
        runToBall(remember, state) {
            state.next = false;
            let ball = remember.ball;
            if (!ball) return this.goBack(remember, state);
            if (ball.dist <= 2) {
                state.next = true;
                return;
            }
            if (Math.abs(ball.angle) > ActV.ANGLE_PRECISION) return Controls.Turn(ball.angle);
            if (ball.dist < 2) {
                state.next = true;
                return;
            }
            return Controls.Dash(ActV.MOVEMENT_SPEED);
        },
        ok(remember, state) {
            state.next = true;
            return Controls.Turn(0);
        },
        empty(remember, state) {
            state.next = true;
        }
    },
};