"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDijkstra = runDijkstra;
const myMap_1 = require("../utils/myMap");
const PathCache_1 = require("../models/PathCache");
function runDijkstra(startId, endId, mode = "normal") {
    const { nodes, edges } = myMap_1.MyMap.getGraph(); //here we get the graph object as nodes and edges
    const startNode = nodes.find((n) => n.id === startId);
    const endNode = nodes.find((n) => n.id === endId);
    if (!startNode || !endNode) {
        throw new Error("Invalid start or end node.");
    }
    //  CASE 1: Same floor → run normal Dijkstra
    if (startNode.floor === endNode.floor) {
        return runSingleFloorDijkstra(startId, endId, mode);
    }
    //  CASE 2: Different floors → need transitions
    const pathSteps = [];
    // 1. Find nearest stair/lift from END side
    const destTransition = findNearestTransition(endNode);
    // 2. Find nearest stair/lift from START side
    const startTransition = findNearestTransition(startNode);
    if (!destTransition || !startTransition) {
        throw new Error("No stairs/lift found for multi-floor path.");
    }
    // 3. Compute path: end → destTransition
    const toTransition = runSingleFloorDijkstra(endId, destTransition.id, mode);
    // 4. Vertical movement (stairs/lift) between floors
    const verticalSteps = buildVerticalPath(destTransition, startTransition);
    // 5. Compute path: startTransition → start
    const fromTransition = runSingleFloorDijkstra(startTransition.id, startId, mode);
    // 6. Stitch everything into one path
    pathSteps.push(...toTransition.path);
    pathSteps.push(...verticalSteps);
    pathSteps.push(...fromTransition.path);
    return new PathCache_1.PathResult({
        mode,
        path: pathSteps,
        totalDistance: toTransition.totalDistance +
            verticalSteps.length + // each floor movement = +1 unit
            fromTransition.totalDistance,
        totalTime: Math.round((pathSteps.length / 1.4) * 100) / 100,
        cached: false,
    });
}
/**
 * Run basic Dijkstra on one floor (no floor switching)
 */
function runSingleFloorDijkstra(startId, endId, mode) {
    const { nodes, edges } = myMap_1.MyMap.getGraph();
    const distances = {};
    const previous = {};
    const visited = new Set();
    for (const node of nodes) {
        distances[node.id] = Infinity;
        previous[node.id] = null;
    }
    distances[startId] = 0;
    while (visited.size < nodes.length) {
        const currentId = Object.keys(distances)
            .filter((id) => !visited.has(id))
            .reduce((minNode, id) => distances[id] < (distances[minNode] ?? Infinity) ? id : minNode, "");
        if (!currentId || distances[currentId] === Infinity)
            break;
        visited.add(currentId);
        if (currentId === endId)
            break;
        const neighbors = edges.filter((e) => e.from === currentId || (e.bidirectional !== false && e.to === currentId));
        for (const edge of neighbors) {
            const neighborId = edge.from === currentId ? edge.to : edge.from;
            if (mode === "wheelchair") {
                const neighborNode = nodes.find((n) => n.id === neighborId);
                if (neighborNode && neighborNode.accessible === false)
                    continue;
            }
            const alt = distances[currentId] + edge.weight;
            if (alt < distances[neighborId]) {
                distances[neighborId] = alt;
                previous[neighborId] = currentId;
            }
        }
    }
    // Reconstruct path
    const pathSteps = [];
    let current = endId;
    while (current && previous[current] !== null) {
        const from = previous[current];
        if (!from)
            break;
        const fromNode = nodes.find((n) => n.id === from);
        const toNode = nodes.find((n) => n.id === current);
        if (fromNode && toNode) {
            pathSteps.unshift({
                from: fromNode.id,
                to: toNode.id,
                coordinates: [
                    { x: fromNode.coordinates.x, y: fromNode.coordinates.y, floor: fromNode.floor },
                    { x: toNode.coordinates.x, y: toNode.coordinates.y, floor: toNode.floor },
                ],
                instruction: generateInstruction(fromNode, toNode),
            });
        }
        current = from;
    }
    return new PathCache_1.PathResult({
        mode,
        path: pathSteps,
        totalDistance: distances[endId] === Infinity ? 0 : distances[endId],
        totalTime: Math.round((distances[endId] / 1.4) * 100) / 100,
        cached: false,
    });
}
/**
 * Find nearest stair/lift node to a given node
 */
function findNearestTransition(node) {
    const { nodes, edges } = myMap_1.MyMap.getGraph();
    const transitions = nodes.filter((n) => n.type === "lift" || n.type === "stair");
    if (transitions.length === 0)
        return null;
    let nearest = transitions[0];
    let minDist = Math.abs(node.coordinates.x - nearest.coordinates.x) +
        Math.abs(node.coordinates.y - nearest.coordinates.y);
    for (const t of transitions) {
        const dist = Math.abs(node.coordinates.x - t.coordinates.x) +
            Math.abs(node.coordinates.y - t.coordinates.y);
        if (dist < minDist) {
            minDist = dist;
            nearest = t;
        }
    }
    return nearest;
}
/**
 * Create vertical steps (stairs/lift movement)
 */
function buildVerticalPath(from, to) {
    const { nodes, edges } = myMap_1.MyMap.getGraph();
    const steps = [];
    if (from.id !== to.id)
        return steps; // only works if same stair/lift ID across floors
    let currentFloor = from.floor;
    while (currentFloor !== to.floor) {
        const nextFloor = currentFloor < to.floor ? currentFloor + 1 : currentFloor - 1;
        steps.push({
            from: from.id,
            to: to.id,
            coordinates: [
                { x: from.coordinates.x, y: from.coordinates.y, floor: currentFloor },
                { x: from.coordinates.x, y: from.coordinates.y, floor: nextFloor },
            ],
            instruction: from.type === "lift"
                ? `Take lift from floor ${currentFloor} to floor ${nextFloor}`
                : `Use stairs from floor ${currentFloor} to floor ${nextFloor}`,
        });
        currentFloor = nextFloor;
    }
    return steps;
}
/**
 * Generate human-readable instructions
 */
function generateInstruction(from, to) {
    const { nodes, edges } = myMap_1.MyMap.getGraph();
    if (from.floor !== to.floor) {
        return to.type === "lift"
            ? `Take lift from floor ${from.floor} to floor ${to.floor}`
            : `Use stairs from floor ${from.floor} to floor ${to.floor}`;
    }
    return `Move from ${from.name} to ${to.name}`;
}
// its saying it node do not have entry coordinates but see in graph schema  there  is cordinates in node 
