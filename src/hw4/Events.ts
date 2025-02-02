export enum BattlerEvent {
    BATTLER_KILLED = "BATTLER_KILLED",
    BATTLER_RESPAWN = "BATTLER_RESPAWN",
    
    BATTLER_CHANGE = "BATTLER_CHANGE",
    CONSUME = "CONSUME",
    HIT = "HIT",
    PAUSE="PAUSE"
}
export enum bulletshader {
	cool_Bullets = "COOL_BULLETS"
}
export enum ItemEvent {
    ITEM_REQUEST = "ITEM_REQUEST",

    LASERGUN_FIRED = "LASERGUN_FIRED",

    WEAPON_USED = "WEAPON_USED",
    CONSUMABLE_USED = "CONSUMABLE_USED",
    INVENTORY_CHANGED = "INVENTORY_CHANGED",
}

export enum HudEvent {
    HEALTH_CHANGE = "HEALTH_CHANGE"
}

export enum PlayerEvent {
    PLAYER_KILLED = "PLAYER_KILLED"
}

export enum InputEvent {
    PAUSED = "PAUSED",
    SET_TIMEOUT = "SET_TIMEOUT",
    RESUMED = "RESUMED",
}