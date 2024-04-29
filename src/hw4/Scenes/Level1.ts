
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
import InventoryHUD from "../GameSystems/HUD/InventoryHUD";
import Inventory from "../GameSystems/ItemSystem/Inventory";
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
import Level4 from "./Level4";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import MainMenu from "./MainMenu";
import StartMenu from "./StartMenu";
import GameOver from "./GameOver";
import Controls from "./Controls";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";

export default class Level1 extends HW4Scene {
  protected invincibilityTimer: Timer | null = null;
  private pauseScreenSprite: Sprite;
  private controlScreenSprite: Sprite;
  private levelSelectionScreenSprite: Sprite;
  private helpScreenSprite: Sprite;


  private pauseLayer: Layer;
  private controlLayer: Layer;
  private levelSelectionLayer: Layer;
  private helpLayer: Layer;

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
  // The position graph for the navmesh 1
  private graph: PositionGraph;
  private GameIsPaused: boolean = false;
  private player: PlayerActor;  // Add this line if it's missing
  private isFollowingPlayer: boolean = false;
  private initializeNPCsBool:boolean = false
  private isWalkingSoundPlaying:boolean=false;
  private initializeNPCsAlreadyCalled:boolean = false
  // Initialize the properties to null initially
  private increasedHealth: boolean | null = null;
  private originalMaxHealth: number | null = null;
  protected levelLabel: Label;

  private uiLayer: Layer;
  private countUpTimer: Timer;
  private timerLabel: Label;
  private elapsedTime: number;
  private remainingTime: number;

private resumeButton: Button;
private levelSelectionButton: Label;
private ControlsButton: Label;
private helpButton: Label;
private menuButton: Label;
private backButton: Label;
private levelButton1: Label;
private levelButton2: Label;
private levelButton3: Label;
private levelButton4: Label;


  private npcInitTimer: number = 0; // Timer to track elapsed time for NPC initialization
  private npcInitInterval: number = 25; // Interval in seconds to initialize NPCs


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
    this.load.spritesheet("demonBat", "hw4_assets/spritesheets/demonBat.json");
    // Load the tilemap
    this.load.tilemap("level", "hw4_assets/tilemaps/HW4Tilemap.json");
    // Load the enemy locations
    this.load.object("red", "hw4_assets/data/enemies/red.json");
    // Load the healthpack and lasergun loactions
    this.load.object("healthpacks", "hw4_assets/data/items/healthpacks.json");
    this.load.object("laserguns", "hw4_assets/data/items/laserguns.json");
    // Load the healthpack, inventory slot, and laser gun sprites
    this.load.image("healthpack", "hw4_assets/sprites/healthpack.png");
    this.load.image("inventorySlot", "hw4_assets/sprites/inventory.png");
    this.load.image("laserGun", "hw4_assets/sprites/laserGun.png");
    this.load.audio("music1", "hw4_assets/music/music1.wav");
    this.load.audio("walk", "hw4_assets/music/walk.wav");
    this.load.audio("attack", "hw4_assets/music/attack.wav");
    this.load.image("pauseScreen", "hw4_assets/Screens/pause_menu.png");
    this.load.image("controlsScreen", "hw4_assets/Screens/controls_screen.png");
    this.load.image("levelSelectionScreen", "hw4_assets/Screens/level_selection_screen.png");
    this.load.image("helpScreen", "hw4_assets/Screens/help_screen.png");
  }

  /**
   * @see Scene.startScene
   */
  public override startScene() {


    this.elapsedTime = 0;
    this.remainingTime = 0;
    this.countUpTimer = new Timer(2 * 1000);
    this.countUpTimer.start();

    // Add in the tilemap
    let tilemapLayers = this.add.tilemap("level");
    // Get the wall layer
    this.walls = <OrthogonalTilemap>tilemapLayers[1].getItems()[0];
    // Set the viewport bounds to the tilemap
    let tilemapSize: Vec2 = this.walls.size;
    this.viewport.setBounds(0, 0, tilemapSize.x, tilemapSize.y);
    this.viewport.setZoomLevel(3.5);
    this.initLayers();
    // Create the player
    this.initializePlayer();
    this.initializeItems();
    this.initializeNavmesh();
    this.addUI();

    // // Create the NPCS
    // this.initializeNPCs();
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
    this.pauseLayer = this.addLayer('pauseLayer', 99);

    // Now, let's create a pause screen sprite and add it to the pause layer
    this.pauseScreenSprite = this.add.sprite("pauseScreen", "pauseLayer");
    this.pauseScreenSprite.position.set(this.viewport.getCenter().x, this.viewport.getCenter().y);
    this.pauseLayer.addNode(this.pauseScreenSprite);
    this.pauseScreenSprite.scale.set(0.4, 0.4);
    this.pauseLayer.setHidden(true); // Hide the layer initially

    //create control screen
    this.controlLayer = new Layer(this, "controlLayer");
    this.controlLayer = this.addLayer('controlLayer', 100);
    // Now, let's create a control screen sprite and add it to the control screen layer
    this.controlScreenSprite = this.add.sprite("controlsScreen", "controlLayer");
    this.controlScreenSprite.position.set(this.viewport.getCenter().x, this.viewport.getCenter().y);
    this.controlLayer.addNode(this.controlScreenSprite);
    this.controlScreenSprite.scale.set(0.4, 0.4);
    this.controlLayer.setHidden(true); // Hide the layer initially

    //create level selection screen
    this.levelSelectionLayer = new Layer(this, "levelSelectionLayer");
    this.levelSelectionLayer = this.addLayer('levelSelectionLayer', 100);
    // Now, let's create a level selection screen sprite and add it to the level selection screen layer
    this.levelSelectionScreenSprite = this.add.sprite("levelSelectionScreen", "levelSelectionLayer");
    this.levelSelectionScreenSprite.position.set(this.viewport.getCenter().x, this.viewport.getCenter().y);
    this.levelSelectionLayer.addNode(this.levelSelectionScreenSprite);
    this.levelSelectionScreenSprite.scale.set(0.4, 0.4);
    this.levelSelectionLayer.setHidden(true); // Hide the layer initially

    //create help screen
    this.helpLayer = new Layer(this, "helpLayer");
    this.helpLayer = this.addLayer('helpLayer', 100);
    // Now, let's create a help screen sprite and add it to the help screen layer
    this.helpScreenSprite = this.add.sprite("helpScreen", "helpLayer");
    this.helpScreenSprite.position.set(this.viewport.getCenter().x, this.viewport.getCenter().y);
    this.helpLayer.addNode(this.helpScreenSprite);
    this.helpScreenSprite.scale.set(0.4, 0.4);
    this.helpLayer.setHidden(true); // Hide the layer initially

    this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "music1", loop: true, holdReference: true });
  
    //resume button
    this.resumeButton = <Button>this.add.uiElement(
      UIElementType.BUTTON,
      "timer",
      {
        position: new Vec2(this.viewport.getHalfSize().x + 14, 121),
        text: "Resume",
      }
    );
    // Remove the font-related line if you don't have custom fonts
    this.resumeButton.borderColor = Color.BLACK;
    this.resumeButton.textColor = Color.WHITE;
    this.resumeButton.backgroundColor = Color.BLACK;
    this.resumeButton.size.set(80, 16);
    this.resumeButton.fontSize = 40;
    this.resumeButton.onClickEventId = "resume";
    this.receiver.subscribe("resume");



    //level selection button
    this.levelSelectionButton = <Button>this.add.uiElement(
      UIElementType.BUTTON,
      "timer",
      {
        position: new Vec2(this.viewport.getHalfSize().x + 14, 143),
        text: "Level Selection",
      }
    );
    // Remove the font-related line if you don't have custom fonts
    this.levelSelectionButton.borderColor = Color.BLACK;
    this.levelSelectionButton.textColor = Color.WHITE;
    this.levelSelectionButton.backgroundColor = Color.BLACK;
    this.levelSelectionButton.size.set(80, 16);
    this.levelSelectionButton.fontSize = 40;
    this.levelSelectionButton.onClickEventId = "level selection";
    this.receiver.subscribe("level selection");


    
    //controls button
    this.ControlsButton = <Button>this.add.uiElement(
      UIElementType.BUTTON,
      "timer",
      {
        position: new Vec2(this.viewport.getHalfSize().x + 14, 170),
        text: "Controls",
      }
    );
    // Remove the font-related line if you don't have custom fonts
    this.ControlsButton.borderColor = Color.BLACK;
    this.ControlsButton.textColor = Color.WHITE;
    this.ControlsButton.backgroundColor = Color.BLACK;
    this.ControlsButton.size.set(80, 16);
    this.ControlsButton.fontSize = 40;
    this.ControlsButton.onClickEventId = "controls";
    this.receiver.subscribe("controls");
    
  


    //help button
    this.helpButton = <Button>this.add.uiElement(
      UIElementType.BUTTON,
      "timer",
      {
        position: new Vec2(this.viewport.getHalfSize().x + 14, 191),
        text: "Help",
      }
    );
    // Remove the font-related line if you don't have custom fonts
    this.helpButton.borderColor = Color.BLACK;
    this.helpButton.textColor = Color.WHITE;
    this.helpButton.backgroundColor = Color.BLACK;
    this.helpButton.size.set(80, 16);
    this.helpButton.fontSize = 40;
    this.helpButton.onClickEventId = "help";
    this.receiver.subscribe("help");




    //menu button
    this.menuButton = <Button>this.add.uiElement(
      UIElementType.BUTTON,
      "timer",
      {
        position: new Vec2(this.viewport.getHalfSize().x + 14, 217),
        text: "Main Menu",
      }
    );
    // Remove the font-related line if you don't have custom fonts
    this.menuButton.borderColor = Color.BLACK;
    this.menuButton.textColor = Color.WHITE;
    this.menuButton.backgroundColor = Color.BLACK;
    this.menuButton.size.set(80, 16);
    this.menuButton.fontSize = 40;
    this.menuButton.onClickEventId = "main menu";
    this.receiver.subscribe("main menu");


    //back button
    this.backButton = <Button>this.add.uiElement(
      UIElementType.BUTTON,
      "timer",
      {
        position: new Vec2(30, 30),
        text: "Back",
      }
    );
    // Remove the font-related line if you don't have custom fonts
    this.backButton.borderColor = Color.BLACK;
    this.backButton.textColor = Color.WHITE;
    this.backButton.backgroundColor = Color.BLACK;
    this.backButton.size.set(80, 16);
    this.backButton.fontSize = 40;
    this.backButton.onClickEventId = "back";
    this.receiver.subscribe("back");
    
    //level 1 button
    this.levelButton1 = <Button>this.add.uiElement(
      UIElementType.BUTTON,
      "timer",
      {
        position: new Vec2(this.viewport.getHalfSize().x, 127),
        text: "Level 1",
      }
    );
    // Remove the font-related line if you don't have custom fonts
    this.levelButton1.borderColor = Color.BLACK;
    this.levelButton1.textColor = Color.WHITE;
    this.levelButton1.backgroundColor = Color.BLACK;
    this.levelButton1.size.set(160, 35);
    this.levelButton1.fontSize = 40;
    this.levelButton1.onClickEventId = "level 1";
    this.receiver.subscribe("level 1");

    //level 2 button
    this.levelButton2 = <Button>this.add.uiElement(
      UIElementType.BUTTON,
      "timer",
      {
        position: new Vec2(this.viewport.getHalfSize().x, 162),
        text: "Level 2",
      }
    );
    // Remove the font-related line if you don't have custom fonts
    this.levelButton2.borderColor = Color.BLACK;
    this.levelButton2.textColor = Color.WHITE;
    this.levelButton2.backgroundColor = Color.BLACK;
    this.levelButton2.size.set(160, 35);
    this.levelButton2.fontSize = 40;
    this.levelButton2.onClickEventId = "level 2";
    this.receiver.subscribe("level 2");

    //level 3 button
    this.levelButton3 = <Button>this.add.uiElement(
      UIElementType.BUTTON,
      "timer",
      {
        position: new Vec2(this.viewport.getHalfSize().x, 196),
        text: "Level 3",
      }
    );
    // Remove the font-related line if you don't have custom fonts
    this.levelButton3.borderColor = Color.BLACK;
    this.levelButton3.textColor = Color.WHITE;
    this.levelButton3.backgroundColor = Color.BLACK;
    this.levelButton3.size.set(160, 35);
    this.levelButton3.fontSize = 40;
    this.levelButton3.onClickEventId = "level 3";
    this.receiver.subscribe("level 3");

    //level 4 button
    this.levelButton4 = <Button>this.add.uiElement(
      UIElementType.BUTTON,
      "timer",
      {
        position: new Vec2(this.viewport.getHalfSize().x, 230),
        text: "Level 4",
      }
    );
    // Remove the font-related line if you don't have custom fonts
    this.levelButton4.borderColor = Color.BLACK;
    this.levelButton4.textColor = Color.WHITE;
    this.levelButton4.backgroundColor = Color.BLACK;
    this.levelButton4.size.set(160, 35);
    this.levelButton4.fontSize = 40;
    this.levelButton4.onClickEventId = "level 4";
    this.receiver.subscribe("level 4");


    

    this.resumeButton.visible = false;
    this.levelSelectionButton.visible = false;
    this.ControlsButton.visible = false;
    this.helpButton.visible = false;
    this.menuButton.visible = false;
    this.backButton.visible = false;
    this.levelButton1.visible = false;
    this.levelButton2.visible = false;
    this.levelButton3.visible = false;
    this.levelButton4.visible = false;
  }



  
  /**
   * @see Scene.updateScene
   */
  public override updateScene(deltaT: number): void {
    while (this.receiver.hasNextEvent()) {
        this.handleEvent(this.receiver.getNextEvent());
    }
    this.healthbars.forEach(healthbar => healthbar.update(deltaT));
    if (Input.isKeyJustPressed("p")) {
        this.emitter.fireEvent(BattlerEvent.PAUSE);
        console.log("MainHW4Scene has detected a p press");
    };
  if(this.GameIsPaused){
    this.initializeNPCsBool=false;
  }else{
    this.initializeNPCsBool=true;
  }
    this.chasePlayer();
    if (Input.isKeyJustPressed("1")) {
        console.log("1 has been pressed.");
        this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "music1" });
        this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "walk" });

        this.sceneManager.changeToScene(Level1);
    };
    if (Input.isKeyJustPressed("2")) {
        console.log("2 has been pressed.");
        this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "music1" });
        this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "walk" });

        this.sceneManager.changeToScene(Level2);
    };
    if (Input.isKeyJustPressed("3")) {
        console.log("3 has been pressed.");
        this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "music1" });
        this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "walk" });

        this.sceneManager.changeToScene(Level3);
    };
    if (Input.isKeyJustPressed("4")) {
        console.log("4 has been pressed.");
        this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "music1" });
        this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "walk" });

        this.sceneManager.changeToScene(Level4);
    };
    if (Input.isKeyJustPressed("0")) {
        this.initializeNPCsBool = true;
    };
    if (Input.isKeyJustPressed("f")) {
        // Restore player's health to maximum
        this.player.health = this.player.maxHealth;
    }
    if (Input.isKeyJustPressed("-")) {
      // Restore player's health to maximum
      this.player.health = this.player.health - 100;
  }
    if (this.player.health <=0){
      {
        this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "music1" });
        this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "walk" });
        }
      this.sceneManager.changeToScene(GameOver);
    }
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
    if (!this.GameIsPaused && (Input.isKeyJustPressed("w") || Input.isKeyJustPressed("a") || Input.isKeyJustPressed("s") || Input.isKeyJustPressed("d"))) {
        console.log("One of 'w', 'a', 's', or 'd' has been pressed.");
        if (!this.isWalkingSoundPlaying) {
            this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "walk", loop: true, holdReference: true });
            this.isWalkingSoundPlaying = true; // Set a flag to indicate the walking sound is playing
        }
    } else {
        // Check if any of the movement keys are currently down to continue playing the sound
        if (!Input.isKeyPressed("w") && !Input.isKeyPressed("a") && !Input.isKeyPressed("s") && !Input.isKeyPressed("d")) {
            if (this.isWalkingSoundPlaying) {
                this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "walk" });
                this.isWalkingSoundPlaying = false; // Update the flag when the sound is stopped
            }
        }
    }
    if (!this.GameIsPaused && Input.isMouseJustPressed(0)) {
        // Play the attack sound
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "attack" });
    }
    if (this.initializeNPCsBool) {

      this.npcInitTimer -= deltaT;
      // When the timer reaches 0 or goes below, initialize NPCs and reset the timer
      if (this.npcInitTimer <= 0) {
        this.initializeNPCs();
        // Reset npcInitTimer back to npcInitInterval
        this.npcInitTimer = this.npcInitInterval;
      }
      // ... rest of the update function ...
    }
// Check if the game is paused
if (!this.GameIsPaused) {
  // Update the timer only if it's not already stopped
  if (this.countUpTimer.isStopped()) {
      // If the timer was stopped, start it
      this.countUpTimer.start();
  } else {
      // If the timer was paused, resume it
      this.countUpTimer.update(deltaT);
  }

  // Update the elapsed time
  this.elapsedTime += deltaT;

  // Show the timer label
  this.timerLabel.visible = true;
} else {
  // If the game is paused, pause the timer
  this.countUpTimer.pause();

  // Hide the timer label
  this.timerLabel.visible = false;
}

// Calculate the remaining time based on the elapsed time
const minutes = Math.floor(this.elapsedTime / 60);
const seconds = Math.floor(this.elapsedTime % 60);
this.timerLabel.text = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}
protected chasePlayer(): void {
  // First, check if the game is paused
  if (this.GameIsPaused) {
    return; // If paused, exit the function
  }

  // Next, check if this.player is defined and has a position property.
  if (!this.player || !this.player.position) {
    return; // Exit the function if player or player's position is undefined or null.
  }

  // Define different minimum distances and speeds for each enemy battle group
  const enemyAttributes = {
    1: { minDistance: 15, speed: 0.9 },  // Attributes for enemy battle group 1
    2: { minDistance: 24, speed: 0.35 },   // Attributes for enemy battle group 2
    3: { minDistance: 26, speed: 0.25 }    // Attributes for enemy battle group 3
  };

  this.battlers.forEach((battler, index) => {
    if (battler && battler.position && battler.health > 0) {
      // Determine the enemy battle group
      const enemyBattleGroup = battler.battleGroup;
      // Check if the enemy battle group is valid and has defined attributes
      if (enemyBattleGroup in enemyAttributes) {
        // Get the attributes for the current enemy battle group
        const attributes = enemyAttributes[enemyBattleGroup];
        let minDistance = attributes.minDistance;
        const speed = attributes.speed;

        // Calculate the direction vector towards the player
        const direction = this.player.position.clone().sub(battler.position).normalize();
        // Adjust enemy's position based on the direction and speed
        battler.position.add(direction.scaled(speed));

        // Check for collisions with other enemies
        for (let otherBattler of this.battlers) {
          if (otherBattler !== battler && otherBattler.position && otherBattler.health > 0) {
            const distanceToOther = battler.position.distanceTo(otherBattler.position);
            if (distanceToOther < minDistance) {
              // If too close, adjust the position away from the other enemy
              const separationDirection = battler.position.clone().sub(otherBattler.position).normalize();
              battler.position.add(separationDirection.scaled(minDistance - distanceToOther));
            }
          }
        }
      } else {
        console.warn(`Invalid enemy battle group: ${enemyBattleGroup}`);
      }
    }
  });
}


  /**
   * Handle events from the rest of the game
   * @param event a game event
   */
  public handleEvent(event: GameEvent): void {
    switch (event.type) {
      case "resume":
        this.resumeButton.visible = false;
        this.levelSelectionButton.visible = false;
        this.ControlsButton.visible = false;
        this.helpButton.visible = false;
        this.menuButton.visible = false;
        this.emitter.fireEvent(BattlerEvent.PAUSE);
        break;
      
        case "level selection":
          if (this.levelSelectionLayer.isHidden()) {
            this.levelSelectionLayer.setHidden(false);
            this.levelSelectionScreenSprite.position.set(this.viewport.getCenter().x, this.viewport.getCenter().y);
            this.resumeButton.visible = false;
            this.levelSelectionButton.visible = false;
            this.ControlsButton.visible = false;
            this.helpButton.visible = false;
            this.menuButton.visible = false;
            this.levelButton1.visible = true;
            this.levelButton2.visible = true;
            this.levelButton3.visible = true;
            this.levelButton4.visible = true;
            this.backButton.visible = true;
          }
        console.log("MainHW4Scene has detected a x press");        
        break;



      case "controls":
        if (this.controlLayer.isHidden()) {
          this.controlLayer.setHidden(false);
          this.controlScreenSprite.position.set(this.viewport.getCenter().x, this.viewport.getCenter().y);
          this.resumeButton.visible = false;
          this.levelSelectionButton.visible = false;
          this.ControlsButton.visible = false;
          this.helpButton.visible = false;
          this.menuButton.visible = false;
          this.backButton.visible = true;
        }
      console.log("MainHW4Scene has detected a C press");   
        break;
      


      case "help":
        if (this.helpLayer.isHidden()) {
          this.helpLayer.setHidden(false);
          this.helpScreenSprite.position.set(this.viewport.getCenter().x, this.viewport.getCenter().y);
          this.resumeButton.visible = false;
          this.levelSelectionButton.visible = false;
          this.ControlsButton.visible = false;
          this.helpButton.visible = false;
          this.menuButton.visible = false;
          this.backButton.visible = true;
        }
      console.log("MainHW4Scene has detected a v press");
        break;

      
      case "main menu":
        console.log("1 has been pressed.");
        this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "music1" });
        this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "walk" });
        this.viewport.getHalfSize().scale(3.5);
        this.sceneManager.changeToScene(MainMenu);
        break;

      case "back":
        this.levelSelectionLayer.setHidden(true);
        this.controlLayer.setHidden(true);
        this.helpLayer.setHidden(true);
        this.backButton.visible = false;
        this.levelButton1.visible = false;
        this.levelButton2.visible = false;
        this.levelButton3.visible = false;
        this.levelButton4.visible = false;
        this.emitter.fireEvent(BattlerEvent.PAUSE);
        this.emitter.fireEvent(BattlerEvent.PAUSE);
        this.resumeButton.visible = true;
        this.levelSelectionButton.visible = true;
        this.ControlsButton.visible = true;
        this.helpButton.visible = true;
        this.menuButton.visible = true;
        break;


        case "level 1":
          console.log("1 has been pressed.");
          this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "music1" });
          this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "walk" });
          this.viewport.getHalfSize().scale(3.5);
          this.sceneManager.changeToScene(Level1);
          break;

        case "level 2":
          console.log("2 has been pressed.");
          this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "music1" });
          this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "walk" });
          this.viewport.getHalfSize().scale(3.5);
          this.sceneManager.changeToScene(Level2);
          break;

        case "level 3":
          console.log("3 has been pressed.");
          this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "music1" });
          this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "walk" });
          this.viewport.getHalfSize().scale(3.5);
          this.sceneManager.changeToScene(Level3);
          break;

        case "level 4":
          console.log("4 has been pressed.");
          this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "music1" });
          this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "walk" });
          this.viewport.getHalfSize().scale(3.5);
          this.sceneManager.changeToScene(Level4);
          break;


      case BattlerEvent.BATTLER_KILLED: {
        this.handleBattlerKilled(event);
        break;
      }
      case BattlerEvent.BATTLER_RESPAWN: {
        break;
      }
      case ItemEvent.ITEM_REQUEST: {
        this.handleItemRequest(event.data.get("node"), event.data.get("inventory"));
        break;
      }
      case BattlerEvent.PAUSE: {
        if (!this.GameIsPaused) {
          this.resumeButton.visible = true;
          this.levelSelectionButton.visible = true;
          this.ControlsButton.visible = true;
          this.helpButton.visible = true;
          this.menuButton.visible = true;
          
          this.battlers.forEach(battler => {
            (<GameNode>(<Actor>battler)).freeze();
          });
          this.GameIsPaused = !this.GameIsPaused;
          this.pauseLayer.setHidden(false);
          this.uiLayer.setHidden(true);
          const center = this.viewport.getCenter();
          this.pauseScreenSprite.position.set(this.viewport.getCenter().x, this.viewport.getCenter().y);
        } else {
          this.resumeButton.visible = false;
          this.levelSelectionButton.visible = false;
          this.ControlsButton.visible = false;
          this.helpButton.visible = false;
          this.menuButton.visible = false;
          // Optionally, handle the case when the game is paused
          // For example, unfreeze battlers or perform some other action
          this.battlers.forEach(battler => {
            (<GameNode>(<Actor>battler)).unfreeze();
          });
          this.GameIsPaused = !this.GameIsPaused;
          //this.pauseScreenSprite.visible=false;
          this.pauseLayer.setHidden(true);
          this.uiLayer.setHidden(false);
        }
        break
      }
      //handle pause game event
      default: {
        throw new Error(`Unhandled event type "${event.type}" caught in HW4Scene event handler`);
      }
    }
  }

  protected handleItemRequest(node: GameNode, inventory: Inventory): void {
    let items: Item[] = new Array<Item>(...this.healthpacks, ...this.laserguns).filter((item: Item) => {
      return item.inventory === null && item.position.distanceTo(node.position) <= 100;
    });
    if (items.length > 0) {
      inventory.add(items.reduce(ClosestPositioned(node)));
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

  protected addUI() {
    // In-game labels
    this.levelLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", { position: new Vec2(this.viewport.getHalfSize().x, 15), text: "Level 1" });

    this.levelLabel.textColor = Color.BLACK
    this.levelLabel.font = "PixelSimple";
    this.uiLayer = this.getLayer("UI");
    this.uiLayer.addNode(this.levelLabel);

        //timer
        this.timerLabel = <Button>this.add.uiElement(
          UIElementType.BUTTON,
          "timer",
          {
            position: new Vec2(this.viewport.getHalfSize().x, 30),
            text: "00:00",
          }
        );
        // Remove the font-related line if you don't have custom fonts
        this.timerLabel.borderColor = Color.BLACK;
        this.timerLabel.textColor = Color.BLACK;
        this.timerLabel.backgroundColor = Color.WHITE;
        this.timerLabel.fontSize = 40;
        
  }

  /** Initializes the layers in the scene */
  protected initLayers(): void {

    this.addLayer("primary", 10);
    this.addUILayer("slots");
    this.addUILayer("items");
    this.addUILayer("UI");
    this.getLayer("slots").setDepth(1);
    this.getLayer("items").setDepth(2);

    this.addUILayer("timer");
    this.getLayer("timer").setDepth(2);
  }

  protected initializePlayer(): void {
    this.player = this.add.animatedSprite(PlayerActor, "player1", "primary");
    this.player.position.set(350, 350);
    this.player.battleGroup = 2;
    this.player.health = 100;
    this.player.maxHealth = 1000;
    this.player.inventory.onChange = ItemEvent.INVENTORY_CHANGED;

    // Increase the player's speed
    this.player.speed *= 20; // Double the player's speed

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

  protected initializeNPCs(): void {

    console.log("initializeNPCs has been called");
    // Get the object data for the red enemies
    let red = this.load.getObject("red");
    // Initialize the red healers
    for (let i = 0; i < red.healers.length; i++) {
      let npc = this.add.animatedSprite(NPCActor, "demonBat", "primary");
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
    this.navManager.addNavigableEntity("navmesh", navmesh);
  }
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