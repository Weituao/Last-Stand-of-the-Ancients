import Map from "../../DataTypes/Collections/Map";
import ShaderRegistry from "./ShaderRegistry";

/** */
export default abstract class Registry<T> extends Map<T>{

    public static shaders = new ShaderRegistry();

	static preload(){
		this.shaders.preload();
	}
    /** Preloads registry data */
    public abstract preload(): void;

    /**
     * Registers an item and preloads any necessary files
     * @param key The key to register this item with
     * @param args Any additional arguments needed for registration
     */
    public abstract registerAndPreloadItem(key: string, ...args: any): void;

    /**
     * Registers an item and preloads any necessary files
     * @param key The key to register this item with
     * @param args Any aditional arguments needed for registration
     */
    public abstract registerItem(key: string, ...args: any): void;
}