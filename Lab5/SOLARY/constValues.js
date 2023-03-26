const Flags = {
    ftl50: {x: -50, y: 39},
    ftl40: {x: -40, y: 39},
    ftl30: {x: -30, y: 39},
    ftl20: {x: -20, y: 39},
    ftl10: {x: -10, y: 39},
    ft0: {x: 0, y: 39},
    ftr10: {x: 10, y: 39},
    ftr20: {x: 20, y: 39},
    ftr30: {x: 30, y: 39},
    ftr40: {x: 40, y: 39},
    ftr50: {x: 50, y: 39},

    fbl50: {x: -50, y: -39},
    fbl40: {x: -40, y: -39},
    fbl30: {x: -30, y: -39},
    fbl20: {x: -20, y: -39},
    fbl10: {x: -10, y: -39},
    fb0: {x: 0, y: -39},
    fbr10: {x: 10, y: -39},
    fbr20: {x: 20, y: -39},
    fbr30: {x: 30, y: -39},
    fbr40: {x: 40, y: -39},
    fbr50: {x: 50, y: -39},

    flt30: {x: -57.5, y: 30},
    flt20: {x: -57.5, y: 20},
    flt10: {x: -57.5, y: 10},
    fl0: {x: -57.5, y: 0},
    flb10: {x: -57.5, y: -10},
    flb20: {x: -57.5, y: -20},
    flb30: {x: -57.5, y: -30},

    frt30: {x: 57.5, y: 30},
    frt20: {x: 57.5, y: 20},
    frt10: {x: 57.5, y: 10},
    fr0: {x: 57.5, y: 0},
    frb10: {x: 57.5, y: -10},
    frb20: {x: 57.5, y: -20},
    frb30: {x: 57.5, y: -30},
    // --
    fglt: {x: -52.5, y: 7.01},
    fglb: {x: -52.5, y: -7.01},
    gl: {x: -52.5, y: 0},
    gr: {x: 52.5, y: 0},
    fgrt: {x: 52.5, y: 7.01},
    fgrb: {x: 52.5, y: -7.01},
    fc: {x: 0, y: 0},
    fplt: {x: -36, y: 20.15},
    fplc: {x: -36, y: 0},
    fplb: {x: -36, y: -20.15},
    fprt: {x: 36, y: 20.15},
    fprc: {x: 36, y: 0},
    fprb: {x: 36, y: -20.15},
    flt: {x: -52.5, y: 34},
    fct: {x: 0, y: 34},
    frt: {x: 52.5, y: 34},
    flb: {x: -52.5, y: -34},
    fcb: {x: 0, y: -34},
    frb: {x: 52.5, y: -34},

    distance(p1, p2) {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
    }
}

const Messages = {
    switchAttacker: "a",// "a?id" team(1)+cmd(1)+newAttacker(2)
    coverMe: "b",// "b?0/1/2" team(1)+cmd(1)+player(2)+type(1)
    sendMe: "c", // "c" team(1)+cmd(1)+playerName(2)+x(3)+y(3)
    goto: "d", // "d?x?y" team(1)+cmd(1)+player(2)+x(3)+y(3)
    getPass: "e", // "e?x?y" team(1)+cmd(1)+player(2)+x(3)+y(3)
    go: "g"
}

const ActV = {
    ANGLE_PRECISION: 10,
    DISTANCE_PRECISION: 0.5,
    SEARCH_ANGLE: 90,
    WALK_SPEED: 75,
    MOVEMENT_SPEED: 100,
    RUN_SPEED: 120,
    DRIBBLE_FORCE: 25,
    KICK_FORCE: 70,
    KICKOUT_FORCE: 100,
    GOAL_DISTANCE: 25,
    INTERCEPT_DISTANCE: 5,
    FORCE_PER_DISTANCE: 2.3,
    UPDATE_MEMORY_DIFF: 10
}

module.exports = {
    Flags: Flags,
    Messages: Messages,
    ActV: ActV
}
