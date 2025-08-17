import type { GameObj } from "kaboom";
import { scale } from "./constants";
import { makeGuyEnemy, makePlayer, setControls } from "./entities";
import {k} from "./kaboomCtx";
import { makeMap } from "./utils";


function to2DArray(flatArray: number[], width: number): number[][] {
    const result: number[][] = [];
    for (let i = 0; i < flatArray.length; i += width) {
        result.push(flatArray.slice(i, i + width));
    }
    return result;
}



// game play functuion
async function gameSetup() {

    // Loading in sprites from png map and giving them variables
    k.loadSprite("assets", "./spookyCharacters.png", {
        sliceX: 9,
        sliceY: 5,
        anims: {
            spookIdle: 0,
            spookShooting: 1,
            spookLow: 2,
            spookBeam: {from: 10, to: 17, speed: 10, loop: true},
            guyWalk: {from: 18, to: 19, speed: 4, loop: true}
        }
    });

    // loading levels
    k.loadSprite("level-1", "./level-1.png");
    k.loadSprite("level-2", "./level-2.png");

    k.add([k.rect(k.width(), k.height()), k.color(0, 0, 0), k.fixed()]);

    //loading maps
    const {map: level1Layout, spawnPoints: level1SpawnPoints} = await makeMap(
        k,
        "level-1"
    );

    const {map: level2Layout, spawnPoints: level2SpawnPoints} = await makeMap(
        k,
        "level-2"
    );


    // Scene creating function
    async function createlevel (
        levelLayout: GameObj,
        levelSpawnPoints: { [key: string]: { x: number; y: number; }[] },
        Level: string,
        tmjFile: string,
        cameSize : number,
        numbersForCam : number[]
    ) {
        k.setGravity(2100);
        k.add([
            k.rect(k.width(), k.height()),
            k.color(205,159,237),
            k.fixed(),
        ]);

        k.add(levelLayout);

        const ghost = makePlayer(
            k, 
            levelSpawnPoints.player[0].x,
            levelSpawnPoints.player[0].y
        );

        // Adding player
        k.add(ghost);
        setControls(k, ghost);

        // Health bar background
        const healthBarBg = k.add([
            k.rect(104, 14),     
            k.pos(10, 10),       
            k.color(0, 0, 0),     
            k.fixed(),           
            k.z(100),             
        ])

        // Actual health bar (foreground)
        const healthBar = k.add([
            k.rect(100, 10),
            k.pos(12, 12),        
            k.color(180, 55, 87),   
            k.fixed(),
            k.z(101),
            { max: 4, current: ghost.health } // store data
        ])

        function updateHealthBar(current: number) {
            const percent = current / healthBar.max
            healthBar.width = 100 * percent
            healthBar.color = percent < 0.3 ? k.rgb(49, 20, 50) : k.rgb(180, 55, 87)
        }

        // When player is hurt
        ghost.onHurt(() => {
            updateHealthBar(ghost.hp())
        })

        // When player is healed
        ghost.onHeal(() => {
            updateHealthBar(ghost.hp())
        })

        k.add([
            k.text(Level, {
                size: 16,
                font: "Trebuchet MS",
            } ),
            k.pos(120,11.5),
            k.fixed(),
            k.color(0,0,0),
            k.z(102),
        ]);

        // Setting cam size
        k.camScale(cameSize, cameSize);
        k.camPos(numbersForCam[4], numbersForCam[5]);


        k.onUpdate(() => {
            if ((ghost.pos.x < levelLayout.pos.x + numbersForCam[0]) && (ghost.pos.x > levelLayout.pos.x + numbersForCam[1])){
                k.camPos(ghost.pos.x + 500, k.camPos().y);
            }
        });

        k.onUpdate(() => {
            if ((ghost.pos.y < levelLayout.pos.y + numbersForCam[2]) && (ghost.pos.y > levelLayout.pos.y + numbersForCam[3])){
                k.camPos(k.camPos().x, ghost.pos.y );
            }

        });
        // Load the map file
        const response = await fetch(tmjFile);
        const mapData = await response.json();

        // Find the platform layer
        const platformLayer = mapData.layers.find((layer: any) => layer.name === "platform");

        // Access the data array
        const platform2D = to2DArray(platformLayer.data, 27);

        // Adding guyEnemy to the game
        for (const guy of levelSpawnPoints.Guy) {
          makeGuyEnemy(k, guy.x, guy.y,platform2D);
        }
    }

    // loading scene 1
    k.scene("level-1", async () => {
        await createlevel(level1Layout, level1SpawnPoints, "level - 1", "./level-1.tmj", 0.7, [432, 230, 672, 420, 730, 700]);
    });

    // loading scene 2
    k.scene("level-2", async () => {
        await createlevel(level2Layout, level2SpawnPoints, "level - 2", "./level-2.tmj", 0.7, [1960, 230, 900, 420, 730, 900]);
    });


    // Starting in level one 
    k.go("level-1");
}

gameSetup();
