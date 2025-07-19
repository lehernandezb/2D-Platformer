import {k} from "./kaboomCtx";

async function gameSetup() {

    // Loading in sprites from png map and giving them variables
    k.loadSprite("assets", "./spookyCharacter.png", {
        sliceX: 9,
        sliceY: 5,
        anims: {
            spookIdle: 0,
            spookShooting: 1,
            spookLow: 2,
            spookBeam: {from: 10, to: 17, speed: 15, loop: true},
            guyWalk: {from: 19, to: 20, speed: 4, loop: true}
        }
    });
}

gameSetup();