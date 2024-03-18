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

// import Stack from "../../Wolfie2D/DataTypes/Collections/Stack";
// import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
// import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
// import NavPathStrat from "../../Wolfie2D/Pathfinding/Strategies/NavigationStrategy";
// import GraphUtils from "../../Wolfie2D/Utils/GraphUtils";

// export default class AstarStrategy extends NavPathStrat {
//     public buildPath(to: Vec2, from: Vec2): NavigationPath {
//         // Initialize both open and closed list
//         let openList = [];
//         let closedList = [];

//         // Add the start node
//         openList.push(from);

//         // Loop until you find the end
//         while (openList.length > 0) {
//             // Get the current node
//             let currentNode = openList[0];
//             let currentIndex = 0;

//             // Find the node with the least f in the open list
//             for (let index = 0; index < openList.length; index++) {
//                 if (openList[index].f < currentNode.f) {
//                     currentNode = openList[index];
//                     currentIndex = index;
//                 }
//             }

//             // Pop current off open list, add to closed list
//             openList.splice(currentIndex, 1);
//             closedList.push(currentNode);

//             // Found the goal
//             if (currentNode === to) {
//                 let path = new Stack<Vec2>();
//                 while (currentNode !== from) {
//                     path.push(currentNode);
//                     currentNode = currentNode.parent;
//                 }
//                 return new NavigationPath(path);
//             }

//             // Generate children
//             let children = [];
//             // for each neighbor of the current node
//             // This part needs to be implemented based on your grid/map structure

//             // Loop through children
//             for (let child of children) {
//                 // Child is on the closed list
//                 if (closedList.includes(child)) {
//                     continue;
//                 }

//                 // Create the f, g, and h values
//                 child.g = currentNode.g + 1;
//                 child.h = // Implement heuristic here, e.g., distance to 'to' node
//                 child.f = child.g + child.h;

//                 // Child is already in open list
//                 if (openList.find(openNode => openNode === child && child.g > openNode.g)) {
//                     continue;
//                 }

//                 // Add the child to the open list
//                 openList.push(child);
//             }
//         }

//         // Return failed path (empty stack) if no path is found
//         return new NavigationPath(new Stack<Vec2>());
//     }
// }

// import Stack from "../../Wolfie2D/DataTypes/Collections/Stack";
// import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
// import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
// import NavPathStrat from "../../Wolfie2D/Pathfinding/Strategies/NavigationStrategy";
// import GraphUtils from "../../Wolfie2D/Utils/GraphUtils";

// export default class AstarStrategy extends NavPathStrat {
//     public buildPath(to: Vec2, from: Vec2): NavigationPath {
//         // Example implementation - you'll need to adapt this based on your game's data structures

//         // Initialize the open list (nodes to be evaluated) and closed list (nodes already evaluated)
//         let openList: any[] = [];
//         let closedList: any[] = [];

//         // Start node and end node
//         let startNode = { position: from, g: 0, h: this.heuristic(from, to), f: 0, parent: null };
//         let endNode = { position: to, g: 0, h: 0, f: 0, parent: null };
//         startNode.f = startNode.g + startNode.h;

//         // Add the start node to the open list
//         openList.push(startNode);

//         while (openList.length > 0) {
//             // Get the current node (the node with the lowest f cost)
//             let currentNode = openList.reduce((prev, curr) => prev.f < curr.f ? prev : curr);

//             // Move the current node from the open list to the closed list
//             openList = openList.filter(node => node !== currentNode);
//             closedList.push(currentNode);

//             // Check if we have reached the goal, reconstruct the path and return it
//             if (currentNode.position.equals(to)) {
//                 return this.reconstructPath(currentNode);
//             }

//             // Generate currentNode's neighbors
//             let neighbors = this.getNeighbors(currentNode);

//             for (let neighbor of neighbors) {
//                 // If neighbor is in the closed list, skip it
//                 if (closedList.find(node => node.position.equals(neighbor.position))) {
//                     continue;
//                 }

//                 // The distance from start to the neighbor
//                 let tentativeGScore = currentNode.g + currentNode.position.distanceTo(neighbor.position);

//                 // If neighbor is not in open list, add it
//                 if (!openList.find(node => node.position.equals(neighbor.position))) {
//                     openList.push(neighbor);
//                 } else if (tentativeGScore >= neighbor.g) {
//                     // This is not a better path
//                     continue;
//                 }

//                 // This path is the best until now, record it
//                 neighbor.parent = currentNode;
//                 neighbor.g = tentativeGScore;
//                 neighbor.f = neighbor.g + neighbor.h;
//             }
//         }

//         // Failed to find a path
//         return new NavigationPath(new Stack());
//     }

//     private heuristic(position: Vec2, goal: Vec2): number {
//         // Implement your heuristic here. For example, Euclidean distance or Manhattan distance
//         return position.distanceTo(goal);
//     }

//     private getNeighbors(node: any): any[] {
//         // Implement a method to get neighbors of the given node
//         // This will depend on your game's grid structure
//         // For example, you might return up to 8 neighbors (N, NE, E, SE, S, SW, W, NW)
//         return [];
//     }

//     private reconstructPath(node: any): NavigationPath {
//         let path = new Stack<Vec2>();
//         while (node != null) {
//             path.push(node.position);
//             node = node.parent;
//         }
//         return new NavigationPath(path);
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
