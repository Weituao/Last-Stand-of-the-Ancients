import Spritesheet from "../../Wolfie2D/DataTypes/Spritesheet";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import { BattlerEvent, HudEvent } from "../Events";
import Inventory from "../GameSystems/ItemSystem/Inventory";
import HW4Scene from "../Scenes/HW4Scene";
import BasicTargetable from "../GameSystems/Targeting/BasicTargetable";
import BasicTargeting from "../GameSystems/Targeting/BasicTargeting";

import Battler from "../GameSystems/BattleSystem/Battler";
import { TargetableEntity } from "../GameSystems/Targeting/TargetableEntity";
import { TargetingEntity } from "../GameSystems/Targeting/TargetingEntity";
import BasicBattler from "../GameSystems/BattleSystem/BasicBattler";
import Timer from "../../Wolfie2D/Timing/Timer";


export default class BulletActor extends Sprite {

    /** Override the type of the scene to be the HW4 scene */
    protected scene: HW4Scene
    private target: Vec2
    private dir: Vec2

    public constructor(pos: Vec2, target: Vec2) {
        super("bullet");
        this.position.set(pos.x, pos.y);
        this.target = new Vec2(target.x, target.y);
        this.dir = pos.dirTo(pos);
    }

    update(deltaT: number): void {
        super.update(deltaT);
        let speed = 1;
        this.position.add(this.dir.mult(new Vec2(speed, speed).mult(new Vec2(deltaT, deltaT))));
        console.log("BULLETTTTT!!!!!!!!")
    }


}