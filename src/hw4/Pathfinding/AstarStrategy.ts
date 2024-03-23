import Stack from "../../Wolfie2D/DataTypes/Collections/Stack";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import NavPathStrat from "../../Wolfie2D/Pathfinding/Strategies/NavigationStrategy";

interface Pixels {
    node: number;
    a: number;
    b: number;
    ancestor: number | null;
  }
  // Helper functions also defined outside of the class
  function available(set: Set<Pixels>, boolean: (element: Pixels) => boolean): Pixels | undefined {
    const recursive = set.values();
    let result = recursive.next();
    while (!result.done) {
        switch (boolean(result.value)) {
            case true:
                return result.value;
            default:
                // No action needed
                break;
        }
        result = recursive.next();
    }
    return undefined;
}


  
function thereIsPixels(set: Set<Pixels>, pixelTags: number): boolean {
    const recursive = set.values();
    let result = recursive.next();
    while (!result.done) {
        switch (result.value.node === pixelTags) {
            case true:
                return true;
            default:
                // No action needed
                break;
        }
        result = recursive.next();
    }
    return false;
}


export default class AstarStrategy extends NavPathStrat {
    public buildPath(then: Vec2, now: Vec2): NavigationPath {
        let beginning = this.mesh.graph.snap(now);
        let finish = this.mesh.graph.snap(then);
        let allPixels: Pixels[] = [];
        allPixels.push({
            node: beginning,
            a: 0,b: 0, ancestor: null
        });

        let noPixels = new Set<Pixels>();
        for (; allPixels.length > 0;) {
            let thisPosition = 0;
            let i = 0;
            while (i < allPixels.length) {
                switch (true) {
                    case allPixels[i].a + allPixels[i].b < allPixels[thisPosition].a + allPixels[thisPosition].b:
                        thisPosition = i;
                        break;
                    default:
                        // No action needed
                        break;
                }
                i++;
            }
        
            let thisPixel = allPixels[thisPosition];
            switch (true) {
                case thisPixel.node === finish:
                    let pixelBunch = new Stack<Vec2>(this.mesh.graph.numVertices);
                    pixelBunch.push(then.clone());
                    pixelBunch.push(this.mesh.graph.getNodePosition(finish));
        
                    for (let tempNode = thisPixel; tempNode.ancestor !== null; tempNode = available(noPixels, n => n.node === tempNode.ancestor) || tempNode) {
                        pixelBunch.push(this.mesh.graph.getNodePosition(tempNode.node));
                    }
        
                    return new NavigationPath(pixelBunch);
                default:
                    // No action needed
                    break;
            }
        
            allPixels.splice(thisPosition, 1);
            noPixels.add(thisPixel);
        
            let nextPixel = this.mesh.graph.getEdges(thisPixel.node);
        
            for (; nextPixel !== null; nextPixel = nextPixel.next) {
                let theNextPixel = nextPixel.y;
                switch (true) {
                    case thereIsPixels(noPixels, theNextPixel):
                        continue;
                    default:
                        let aOne = thisPixel.a + this.howFar(thisPixel.node, theNextPixel);
                        let nextOfAOne = allPixels.find(n => n.node === theNextPixel);
                        switch (true) {
                            case !nextOfAOne || aOne < nextOfAOne.a:
                                switch (true) {
                                    case !nextOfAOne:
                                        allPixels.push({
                                            node: theNextPixel,
                                            a: aOne,
                                            b: this.makePath(this.mesh.graph.getNodePosition(theNextPixel), then, now),
                                            ancestor: thisPixel.node
                                        });
                                        break;
                                    default:
                                        nextOfAOne.a = aOne;
                                        nextOfAOne.ancestor = thisPixel.node;
                                        break;
                                }
                                break;
                            default:
                                // No action needed
                                break;
                        }
                        break;
                }
            }
        }
        
        return new NavigationPath(new Stack<Vec2>());
    }

    // Adjust the heuristic to consider the 2 by 2 node area and encourage moving up first
    makePath(fromPosition: Vec2, toPosition: Vec2, from: Vec2): number {
        let thisA = Math.abs(fromPosition.x - toPosition.x);
        let thisB = Math.abs(fromPosition.y - toPosition.y);
        switch (true) {
            case fromPosition.x <= toPosition.x && fromPosition.y >= toPosition.y:
                thisB -= Math.abs(fromPosition.y - from.y);
                break;
            default:
                // No adjustment needed
                break;
        }
        return Math.max(thisA, thisB);
    }
    

    // Update distBetween to calculate the distance between 2 by 2 nodes
    howFar(nodeIndex1: number, nodeIndex2: number): number {
        let firstPixel = this.mesh.graph.getNodePosition(nodeIndex1);
        let secondPixel = this.mesh.graph.getNodePosition(nodeIndex2);
        return Math.sqrt(Math.pow(firstPixel.x - secondPixel.x, 2) + Math.pow(firstPixel.y - secondPixel.y, 2));
    }
}
