import Stack from "../../Wolfie2D/DataTypes/Collections/Stack";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import NavPathStrat from "../../Wolfie2D/Pathfinding/Strategies/NavigationStrategy";
import GraphUtils from "../../Wolfie2D/Utils/GraphUtils";

/**
 * This is where the students will be implementing their version of A* - in theory.
 * 
 * The AstarStrategy class is an extension of the abstract NavPathStrategy class. For our navigation system, you can
 * now specify and define your own pathfinding strategy. Originally, the two options were to use Djikstras or a
 * direct (point A -> point B) strategy. The only way to change how the pathfinding was done was by hard-coding things
 * into the classes associated with the navigation system. 
 * 
 * This is the Strategy design pattern ;)
 * @author PeteyLumpkins
 */

// export default class AstarStrategy extends NavPathStrat {

//     /**
//      * @see NavPathStrat.buildPath()
//      */
//     public buildPath(to: Vec2, from: Vec2): NavigationPath {
//         let start = this.mesh.graph.snap(from);
//         let end = this.mesh.graph.snap(to);
    
//         let pathStack = new Stack<Vec2>(this.mesh.graph.numVertices);
        
//         // Push the final position and the final position in the graph
//         pathStack.push(to.clone());
//         pathStack.push(this.mesh.graph.positions[end]);
    
//         // Use A* on the mesh's PositionGraph to find a path from start to end
//         let parent: number[] | null = GraphUtils.astar(this.mesh.graph, start, end, (node: number) => { 
//             return this.mesh.graph.getNodePosition(node).distanceTo(this.mesh.graph.getNodePosition(end)); 
//         });
    
//         // If A* cannot find a path
//         if (parent === null) {
//             return new NavigationPath(pathStack);
//         }
        
//         // Need to push the nodes from the array returned from my implementation into the path stack
//         for (let i = parent.length - 1; i >= 0; i--) {
//             pathStack.push(this.mesh.graph.positions[parent[i]]);
//         }
    
//         return new NavigationPath(pathStack);
//     }
    
// }

export default class AstarStrategy extends NavPathStrat {
    /**
     * Implements pathfinding using A* algorithm.
     * @param to Destination vector.
     * @param from Origin vector.
     * @returns Computed navigation path.
     */
    public buildPath(to: Vec2, from: Vec2): NavigationPath {
        const start = this.mesh.graph.snap(from);
        const end = this.mesh.graph.snap(to);
        const pathStack = new Stack<Vec2>();

        // Prepare path stack with initial and snapped destination positions
        pathStack.push(to.clone());
        pathStack.push(this.mesh.graph.positions[end]);

        // Compute path using A* algorithm
        const parents = this.computePath(start, end);

        // Build final path from computed parents
        if (parents) {
            for (let i = parents.length - 1; i >= 0; i--) {
                pathStack.push(this.mesh.graph.positions[parents[i]]);
            }
        }

        return new NavigationPath(pathStack);
    }

    /**
     * Utilizes A* algorithm to find the shortest path in the graph.
     * @param start Start vertex index in the graph.
     * @param end End vertex index in the graph.
     * @returns Array of parent indices or null if no path found.
     */
    private computePath(start: number, end: number): number[] | null {
        return GraphUtils.astar(this.mesh.graph, start, end, node => 
            this.mesh.graph.getNodePosition(node).distanceTo(this.mesh.graph.getNodePosition(end))
        );
    }
}