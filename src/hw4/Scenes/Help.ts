import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import MainHW4Scene from "./MainHW4Scene";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import MainMenu from "./MainMenu";

export default class Help extends Scene {
  private Help: Layer;

  public static BACKGROUND_KEY = "HELP SCREEN"
  public static BACKGROUND_PATH = "hw4_assets/Screens/help_screen.png"
  private background: Sprite;


  protected initBackground(): void {
    this.background = this.add.sprite(Help.BACKGROUND_KEY, "HELP SCREEN");
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
    this.load.image(Help.BACKGROUND_KEY, Help.BACKGROUND_PATH);

  }

  public startScene() {
    const center = this.viewport.getCenter();
    this.addLayer("HELP SCREEN", 1);
    this.initBackground();

    this.Help = this.addUILayer("Help");

    // Return Button
    const backButton = <Button>this.add.uiElement(
      UIElementType.BUTTON,
      "Help",
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
  }

  public updateScene() {
    while (this.receiver.hasNextEvent()) {
      this.handleEvent(this.receiver.getNextEvent());
    }
  }

  public handleEvent(event: GameEvent): void {
    switch (event.type) {
      case "return":
        this.sceneManager.changeToScene(MainMenu);
        break;
    }
  }
}
