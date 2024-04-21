import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import MainHW4Scene from "./MainHW4Scene";
import Level1 from "./Level1";
import Level2 from "./Level2";
import Level3 from "./Level3";
import Level4 from "./Level4";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import MainMenu from "./MainMenu";

export default class LevelSelection extends Scene {
  private Level_Selection: Layer;

  public static BACKGROUND_KEY = "LEVEL SELECTION SCREEN"
  public static BACKGROUND_PATH = "hw4_assets/Screens/level_selection_screen.png"
  private background: Sprite;


  protected initBackground(): void {
    this.background = this.add.sprite(LevelSelection.BACKGROUND_KEY, "LEVEL SELECTION SCREEN");
    const center = this.viewport.getCenter();

    const viewportSize = this.viewport.getHalfSize().scale(2);
    const imageSize = this.background.size;

    // Calculate the scale factors for the X and Y dimensions
    const scaleX = viewportSize.x / imageSize.x;
    const scaleY = viewportSize.y / imageSize.y;

    // // Set the scale of the background image to match the viewport dimensions
    this.background.scale.set(scaleX, scaleY);

    //Rever the viewport halfsize
    this.viewport.getHalfSize().scale(.5);

    this.background.position.copy(center);
}

  public loadScene() {
    this.load.image(LevelSelection.BACKGROUND_KEY, LevelSelection.BACKGROUND_PATH);

  }

  public startScene() {
    const center = this.viewport.getCenter();
    this.addLayer("LEVEL SELECTION SCREEN", 1);
    this.initBackground();

    this.Level_Selection = this.addUILayer("Level Selection");

    const Level1 = this.add.uiElement(UIElementType.BUTTON, "Level Selection", {position: new Vec2(center.x - this.viewport.getHalfSize().x + 680, center.y - 53), text: "Level 1"});
    Level1.size.set(545, 120);
    Level1.borderWidth = 2;
    Level1.borderColor = Color.WHITE;
    Level1.backgroundColor = Color.BLACK;
    Level1.onClickEventId = "Level1";

    const Level2 = this.add.uiElement(UIElementType.BUTTON, "Level Selection", {position: new Vec2(center.x - this.viewport.getHalfSize().x + 680, center.y + 71), text: "Level 2"});
    Level2.size.set(545, 120);
    Level2.borderWidth = 2;
    Level2.borderColor = Color.WHITE;
    Level2.backgroundColor = Color.BLACK;
    Level2.onClickEventId = "Level2";

    const Level3 = this.add.uiElement(UIElementType.BUTTON, "Level Selection", {position: new Vec2(center.x - this.viewport.getHalfSize().x + 680, center.y + 195), text: "Level 3"});
    Level3.size.set(545, 120);
    Level3.borderWidth = 2;
    Level3.borderColor = Color.WHITE;
    Level3.backgroundColor = Color.BLACK;
    Level3.onClickEventId = "Level3";

    const Level4 = this.add.uiElement(UIElementType.BUTTON, "Level Selection", {position: new Vec2(center.x - this.viewport.getHalfSize().x + 680, center.y + 317), text: "Level 4"});
    Level4.size.set(545, 120);
    Level4.borderWidth = 2;
    Level4.borderColor = Color.WHITE;
    Level4.backgroundColor = Color.BLACK;
    Level4.onClickEventId = "Level4";


    // Return Button
    const backButton = <Button>this.add.uiElement(
      UIElementType.BUTTON,
      "Level Selection",
      {
        position: new Vec2(
          center.x - this.viewport.getHalfSize().x + 100,
          center.y - this.viewport.getHalfSize().y + 50
        ),
        text: "BACK",
      }
    );

    backButton.size.set(150, 50);
    backButton.borderWidth = 2;
    backButton.borderColor = Color.WHITE;
    backButton.backgroundColor = Color.BLACK;
    backButton.onClickEventId = "return";

    // Subscribe to the button events
    this.receiver.subscribe("return");
    this.receiver.subscribe("Level1");
    this.receiver.subscribe("Level2");
    this.receiver.subscribe("Level3");
    this.receiver.subscribe("Level4");


  }

  public updateScene() {
    while (this.receiver.hasNextEvent()) {
      this.handleEvent(this.receiver.getNextEvent());
    }
  }

  public handleEvent(event: GameEvent): void {
    switch (event.type) {
      case "return":{
        this.sceneManager.changeToScene(MainMenu);
        break;
      }
        case "Level1": {
          this.sceneManager.changeToScene(Level1);
          break;
      }
      case "Level2": {
          this.sceneManager.changeToScene(Level2);
          break;
      }
      case "Level3": {
        this.sceneManager.changeToScene(Level3);
        break;
      }
      case "Level4": {
        this.sceneManager.changeToScene(Level4);
        break;
      }
    }
  }
}
