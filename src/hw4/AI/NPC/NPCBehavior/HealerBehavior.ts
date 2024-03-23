import NPCActor from "../../../Actors/NPCActor";
import NPCBehavior from "../NPCBehavior";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import Idle from "../NPCActions/GotoAction";
import { TargetExists } from "../NPCStatuses/TargetExists";
import BasicFinder from "../../../GameSystems/Searching/BasicFinder";
import { BattlerActiveFilter, BattlerGroupFilter, ItemFilter, VisibleItemFilter } from "../../../GameSystems/Searching/HW4Filters";
import PickupItem from "../NPCActions/PickupItem";
import UseHealthpack from "../NPCActions/UseHealthpack";
import Healthpack from "../../../GameSystems/ItemSystem/Items/Healthpack";
import { HasItem } from "../NPCStatuses/HasItem";
import FalseStatus from "../NPCStatuses/FalseStatus";
import Battler from "../../../GameSystems/BattleSystem/Battler";

export default class HealerBehavior extends NPCBehavior {

    protected override owner: NPCActor;

    public initializeAI(owner: NPCActor, opts: Record<string, any>): void {
        super.initializeAI(owner, opts);

        const scene = owner.getScene();

        // Add all healer statuses
        this.addStatus(HealerStatuses.GOAL, new FalseStatus());
        this.addStatus(HealerStatuses.HPACK_EXISTS, new TargetExists(scene.getHealthpacks(), new BasicFinder<Healthpack>(null, ItemFilter(Healthpack), VisibleItemFilter())));
        this.addStatus(HealerStatuses.HAS_HPACK, new HasItem(owner, new BasicFinder<Healthpack>(null, ItemFilter(Healthpack))));
        const lowHealthAllyFinder = new BasicFinder<Battler>(null, BattlerActiveFilter(), BattlerGroupFilter([owner.battleGroup]));
        this.addStatus(HealerStatuses.ALLY_EXISTS, new TargetExists(scene.getBattlers(), lowHealthAllyFinder));

        // Add all healer actions
        const idle = new Idle(this, owner);
        idle.addEffect(HealerStatuses.GOAL);
        idle.cost = 100;
        this.addState(HealerActions.IDLE, idle);

        const pickupItem = new PickupItem(this, owner);
        pickupItem.addEffect(HealerStatuses.HAS_HPACK);
        pickupItem.cost = 1;
        this.addState(HealerActions.PICKUP_HPACK, pickupItem);

        const useHealthpack = new UseHealthpack(this, owner);
        useHealthpack.addEffect(HealerStatuses.GOAL);
        useHealthpack.cost = 1;
        this.addState(HealerActions.USE_HPACK, useHealthpack);

        // Set the healer's goal
        this.goal = HealerStatuses.GOAL;
        this.initialize();
    }

    public override handleEvent(event: GameEvent): void {
        // Handle events here if needed
        super.handleEvent(event);
    }

    public override update(deltaT: number): void {
        // Update logic here if needed
        super.update(deltaT);
    }
}

// Define world states for the healer
const HealerStatuses = {
    HPACK_EXISTS: "hpack-exists",
    ALLY_EXISTS: "ally-exists",
    HAS_HPACK: "has-hpack",
    GOAL: "goal"
} as const;

// Define healer actions
const HealerActions = {
    PICKUP_HPACK: "pickup-hpack",
    USE_HPACK: "use-hpack",
    IDLE: "idle"
} as const;
