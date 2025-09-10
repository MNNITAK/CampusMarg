"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPath = void 0;
const myMap_1 = require("../utils/myMap");
const PathCache_1 = require("../models/PathCache");
const graphService_1 = require("../services/graphService");
const getPath = async (req, res) => {
    try {
        const { initial, final, disable } = req.body;
        console.log(initial, final, disable, "initial,final,disable in pathApi.ts");
        //initial and final are node ids
        const initialNode = myMap_1.MyMap.getNodeById(initial); //got the initial node object
        const finalNode = myMap_1.MyMap.getNodeById(final); // got the final node object
        if (!initialNode || !finalNode) {
            return res.status(404).json({ error: "Invalid initial or final location" });
        }
        const mode = disable ? "wheelchair" : "normal"; //disable =boolean
        // const cachedPath = MyMap.getCachedPath(initial, final, mode);
        // if (cachedPath) {
        //   return res.json({
        //     ...cachedPath,
        //     cached: true,
        //   });
        // }
        //for now removing the cache path calculation to test functinality of functions in sequential manner
        // const graph = MyMap.getGraph();
        const path = (0, graphService_1.runDijkstra)(initialNode.id, finalNode.id, mode);
        if (!path || !path.path.length) {
            return res.status(400).json({ error: "No path found" });
        }
        myMap_1.MyMap.saveCachedPath(path);
        await PathCache_1.PathResult.create({
            from: initial,
            to: final,
            mode,
            path: path.path,
            totalDistance: path.totalDistance,
            totalTime: path.totalTime,
            cached: true,
        });
        return res.json({
            ...path,
            cached: false,
        });
    }
    catch (err) {
        console.error("Path calculation error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.getPath = getPath;
