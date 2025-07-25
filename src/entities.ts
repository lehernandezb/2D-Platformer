import type { GameObj, KaboomCtx } from "kaboom";
import { scale } from "./constants";

// Reducing magic numbers
const targetOpacityAfterHit: number = 0;
const targetOpacityWhenRecovering = 1;
const timingOfOpacityChange: number = 0.05;

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
        k.area({shape : new k.Rect(k.vec2(4,5.9), 8 , 10)}),
        k.body(),
        k.pos(posx * scale, posy * scale),
        k.scale(scale),
        k.doubleJump(2),
        k.health(3),
        k.opacity(1),
        {
            speed: 300,
            direction: 'right',
            isShooting: false,
            isEmpty: false
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
        if (player.hp() === 0) {
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


        // Going to next level
        player.onCollide("exit", () => {
            k.go("level-2");
        });

        // Shooting animation, will always be on, only changed opacity
        const shootingEffect = k.add([
            k.sprite("assets", {anim: "spookShooting"}),
            k.pos(),
            k.scale(scale),
            k.opacity(0),
            "shootingEffect"
        ]);

        // Shooting hitbox
        const shootingZone = k.add([
            k.area({shape: new k.Rect(k.vec2(0), 20, 4)}),
            k.pos(),
            "shootingZone"
        ]);

        

    })
}