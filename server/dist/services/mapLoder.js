"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadGraphFromDB = loadGraphFromDB;
const Graph_1 = require("../models/Graph");
const myMap_1 = require("../utils/myMap");
async function loadGraphFromDB() {
    try {
        // Assuming you store a single graph doc in DB
        const graphDoc = await Graph_1.GraphModel.findOne();
        if (!graphDoc) {
            console.warn("No graph found in DB. MyMap will stay empty.");
            return;
        }
        // Clear old in-memory data
        myMap_1.MyMap.clear();
        // Load nodes & edges from DB into MyMap
        graphDoc.nodes.forEach(node => myMap_1.MyMap.addNode(node));
        graphDoc.edges.forEach(edge => myMap_1.MyMap.addEdge(edge));
        console.log(" Graph loaded into MyMap from DB");
        console.log(" Nodes:", myMap_1.MyMap.getAllNodes(), "Edges:", myMap_1.MyMap.getAllEdges());
    }
    catch (err) {
        console.error(" Failed to load graph from DB:", err);
    }
}
