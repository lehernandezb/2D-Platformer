import { scale } from "./constants";
import type { KaboomCtx } from "kaboom";

export async function makeMap(k: KaboomCtx, name : string) {

    // fetching data from level
    const mapData = await (await fetch(`./${name}.tmj`)).json();
    
    // making map
    const map = k.make([k.sprite(name), k.scale(scale), k.pos(0)]);

    // getting spawn points
    const spawnPoints: {[key: string] : {x: number, y: number}[]} = {};

    // getting data from each layer
    for (const layer of mapData.layers) {

        // collider data
        if (layer.name === "colliders") {
            for ( const collider of layer.objects) {
                
                // add colider to map
                map.add([
                    k.area({
                        shape: new k.Rect(k.vec2(0), collider.width, collider.height),
                        collisionIgnore: ["platform", "exit", "spikes"]
                    }),

                    // making the exit static
                    collider.name !== 'exit' ? k.body({isStatic: true}) : null,
                    k.pos(collider.x, collider.y),
                    collider.name === "spikes"
                        ? "spikes"
                        : (collider.name !== "exit" ? "platform" : "exit")
                ]);
            }
            continue;
        }

        // spawnpoint data
        if (layer.name === "spawnpoints"){
            for (const spawnPoint of layer.objects) {

                // if key exits, add to array
                if (spawnPoints[spawnPoint.name]){
                    spawnPoints[spawnPoint.name].push({
                        x: spawnPoint.x,
                        y: spawnPoint.y,
                    });
                    continue;
                }

                // if not create array
                spawnPoints[spawnPoint.name] = [{
                    x: spawnPoint.x,
                    y: spawnPoint.y,
                }];
            }
        }
    }

    return {map, spawnPoints};
}