import Stack from "../../Wolfie2D/DataTypes/Collections/Stack";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import NavPathStrat from "../../Wolfie2D/Pathfinding/Strategies/NavigationStrategy";
import GraphUtils from "../../Wolfie2D/Utils/GraphUtils";

// TODO Construct a NavigationPath object using A*

/**
 * The AstarStrategy class is an extension of the abstract NavPathStrategy class. For our navigation system, you can
 * now specify and define your own pathfinding strategy. Originally, the two options were to use Djikstras or a
 * direct (point A -> point B) strategy. The only way to change how the pathfinding was done was by hard-coding things
 * into the classes associated with the navigation system. 
 * 
 * - Peter
 */




// Make sure to define the Node interface outside of the class
interface Node {
    node: number;
    g: number;
    h: number;
    parent: number | null;
  }
  
  // Helper functions also defined outside of the class
  function findInSet(set: Set<Node>, predicate: (element: Node) => boolean): Node | undefined {
      for (let item of set) {
          if (predicate(item)) {
              return item;
          }
      }
      return undefined;
  }
  
  function hasNode(set: Set<Node>, nodeNumber: number): boolean {
      for (let item of set) {
          if (item.node === nodeNumber) {
              return true;
          }
      }
      return false;
  }
  
  // The AstarStrategy class
  export default class AstarStrategy extends NavPathStrat {
      public buildPath(to: Vec2, from: Vec2): NavigationPath {
          let start = this.mesh.graph.snap(from);
          let end = this.mesh.graph.snap(to);
  
          let openSet: Node[] = [];
          openSet.push({
              node: start,
              g: 0,
              h: 0,
              parent: null
          });
  
          let closedSet = new Set<Node>();
  
          while (openSet.length > 0) {
              let currentIndex = 0;
              for (let i = 0; i < openSet.length; i++) {
                  if (openSet[i].g + openSet[i].h < openSet[currentIndex].g + openSet[currentIndex].h) {
                      currentIndex = i;
                  }
              }
              let currentNode = openSet[currentIndex];
  
              if (currentNode.node === end) {
                  let pathStack = new Stack<Vec2>(this.mesh.graph.numVertices);
                  pathStack.push(to.clone());
                  pathStack.push(this.mesh.graph.getNodePosition(end));
  
                  while (currentNode.parent !== null) {
                      pathStack.push(this.mesh.graph.getNodePosition(currentNode.node));
                      currentNode = findInSet(closedSet, n => n.node === currentNode.parent) || currentNode;
                  }
  
                  return new NavigationPath(pathStack);
              }
  
              openSet.splice(currentIndex, 1);
              closedSet.add(currentNode);
  
              let currentNeighbor = this.mesh.graph.getEdges(currentNode.node);
              while (currentNeighbor) {
                  let neighborNodeIndex = currentNeighbor.y;
  
                  if (hasNode(closedSet, neighborNodeIndex)) {
                      currentNeighbor = currentNeighbor.next;
                      continue;
                  }
  
                  let gScore = currentNode.g + this.distBetween(currentNode.node, neighborNodeIndex);
                  let neighborObj = openSet.find(n => n.node === neighborNodeIndex);
  
                  if (!neighborObj || gScore < neighborObj.g) {
                      if (!neighborObj) {
                          openSet.push({
                              node: neighborNodeIndex,
                              g: gScore,
                              h: this.heuristic(this.mesh.graph.getNodePosition(neighborNodeIndex), to),
                              parent: currentNode.node
                          });
                      } else {
                          neighborObj.g = gScore;
                          neighborObj.parent = currentNode.node;
                      }
                  }
  
                  currentNeighbor = currentNeighbor.next;
              }
          }
  
          return new NavigationPath(new Stack<Vec2>());
      }
  
      heuristic(fromPosition: Vec2, toPosition: Vec2): number {
          return Math.abs(fromPosition.x - toPosition.x) + Math.abs(fromPosition.y - toPosition.y);
      }
  
      distBetween(nodeIndex1: number, nodeIndex2: number): number {
          return 1; // This should be replaced with actual logic to calculate the distance
      }
  }

