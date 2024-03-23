import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import Battler from "../../../GameSystems/BattleSystem/Battler";
import Healthpack from "../../../GameSystems/ItemSystem/Items/Healthpack";
import { TargetableEntity } from "../../../GameSystems/Targeting/TargetableEntity";
import NPCActor from "../../../Actors/NPCActor";
import NPCBehavior from "../NPCBehavior";
import NPCAction from "./NPCAction";
import Finder from "../../../GameSystems/Searching/Finder";


export default class UseHealthpack extends NPCAction {
    
    // The targeting strategy used for this GotoAction - determines how the target is selected basically
    protected override _targetFinder: Finder<Battler>;
    // The targets or Targetable entities 
    protected override _targets: Battler[];
    // The target we are going to set the actor to target
    protected override _target: Battler | null;

    public constructor(parent: NPCBehavior, actor: NPCActor) { 
        super(parent, actor);
    }

    public performAction(target: Battler): void {
        // Attempt to find a Healthpack in the inventory
        const healthpack = this.actor.inventory.find(item => item instanceof Healthpack) as Healthpack | null;
        
        if(healthpack !== null) {
            // Calculate the new health value, ensuring it does not exceed maxHealth
            let newHealth = Math.min(target.health + healthpack.health, target.maxHealth);
            
            // Update the target's health
            target.health = newHealth;
            
            // Remove the Healthpack from the inventory
            this.actor.inventory.remove(healthpack.id);
        }
    }
    

}