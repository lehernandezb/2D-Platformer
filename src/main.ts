import { makePlayer } from "./entities";
import {k} from "./kaboomCtx";
import { makeMap } from "./utils";

// game play functuion
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

    // loading first level
    k.loadSprite("level-1", "./level-1.png");

    //loading map
    const {map: level1Layout, spawnPoints: level1SpawnPoints} = await makeMap(
        k,
        "level-1"
    );

    // loading scene
    k.scene("level-1", () => {
        k.setGravity(2100);
        k.add([
            k.rect(k.width(), k.height()),
            k.color(205,159,237),
            k.fixed(),
        ]);

        k.add(level1Layout);

        const ghost = makePlayer(
            k, 
            level1SpawnPoints.player[0].x,
            level1SpawnPoints.player[0].y
        );

        k.add(ghost);

        k.camScale(0.7, 0.7);
        k.onUpdate(() => {
            if (ghost.pos.x < level1Layout.pos.x + 432){
                k.camPos(ghost.pos.x + 500, 800);
            }
        });
    });

    k.go("level-1");
}

gameSetup();