import kaboom from "kaboom";
import {scale} from "./constants";

// Importing Kaboom and setting up the frame of the game
export const k = kaboom({
    width: 256 * scale,
    height: 144 * scale,
    scale,
    letterbox: true,
    global: false
})