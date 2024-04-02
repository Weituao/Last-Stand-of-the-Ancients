import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import MainHW4Scene from "./MainHW4Scene";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import LevelSelection from "./LevelSelection";
import Controls from "./Controls";
import Help from "./Help";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";


export default class MainMenu extends Scene {
    // Layers, for multiple main menu screens
    private mainMenu: Layer;
    private about: Layer;
    private control: Layer;
    private background: Sprite;

    public static BACKGROUND_KEY = "MAIN MENU"
    public static BACKGROUND_PATH = "hw4_assets/Screens/menu_screen.png"

    public loadScene(){
        this.load.image(MainMenu.BACKGROUND_KEY, MainMenu.BACKGROUND_PATH);
    }

    protected initBackground(): void {
		this.background = this.add.sprite(MainMenu.BACKGROUND_KEY, "MAIN MENU");
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

    public startScene(){
        const center = this.viewport.getCenter();
        this.addLayer("MAIN MENU", 1);
		this.initBackground();
        // The main menu
        this.mainMenu = this.addUILayer("mainMenu");


        const play = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x - this.viewport.getHalfSize().x + 691, center.y - 42), text: "START GAME"});
        play.size.set(310, 68);
        play.borderWidth = 2;
        play.borderColor = Color.WHITE;
        play.backgroundColor = Color.BLACK;
        play.onClickEventId = "play";

        const astar = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x - this.viewport.getHalfSize().x + 691, center.y+41), text: "LEVEL SELECTION"});
        astar.size.set(310, 68);
        astar.borderWidth = 2;
        astar.borderColor = Color.WHITE;
        astar.backgroundColor = Color.BLACK;
        astar.onClickEventId = "astar";

        const guard = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x - this.viewport.getHalfSize().x + 690, center.y + 128), text: "CONTROLS"});
        guard.size.set(310, 68);
        guard.borderWidth = 2;
        guard.borderColor = Color.WHITE;
        guard.backgroundColor = Color.BLACK;
        guard.onClickEventId = "guard";

        const Help = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x - this.viewport.getHalfSize().x + 689, center.y + 215), text: "HELP"});
        Help.size.set(310, 68);
        Help.borderWidth = 2;
        Help.borderColor = Color.WHITE;
        Help.backgroundColor = Color.BLACK;
        Help.onClickEventId = "help";
        // Subscribe to the button events
        this.receiver.subscribe("play");
        this.receiver.subscribe("astar");
        this.receiver.subscribe("guard");
        this.receiver.subscribe("help");
    }

    public updateScene(){
        while(this.receiver.hasNextEvent()){
            this.handleEvent(this.receiver.getNextEvent());
        }
    }

    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            case "play": {
                this.sceneManager.changeToScene(MainHW4Scene);
                break;
            }
            case "astar": {
                this.sceneManager.changeToScene(LevelSelection);
                break;
            }
            case "guard": {
                this.sceneManager.changeToScene(Controls);
                break;
            }
            case "help": {
                this.sceneManager.changeToScene(Help);
                break;
            }
        }
    }
}