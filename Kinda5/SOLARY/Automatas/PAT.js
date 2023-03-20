const Controls = require("../controls");
const {ActV} = require("../constValues");
module.exports = {
    current: "start",
    state: {
        variables: {dist: null, angle: null},
        timers: {t: 0},
        next: true,
        synch: null,
        local: {},
    },
    nodes: {
        start: {n: "start", e: ["close", "near"]},
        close: {n: "close", e: ["kick"]},
        kick: {n: "kick", e: ["start"]},
        near: {n: "near", e: ["intercept", "start"]},
        intercept: {n: "intercept", e: ["start"]},
    },
    edges: {
        start_close: [{guard: [{s: "lte", l: {v: "dist"}, r: 0.5}]}],
        start_near: [{guard: [{s: "gt", l: {v: "dist"}, r: 0.5}]}],
        close_kick: [{synch: "kick!"}],
        kick_start: [{}],
        near_start: [{synch: "empty!"}],
        near_intercept: [{synch: "canIntercept?"}],
        intercept_start: [{synch: "runToBall!"}]
    },
    actions: {
        init(remember, state) {
            state.local.goalie = true;
            state.local.catch = 0;
        },
        beforeAction(remember, state) {
            if (remember.ball) state.variables.dist = remember.ball.dist
        },
        kick(remember, state) {
            state.next = true;
            if (!remember.ball) {
                return;
            }
            let dist = remember.ball.dist;
            if (dist > 0.5) {
                return;
            }
            if (remember.goal != null) {
                if(remember.goal.dist>ActV.GOAL_DISTANCE){
                    return Controls.KickWithAngle(ActV.DRIBBLE_FORCE, remember.goal.angle)
                }
                return Controls.KickWithAngle(ActV.KICK_FORCE, remember.goal.angle)
            }
            return Controls.KickWithAngle(ActV.DRIBBLE_FORCE, ActV.SEARCH_ANGLE)
        },
        canIntercept(remember, state) {
            let ball = remember.ball;
            state.next = true;
            if (!ball) return false;
            return ball.dist > ActV.DISTANCE_PRECISION;
        },
        runToBall(remember, state) {
            state.next = false;
            let ball = remember.ball;
            if (!ball) {
                return Controls.Turn(ActV.SEARCH_ANGLE)
            }
            if (ball.dist <= 0.5) {
                state.next = true;
                return
            }
            if (Math.abs(ball.angle) > ActV.ANGLE_PRECISION)
                return Controls.Turn(ball.angle)
            if (ball.dist < ActV.DISTANCE_PRECISION) {
                state.next = true;
                return
            }
            return Controls.Dash(ActV.MOVEMENT_SPEED)
        },
        ok(remember, state) {
            state.next = true;
            return Controls.Turn(0)
        },
        empty(remember, state) {
            state.next = true
        }
    }
};