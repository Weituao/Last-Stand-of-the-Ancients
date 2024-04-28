import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import MainMenu from "./MainMenu";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
export default class GameOver extends Scene {

    startScene() {
        const center = this.viewport.getCenter();

        this.addUILayer("primary");

        const gameOver = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(center.x, center.y), text: "Game Over"});
        gameOver.textColor = Color.WHITE;

    // Return Button
    const backButton = <Button>this.add.uiElement(
        UIElementType.BUTTON,
        "primary",
        {
          position: new Vec2(
            center.x - this.viewport.getHalfSize().x + 195,
            center.y - this.viewport.getHalfSize().y + 190
          ),
          text: "Main Menu",
        }
      );
  
      backButton.size.set(200, 75);
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
            this.viewport.getHalfSize().scale(3.5);
            this.sceneManager.changeToScene(MainMenu);
            break;
        }
      }
}