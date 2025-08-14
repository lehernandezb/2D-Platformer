import type { AreaComp, BodyComp, DoubleJumpComp, GameObj, HealthComp, KaboomCtx, OpacityComp, PosComp, ScaleComp, SpriteComp } from "kaboom";
import { scale } from "./constants";

// Reducing magic numbers
const targetOpacityAfterHit: number = 0;
const targetOpacityWhenRecovering = 1;
const timingOfOpacityChange: number = 0.05;

// Player object
type PlayerGameObj = GameObj<
    SpriteComp &
    AreaComp &
    BodyComp &
    PosComp &
    ScaleComp &
    DoubleJumpComp &
    HealthComp &
    OpacityComp & {
        speed: number;
        direction: String;
        isShooting: boolean;
        isEmpty: boolean;
    }
>;




/**
 * Method to make player and their logic
 * 
 * @param k KaboomCtx
 * @param posx postion of player on x axis
 * @param posy postion of player on y axis
 */
export function makePlayer(k : KaboomCtx, posx : number, posy : number) {

    // Player object
    const player = k.make([
        k.sprite("assets", {anim : "spookIdle"}),
        k.area({shape : new k.Rect(k.vec2(4,5.9), 26 , 26)}),
        k.body(),
        k.pos(posx * scale, posy * scale),
        k.scale(3),
        k.doubleJump(3),
        k.health(4),
        k.opacity(1),
        {
            speed: 300,
            direction: 'right',
            isShooting: false,
            isEmpty: false,
            health: 4
        },
        "player",
        
    ]);

    // Player collide physics
    player.onCollide("enemy", async (enemy: GameObj) => {

        // player runs out of shooting gas
        if (player.isShooting && player.isEmpty) {
            player.isShooting = false;
            k.destroy(enemy);
            player.isEmpty = true;
            return;
        }

        // Player dies
        if (player.hp() === 1) {
            k.destroy(player);
            k.go("level-1");
            return;
        }

        // Player hurt
        player.hurt();

        // Player flash effect
        await k.tween(
            player.opacity,
            targetOpacityAfterHit,
            timingOfOpacityChange,
            (val) => (player.opacity = val),
            k.easings.linear
        );
        await k.tween(
            player.opacity,
            targetOpacityWhenRecovering,
            timingOfOpacityChange,
            (val) => (player.opacity = val),
            k.easings.linear
        );

    })

    // Going to next level
    player.onCollide("exit", () => {
        k.go("level-2");
    });

    // Shooting animation, will always be on, only changed opacity
    const shootingEffect = k.add([
        k.sprite("assets", {anim: "spookBeam"}),
        k.pos(),
        k.scale(scale),
        k.opacity(0),
        "shootingEffect"
    ]);

    // Shooting hitbox
    const shootingZone = player.add([
        k.area({shape: new k.Rect(k.vec2(0), 40, 15)}),
        k.pos(),
        "shootingZone"
    ]);

    // Shooting zone
    shootingZone.onUpdate(() => {

        // If player is looking left
        if (player.direction === "left") {
            shootingZone.pos = k.vec2(-35, 9);
            shootingEffect.pos = k.vec2(player.pos.x - 100, player.pos.y - 20);
            shootingEffect.flipX = true;
            return;
        }

        // If player is looking right
        shootingZone.pos = k.vec2(32,9);
        shootingEffect.pos = k.vec2(player.pos.x + 100, player.pos.y - 20);
        shootingEffect.flipX = false;
    });

    // If player falls then respon (AKA death)
    player.onUpdate(() =>{
        if (player.pos.y > 2000) {
            k.go("level-1");
        }
    });

    return player;
}

/**
 * Function used to create the controls for the user.
 * 
 * @param k 
 * @param player 
 */
export function setControls(k: KaboomCtx, player: PlayerGameObj) {

    // Grabing shooting effect
    const shootingEffectRef = k.get("shootingEffect")[0];

    // Function acitvates when a key is down
    k.onKeyDown((key) => {

        // Diffrent keys
        switch (key){
            case "a":
                player.direction = "left";
                player.flipX = true;
                player.move(-player.speed, 0);
                break;
            case "d":
                player.direction = "right";
                player.flipX = false;
                player.move(player.speed, 0);
                break;
            case "shift":
                if (player.isEmpty) {
                    player.play("spookLow");
                    shootingEffectRef.opacity = 0;
                    break;
                } 

                player.isShooting = true;
                player.play("spookShooting");
                shootingEffectRef.opacity = 1;
                break;

            default:            

        }
    });

    // Function acitvates when a key is pressed
    k.onKeyPress((key) => {
        if (key ==="space") { player.doubleJump();}
    });

    // Function acitvates when a key is released
    k.onKeyRelease((key) => {
        if (key === "shift") {
            if (player.isEmpty) {
                player.play("shootingEffect")
                k.wait(1, () => {
                player.isEmpty = false;
                player.play("spookIdle")
            })
            }
            shootingEffectRef.opacity = 0;
            player.isEmpty = false;
            player.isShooting = false;
            player.play("spookIdle")
        }
    });
}


/**
 * Functionm handles how to get rid of an enemy if they are shootable.
 * 
 * @param k 
 * @param enemy 
 */
export function makeShootable(k: KaboomCtx, enemy: GameObj) {

    // If enemy is in shooting zone
    enemy.onCollide("shootingZone", () => {
        enemy.isShotable = true;
    });

    // When they stop colliding the enemy is no longer shotable
    enemy.onCollideEnd("shootingZone", () => {
        enemy.isShotable = false;
    });

    // Moving the enemy off screan "killing" them
    const playerRef = k.get("player")[0];
    enemy.onUpdate(() => {
        if (playerRef.isShooting && enemy.isShotable){
            k.destroy(enemy);
        }
    });
}


/**
 * Make the guy Enemy and their walking physics
 * 
 * @param k 
 * @param posX 
 * @param posY 
 * @param platformData Array of platform data from map
 * @returns 
 */
export function makeGuyEnemy(k: KaboomCtx, posX: number, posY: number, platformData: number[][]) {

    // Creating guy object
    const guy = k.add([
        k.sprite("assets", {anim: "guyWalk"}),
        k.scale(3),
        k.pos(posX * scale, posY * scale),
        k.area({
            shape: new k.Rect(k.vec2(2,3.9), 23, 24),
            collisionIgnore: ["enemy"],
        }),
        k.body(),
        k.state("idle", ["idle", "left", "right"]),
        { isShootable: false, speed: 100},
        "enemy"
    ]);

    // Checks if there is a platform to the left or right of the enemy, and if they should walk on it
    const platformCheck = (check: string) => {

        // magic numbers
        const tileSize: number = 16 * scale;
        const tileX: number = Math.floor(guy.pos.x / tileSize); // colummn
        const tileY: number = Math.floor(guy.pos.y / tileSize) + 1; // row
        let output: number = 4;

        if (check === "left") {
            for (let i = 1; i <= 4; i++) {
                let idx = tileX - i;
                if (
                    idx >= 0 &&
                    idx < platformData[0].length &&
                    tileY >= 0 &&
                    tileY < platformData.length &&
                    platformData[tileY + 1][idx] === 0
                ) {
                    output = i - .1;
                    break;
                }
            }
        } else {
            for (let i = 1; i <= 4; i++) {
                let idx = tileX + i;
                if (
                    idx >= 0 &&
                    idx < platformData[0].length &&
                    tileY >= 0 &&
                    tileY < platformData.length &&
                    platformData[tileY + 1][idx] === 0
                ) {
                    output = i - 1;
                    break;
                }
            }
        }

        return output / 2;
    };

    // Make him shootable
    makeShootable(k, guy);

    // Movement of the chacracter
    guy.onStateEnter("idle", async () => {
        await k.wait(1);
        guy.enterState("left");
      });
    
    guy.onStateEnter("left", async () => {
        guy.flipX = true;
        await k.wait(platformCheck("left"));
        guy.enterState("right");
    });

    guy.onStateUpdate("left", () => {
        guy.move(-guy.speed, 0);
    });

    guy.onStateEnter("right", async () => {
        guy.flipX = false;
        await k.wait(platformCheck("right"));
        guy.enterState("left");
    });

    guy.onStateUpdate("right", () => {
        guy.move(guy.speed, 0);
    });

    return guy;
}
