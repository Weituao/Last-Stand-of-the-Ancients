
import PositionGraph from "../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import Actor from "../../Wolfie2D/DataTypes/Interfaces/Actor";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Line from "../../Wolfie2D/Nodes/Graphics/Line";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Navmesh from "../../Wolfie2D/Pathfinding/Navmesh";
import DirectStrategy from "../../Wolfie2D/Pathfinding/Strategies/DirectStrategy";
import RenderingManager from "../../Wolfie2D/Rendering/RenderingManager";
import SceneManager from "../../Wolfie2D/Scene/SceneManager";
import Viewport from "../../Wolfie2D/SceneGraph/Viewport";
import Timer from "../../Wolfie2D/Timing/Timer";
import Color from "../../Wolfie2D/Utils/Color";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import NPCActor from "../Actors/NPCActor";
import PlayerActor from "../Actors/PlayerActor";
import GuardBehavior from "../AI/NPC/NPCBehavior/GaurdBehavior";
import HealerBehavior from "../AI/NPC/NPCBehavior/HealerBehavior";
import PlayerAI from "../AI/Player/PlayerAI";
import { ItemEvent, PlayerEvent, BattlerEvent } from "../Events";
import Battler from "../GameSystems/BattleSystem/Battler";
import BattlerBase from "../GameSystems/BattleSystem/BattlerBase";
import HealthbarHUD from "../GameSystems/HUD/HealthbarHUD";
import Item from "../GameSystems/ItemSystem/Item";
import Healthpack from "../GameSystems/ItemSystem/Items/Healthpack";
import LaserGun from "../GameSystems/ItemSystem/Items/LaserGun";
import { ClosestPositioned } from "../GameSystems/Searching/HW4Reducers";
import BasicTargetable from "../GameSystems/Targeting/BasicTargetable";
import Position from "../GameSystems/Targeting/Position";
import AstarStrategy from "../Pathfinding/AstarStrategy";
import HW4Scene from "./HW4Scene";
import Input from "../../Wolfie2D/Input/Input";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Layer from "../../Wolfie2D/Scene/Layer";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Level2 from "./Level2";
import Level3 from "./Level3";
import Level1 from "./Level1";
import Level4 from "./Level4";

export default class MainHW4Scene extends HW4Scene {
  private pauseScreenSprite: Sprite;
  private pauseLayer: Layer;
  /** GameSystems in the HW4 Scene */
  /** All the battlers in the HW4Scene (including the player) */
  private battlers: (Battler & Actor)[];
  /** Healthbars for the battlers */
  private healthbars: Map<number, HealthbarHUD>;
  private bases: BattlerBase[];
  private healthpacks: Array<Healthpack>;
  private laserguns: Array<LaserGun>;
  // The wall layer of the tilemap
  private walls: OrthogonalTilemap;
  // The position graph for the navmesh
  private graph: PositionGraph;
  private GameIsPaused: boolean = false;
  private player: PlayerActor;  // Add this line if it's missing
  private isFollowingPlayer: boolean = false;
  private initializeNPCsBool:boolean = false
      // Initialize the properties to null initially
      private increasedHealth: boolean | null = null;
      private originalMaxHealth: number | null = null;
  private initializeNPCsAlreadyCalled:boolean = false
  public constructor(viewport: Viewport, sceneManager: SceneManager, renderingManager: RenderingManager, options: Record<string, any>) {
    super(viewport, sceneManager, renderingManager, options);
    this.battlers = new Array<Battler & Actor>();
    this.healthbars = new Map<number, HealthbarHUD>();
    this.laserguns = new Array<LaserGun>();
    this.healthpacks = new Array<Healthpack>();
  }

  /**
   * @see Scene.update()
   */
  public override loadScene() {
    // Load the player and enemy spritesheets
    this.load.spritesheet("player1", "hw4_assets/spritesheets/player1.json");
    // Load in the enemy sprites
    this.load.spritesheet("RedEnemy", "hw4_assets/spritesheets/Bug.json");
    this.load.spritesheet("RedHealer", "hw4_assets/spritesheets/Bat.json");
    // Load the tilemap
    this.load.tilemap("level", "hw4_assets/tilemaps/HW4Tilemap.json");
    // Load the enemy locations
    this.load.object("red", "hw4_assets/data/enemies/red.json");
    // Load the healthpack and lasergun loactions
    this.load.object("healthpacks", "hw4_assets/data/items/healthpacks.json");
    this.load.object("laserguns", "hw4_assets/data/items/laserguns.json");
    // Load the healthpack, inventory slot, and laser gun sprites
    this.load.image("healthpack", "hw4_assets/sprites/healthpack.png");
    this.load.image("laserGun", "hw4_assets/sprites/laserGun.png");
    this.load.audio("music", "hw4_assets/music/music.wav");
    this.load.image("pauseScreen", "hw4_assets/Screens/pause_menu.png");
  }

  /**
   * @see Scene.startScene
   */
  public override startScene() {
    // Add in the tilemap
    let tilemapLayers = this.add.tilemap("level");
    // Get the wall layer
    this.walls = <OrthogonalTilemap>tilemapLayers[1].getItems()[0];
    // Set the viewport bounds to the tilemap
    let tilemapSize: Vec2 = this.walls.size;
    this.viewport.setBounds(0, 0, tilemapSize.x, tilemapSize.y);
    this.viewport.setZoomLevel(2);
    this.initLayers();
    // Create the player
    this.initializePlayer();
    this.initializeItems();
    this.initializeNavmesh();
    // Create the NPCS
    //this.initializeNPCs();
    // Subscribe to relevant events
    this.receiver.subscribe("healthpack");
    this.receiver.subscribe("enemyDied");
    this.receiver.subscribe(ItemEvent.ITEM_REQUEST);
    // Add a UI for health
    this.addUILayer("health");
    this.receiver.subscribe(PlayerEvent.PLAYER_KILLED);
    this.receiver.subscribe(BattlerEvent.BATTLER_KILLED);
    this.receiver.subscribe(BattlerEvent.BATTLER_RESPAWN);
    this.receiver.subscribe(BattlerEvent.PAUSE);
    // Create and add the pause layer
    this.pauseLayer = new Layer(this, "pauseLayer");
    this.pauseLayer = this.addLayer('pauseLayer', 100);
    // Now, let's create a pause screen sprite and add it to the pause layer
    this.pauseScreenSprite = this.add.sprite("pauseScreen", "pauseLayer");
    this.pauseScreenSprite.position.set(this.viewport.getCenter().x, this.viewport.getCenter().y);
    this.pauseLayer.addNode(this.pauseScreenSprite);
    this.pauseScreenSprite.scale.set(0.8, 0.8);
    this.pauseLayer.setHidden(true); // Hide the layer initially
    this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "music", loop: true, holdReference: true });
  }

  /**
   * @see Scene.updateScene
   */
  public override updateScene(deltaT: number): void {
    while (this.receiver.hasNextEvent()) {
        this.handleEvent(this.receiver.getNextEvent());}
    this.healthbars.forEach(healthbar => healthbar.update(deltaT));
    if (Input.isKeyJustPressed("p")) {
        this.emitter.fireEvent(BattlerEvent.PAUSE);
        console.log("MainHW4Scene has detected a p press");};
    this.chasePlayer();
    if (Input.isKeyJustPressed("1")) {
        console.log("1 has been pressed.");
        this.sceneManager.changeToScene(Level1);};
    if (Input.isKeyJustPressed("2")) {
        console.log("2 has been pressed.");
        this.sceneManager.changeToScene(Level2);};
    if (Input.isKeyJustPressed("3")) {
        console.log("3 has been pressed.");
        this.sceneManager.changeToScene(Level3);};
    if (Input.isKeyJustPressed("4")) {
        console.log("4 has been pressed.");
        this.sceneManager.changeToScene(Level4);};
    if (Input.isKeyJustPressed("0")) {
        this.initializeNPCsBool = true;};
    if (Input.isKeyJustPressed("f")) {
        // Restore player's health to maximum
        this.player.health = this.player.maxHealth;}
    // Check if the 'i' key is pressed
    if (Input.isKeyJustPressed("i")) {
        // Toggle the flag to indicate increased health
        this.increasedHealth = !this.increasedHealth;
        // If player's health hasn't been modified yet
        if (this.increasedHealth) {
            // Increase player's max health to 10000
            this.originalMaxHealth = this.player.maxHealth;
            this.player.maxHealth = 10000;
            // Set player's health to the new max health value
            this.player.health = this.player.maxHealth;
        } else {
            // If player's health has been modified, revert to the original max health
            if (this.originalMaxHealth !== null) {
                this.player.maxHealth = this.originalMaxHealth;
                // Set player's health to the original max health value
                this.player.health = this.originalMaxHealth;
            }
        }
    }
    if (this.initializeNPCsBool && !this.initializeNPCsAlreadyCalled) {
        this.initializeNPCsAlreadyCalled = true;
        this.initializeNPCs();
    }
}


  protected chasePlayer(): void {
    console.log("enterChase called");
    // Assuming enemy battlers are identified by a certain battleGroup value
    const enemyBattleGroup = 1;  // This is just an example, adjust as needed.
    console.log("Enemy battle group: ", enemyBattleGroup);
    // First, check if this.player is defined and has a position property.
    if (!this.player || !this.player.position) {
      console.log("Player or player position is not defined.");
      return; // Exit the function if player or player's position is undefined or null.
    }
    this.battlers.forEach((battler, index) => {
      console.log(`Processing battler ${index + 1}/${this.battlers.length}`);
      //In enterChase() method, when trying to access this.player.position, it saids that position is undefined
      if (battler && battler.position && battler.battleGroup === enemyBattleGroup) {
        console.log("Battler is defined and has a position.");
        console.log("Battler Position:" + battler.position);
        console.log("this.player.position:" + this.player.position);
        const distanceToPlayer = battler.position.distanceTo(this.player.position);
        console.log(`Distance to player: ${distanceToPlayer}`);
        //if (distanceToPlayer < 50) {
          if (true) {
          this.isFollowingPlayer = true;
          console.log("Player seen, starting chase.");
          // Adjust enemy's x position
          if (battler.position.x > this.player.position.x) {
            battler.position.x -= 0.2;
            console.log(`Moving battler left to x=${battler.position.x}`);
          } else {
            battler.position.x += 0.2;
            console.log(`Moving battler right to x=${battler.position.x}`);
          }
          // Adjust enemy's y position
          if (battler.position.y > this.player.position.y) {
            battler.position.y -= 0.2;
            console.log(`Moving battler up to y=${battler.position.y}`);
          } else {
            battler.position.y += 0.2;
            console.log(`Moving battler down to y=${battler.position.y}`);
          }
        } else {
          this.isFollowingPlayer = false;
          console.log("Player not seen, not chasing.");
        }
      } else {
        console.log("Battler is undefined, or does not have a position, or is not an enemy.");
      }
    });
  }
  
  /**
   * Handle events from the rest of the game
   * @param event a game event
   */
  public handleEvent(event: GameEvent): void {
    switch (event.type) {
      case BattlerEvent.BATTLER_KILLED: {
        this.handleBattlerKilled(event);
        break;
      }
      case BattlerEvent.BATTLER_RESPAWN: {
        break;
      }
      case BattlerEvent.PAUSE: {
        if (!this.GameIsPaused) {
          this.battlers.forEach(battler => {
            (<GameNode>(<Actor>battler)).freeze();
          });
          this.GameIsPaused = !this.GameIsPaused;
          this.pauseLayer.setHidden(false);
          const center = this.viewport.getCenter();
          this.pauseScreenSprite.position.set(this.viewport.getCenter().x, this.viewport.getCenter().y);
        } else {
          // Optionally, handle the case when the game is paused
          // For example, unfreeze battlers or perform some other action
          this.battlers.forEach(battler => {
            (<GameNode>(<Actor>battler)).unfreeze();
          });
          this.GameIsPaused = !this.GameIsPaused;
          //this.pauseScreenSprite.visible=false;
          this.pauseLayer.setHidden(true);
        }
        break
      }
      //handle pause game event
      default: {
        throw new Error(`Unhandled event type "${event.type}" caught in HW4Scene event handler`);
      }
    }
  }

  /**
   * Handles an NPC being killed by unregistering the NPC from the scenes subsystems
   * @param event an NPC-killed event
   */
  protected handleBattlerKilled(event: GameEvent): void {
    let id: number = event.data.get("id");
    let battler = this.battlers.find(b => b.id === id);
    if (battler) {
      battler.battlerActive = false;
      this.healthbars.get(id).visible = false;
    }
  }

  /** Initializes the layers in the scene */
  protected initLayers(): void {
    this.addLayer("primary", 10);
    this.addUILayer("slots");
    this.addUILayer("items");
    this.getLayer("slots").setDepth(1);
    this.getLayer("items").setDepth(2);
  }

  protected initializePlayer(): void {
    this.player = this.add.animatedSprite(PlayerActor, "player1", "primary");
    this.player.position.set(350, 350);
    this.player.battleGroup = 2;
    this.player.health = 10;
    this.player.maxHealth = 100;
    // Give the player physics
    this.player.addPhysics(new AABB(Vec2.ZERO, new Vec2(8, 8)));
    // Give the player a healthbar
    let healthbar = new HealthbarHUD(this, this.player, "primary", { size: this.player.size.clone().scaled(2, 1 / 2), offset: this.player.size.clone().scaled(0, -1 / 2) });
    this.healthbars.set(this.player.id, healthbar); 
    // Give the player PlayerAI
    this.player.addAI(PlayerAI);
    // Start the player in the "IDLE" animation
    this.player.animation.play("IDLE");
    this.battlers.push(this.player);
    this.viewport.follow(this.player);
  }

  /**
   * Initialize the NPCs 
   */
  protected initializeNPCs(): void {
    // Get the object data for the red enemies
    let red = this.load.getObject("red");
    // Initialize the red healers
    for (let i = 0; i < red.healers.length; i++) {
      let npc = this.add.animatedSprite(NPCActor, "RedHealer", "primary");
      npc.position.set(red.healers[i][0], red.healers[i][1]);
      npc.addPhysics(new AABB(Vec2.ZERO, new Vec2(7, 7)), null, false);
      npc.battleGroup = 1;
      npc.speed = 10;
      npc.health = 20;
      npc.maxHealth = 20;
      npc.navkey = "navmesh";
      // Give the NPC a healthbar
      let healthbar = new HealthbarHUD(this, npc, "primary", { size: npc.size.clone().scaled(2, 1 / 2), offset: npc.size.clone().scaled(0, -1 / 2) });
      this.healthbars.set(npc.id, healthbar);
      npc.addAI(HealerBehavior);
      npc.animation.play("IDLE");
      this.battlers.push(npc);
    }

    for (let i = 0; i < red.enemies.length; i++) {
      let npc = this.add.animatedSprite(NPCActor, "RedEnemy", "primary");
      npc.position.set(red.enemies[i][0], red.enemies[i][1]);
      npc.addPhysics(new AABB(Vec2.ZERO, new Vec2(7, 7)), null, false);
      // Give the NPC a healthbar
      let healthbar = new HealthbarHUD(this, npc, "primary", { size: npc.size.clone().scaled(2, 1 / 2), offset: npc.size.clone().scaled(0, -1 / 2) });
      this.healthbars.set(npc.id, healthbar);
      // Set the NPCs stats
      npc.battleGroup = 1
      npc.speed = 10;
      npc.health = 50;
      npc.maxHealth = 50;
      npc.navkey = "navmesh";
      npc.addAI(GuardBehavior, { target: new BasicTargetable(new Position(npc.position.x, npc.position.y)), range: 100 });
      // Play the NPCs "IDLE" animation 
      npc.animation.play("IDLE");
      // Add the NPC to the battlers array
      this.battlers.push(npc);
    }

    for (let i = 0; i < red.demon.length; i++) {
      let npc = this.add.animatedSprite(NPCActor, "player1", "primary");
      npc.position.set(red.demon[i][0], red.demon[i][1]);
      npc.addPhysics(new AABB(Vec2.ZERO, new Vec2(7, 7)), null, false);
      // Give the NPC a healthbar
      let healthbar = new HealthbarHUD(this, npc, "primary", { size: npc.size.clone().scaled(2, 1 / 2), offset: npc.size.clone().scaled(0, -1 / 2) });
      this.healthbars.set(npc.id, healthbar);
      // Set the NPCs stats
      npc.battleGroup = 1
      npc.speed = 10;
      npc.health = 100;
      npc.maxHealth = 100;
      npc.navkey = "navmesh";
      npc.addAI(GuardBehavior, { target: new BasicTargetable(new Position(npc.position.x, npc.position.y)), range: 100 });
      // Play the NPCs "IDLE" animation 
      npc.animation.play("IDLE");
      // Add the NPC to the battlers array
      this.battlers.push(npc);
    }
  }

  /**
   * Initialize the items in the scene (healthpacks and laser guns)
   */
  protected initializeItems(): void {
    let laserguns = this.load.getObject("laserguns");
    this.laserguns = new Array<LaserGun>(laserguns.items.length);
    for (let i = 0; i < laserguns.items.length; i++) {
      let sprite = this.add.sprite("laserGun", "primary");
      let line = <Line>this.add.graphic(GraphicType.LINE, "primary", { start: Vec2.ZERO, end: Vec2.ZERO });
      this.laserguns[i] = LaserGun.create(sprite, line);
      this.laserguns[i].position.set(laserguns.items[i][0], laserguns.items[i][1]);
    }

    let healthpacks = this.load.getObject("healthpacks");
    this.healthpacks = new Array<Healthpack>(healthpacks.items.length);
    for (let i = 0; i < healthpacks.items.length; i++) {
      let sprite = this.add.sprite("healthpack", "primary");
      this.healthpacks[i] = new Healthpack(sprite);
      this.healthpacks[i].position.set(healthpacks.items[i][0], healthpacks.items[i][1]);
    }
  }

  /**
   * Initializes the navmesh graph used by the NPCs in the HW4Scene. This method is a little buggy, and
   * and it skips over some of the positions on the tilemap. If you can fix my navmesh generation algorithm,
   * go for it.
   * 
   * - Peter
   */
  protected initializeNavmesh(): void {
    // Create the graph
    this.graph = new PositionGraph();
    let dim: Vec2 = this.walls.getDimensions();
    for (let i = 0; i < dim.y; i++) {
      for (let j = 0; j < dim.x; j++) {
        let tile: AABB = this.walls.getTileCollider(j, i);
        this.graph.addPositionedNode(tile.center);
      }
    }

    let rc: Vec2;
    for (let i = 0; i < this.graph.numVertices; i++) {
      rc = this.walls.getTileColRow(i);
      if (
        !this.walls.isTileCollidable(rc.x, rc.y) &&
        !this.walls.isTileCollidable(
          MathUtils.clamp(rc.x - 1, 0, dim.x - 1),
          rc.y
        ) &&
        !this.walls.isTileCollidable(
          MathUtils.clamp(rc.x + 1, 0, dim.x - 1),
          rc.y
        ) &&
        !this.walls.isTileCollidable(
          rc.x,
          MathUtils.clamp(rc.y - 1, 0, dim.y - 1)
        ) &&
        !this.walls.isTileCollidable(
          rc.x,
          MathUtils.clamp(rc.y + 1, 0, dim.y - 1)
        ) &&
        !this.walls.isTileCollidable(
          MathUtils.clamp(rc.x + 1, 0, dim.x - 1),
          MathUtils.clamp(rc.y + 1, 0, dim.y - 1)
        ) &&
        !this.walls.isTileCollidable(
          MathUtils.clamp(rc.x - 1, 0, dim.x - 1),
          MathUtils.clamp(rc.y + 1, 0, dim.y - 1)
        ) &&
        !this.walls.isTileCollidable(
          MathUtils.clamp(rc.x + 1, 0, dim.x - 1),
          MathUtils.clamp(rc.y - 1, 0, dim.y - 1)
        ) &&
        !this.walls.isTileCollidable(
          MathUtils.clamp(rc.x - 1, 0, dim.x - 1),
          MathUtils.clamp(rc.y - 1, 0, dim.y - 1)
        )
      ) {
        // Create edge to the left
        rc = this.walls.getTileColRow(i + 1);
        if ((i + 1) % dim.x !== 0 && !this.walls.isTileCollidable(rc.x, rc.y)) {
          this.graph.addEdge(i, i + 1);
          // this.add.graphic(GraphicType.LINE, "graph", {start: this.graph.getNodePosition(i), end: this.graph.getNodePosition(i + 1)})
        }
        // Create edge below
        rc = this.walls.getTileColRow(i + dim.x);
        if (
          i + dim.x < this.graph.numVertices &&
          !this.walls.isTileCollidable(rc.x, rc.y)
        ) {
          this.graph.addEdge(i, i + dim.x);
          // this.add.graphic(GraphicType.LINE, "graph", {start: this.graph.getNodePosition(i), end: this.graph.getNodePosition(i + dim.x)})
        }
      }
    }
    // Set this graph as a navigable entity
    let navmesh = new Navmesh(this.graph);
    // Add different strategies to use for this navmesh
    navmesh.registerStrategy("direct", new DirectStrategy(navmesh));
    navmesh.registerStrategy("astar", new AstarStrategy(navmesh));
    // Select A* as our navigation strategy
    navmesh.setStrategy("astar");
    // Add this navmesh to the navigation manager
    this.navManager.addNavigableEntity("navmesh", navmesh); }
  public getBattlers(): Battler[] { return this.battlers; }
  public getWalls(): OrthogonalTilemap { return this.walls; }
  public getHealthpacks(): Healthpack[] { return this.healthpacks; }
  public getLaserGuns(): LaserGun[] { return this.laserguns; }

  /**
   * Checks if the given target position is visible from the given position.
   * @param position 
   * @param target 
   * @returns 
   */
  public isTargetVisible(position: Vec2, target: Vec2): boolean {
    // Get the new player location
    let start = position.clone();
    let delta = target.clone().sub(start);
    // Iterate through the tilemap region until we find a collision
    let minX = Math.min(start.x, target.x);
    let maxX = Math.max(start.x, target.x);
    let minY = Math.min(start.y, target.y);
    let maxY = Math.max(start.y, target.y);
    // Get the wall tilemap
    let walls = this.getWalls();
    let minIndex = walls.getTilemapPosition(minX, minY);
    let maxIndex = walls.getTilemapPosition(maxX, maxY);
    let tileSize = walls.getScaledTileSize();
    for (let col = minIndex.x; col <= maxIndex.x; col++) {
      for (let row = minIndex.y; row <= maxIndex.y; row++) {
        if (walls.isTileCollidable(col, row)) {
          // Get the position of this tile
          let tilePos = new Vec2(
            col * tileSize.x + tileSize.x / 2,
            row * tileSize.y + tileSize.y / 2
          );
          // Create a collider for this tile
          let collider = new AABB(tilePos, tileSize.scaled(1 / 2));
          let hit = collider.intersectSegment(start, delta, Vec2.ZERO);
          if (
            hit !== null &&
            start.distanceSqTo(hit.pos) < start.distanceSqTo(target)
          ) {
            // We hit a wall, we can't see the player
            return false;
          }
        }
      }
    }
    return true;
  }
}