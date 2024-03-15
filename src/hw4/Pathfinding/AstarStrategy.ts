// import Stack from "../../Wolfie2D/DataTypes/Collections/Stack";
// import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
// import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
// import NavPathStrat from "../../Wolfie2D/Pathfinding/Strategies/NavigationStrategy";
// import GraphUtils from "../../Wolfie2D/Utils/GraphUtils";

// // TODO Construct a NavigationPath object using A*

// /**
//  * The AstarStrategy class is an extension of the abstract NavPathStrategy class. For our navigation system, you can
//  * now specify and define your own pathfinding strategy. Originally, the two options were to use Djikstras or a
//  * direct (point A -> point B) strategy. The only way to change how the pathfinding was done was by hard-coding things
//  * into the classes associated with the navigation system. 
//  * 
//  * - Peter
//  */
// export default class AstarStrategy extends NavPathStrat {

//     /**
//      * @see NavPathStrat.buildPath()
//      */
//     public buildPath(to: Vec2, from: Vec2): NavigationPath {
//         let stack = new Stack<Vec2>();
//         stack.push(to.clone());
//         return new NavigationPath(stack);
//     }
    
// }
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import NavPathStrat from "../../Wolfie2D/Pathfinding/Strategies/NavigationStrategy";
import Stack from "../../Wolfie2D/DataTypes/Collections/Stack";

/**
 * The AstarStrategy class is an extension of the abstract NavPathStrategy class.
 * It implements the A* pathfinding algorithm to find the shortest path from
 * the start position to the goal position.
 */
export default class AstarStrategy extends NavPathStrat {
    // You may need to provide additional properties and methods here

    /**
     * Builds a navigation path using the A* algorithm.
     * @param to The destination position.
     * @param from The starting position.
     * @returns A NavigationPath object representing the path from start to goal.
     */
    public buildPath(to: Vec2, from: Vec2): NavigationPath {
        // Initialize data structures
        const openSet = new Set<Vec2>();
        openSet.add(from);
        const cameFrom: Map<Vec2, Vec2> = new Map();
        const gScore: Map<Vec2, number> = new Map();
        const fScore: Map<Vec2, number> = new Map();

        // Initialize scores for the starting node
        gScore.set(from, 0);
        fScore.set(from, this.heuristic(from, to));

        while (openSet.size > 0) {
            // Find the node in openSet with the lowest fScore
            let current: Vec2 | null = null;
            let minFScore = Infinity;
            for (const node of openSet) {
                const f = fScore.get(node) || Infinity;
                if (f < minFScore) {
                    minFScore = f;
                    current = node;
                }
            }

            if (!current) {
                // Should not happen if heuristic is consistent
                break;
            }

            if (current.equals(to)) {
                // Reconstruct and return the path
                return this.reconstructPath(cameFrom, current);
            }

            openSet.delete(current);

            // Iterate through neighbors of current node
            // Assuming getNeighbors function exists and returns an array of neighboring positions
            for (const neighbor of this.getNeighbors(current)) {
                // Calculate tentative gScore
                const tentativeGScore = (gScore.get(current) || Infinity) + this.distance(current, neighbor);

                if (tentativeGScore < (gScore.get(neighbor) || Infinity)) {
                    // This path is better than previous ones, update scores
                    cameFrom.set(neighbor, current);
                    gScore.set(neighbor, tentativeGScore);
                    fScore.set(neighbor, tentativeGScore + this.heuristic(neighbor, to));

                    if (!openSet.has(neighbor)) {
                        openSet.add(neighbor);
                    }
                }
            }
        }

        // Open set is empty but goal was never reached
        return new NavigationPath(new Stack<Vec2>());
    }

    // Helper function to reconstruct the path
    private reconstructPath(cameFrom: Map<Vec2, Vec2>, current: Vec2): NavigationPath {
        const totalPath = new Stack<Vec2>();
        totalPath.push(current);
        while (cameFrom.has(current)) {
            current = cameFrom.get(current)!;
            totalPath.push(current);
        }
        return new NavigationPath(totalPath);
    }

    // Placeholder functions, you should implement these based on your requirements
    private heuristic(from: Vec2, to: Vec2): number {
        // Implement your heuristic function here, for example, Manhattan distance
        return Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
    }

    private distance(from: Vec2, to: Vec2): number {
        // Implement your distance function here, for example, Euclidean distance
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private getNeighbors(position: Vec2): Vec2[] {
        return [
            new Vec2(position.x + 1, position.y),
            new Vec2(position.x - 1, position.y),
            new Vec2(position.x, position.y + 1),
            new Vec2(position.x, position.y - 1)
        ];
    }
}
