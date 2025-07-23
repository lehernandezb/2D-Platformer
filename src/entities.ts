import type { GameObj, KaboomCtx } from "kaboom";
import { scale } from "./constants";

export function makePlayer(k : KaboomCtx, posx : number, posy : number) {
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

    player.onCollide("enemy", async (enemy: GameObj) => {
        if (player.isShooting && player.isEmpty) {
            player.isShooting = false;
            k.destroy(enemy);
            player.isEmpty = true;
            return;
        }

        if (player.hp() === 0) {
            k.destroy(player);
            k.go("level-2");
            return;
        }
    })
}