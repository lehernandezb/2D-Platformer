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

    k.loadSprite("level-1", "./level-1.png");

    k.scene("level-1", () => {
        k.setGravity(2100);
        k.add([
            k.rect(k.width(), k.height()),
            k.color(205,159,237),
            k.fixed(),
        ]);
    });

    k.go("level-1");
}

gameSetup();