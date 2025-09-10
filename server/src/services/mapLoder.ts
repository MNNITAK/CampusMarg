import { GraphModel } from "../models/Graph";
import { MyMap } from "../utils/myMap";

export async function loadGraphFromDB() {
  try {
    // Assuming you store a single graph doc in DB
    const graphDoc = await GraphModel.findOne();

    if (!graphDoc) {
      console.warn("No graph found in DB. MyMap will stay empty.");
      return;
    }

    // Clear old in-memory data
    MyMap.clear();

    // Load nodes & edges from DB into MyMap
    graphDoc.nodes.forEach(node => MyMap.addNode(node));
    graphDoc.edges.forEach(edge => MyMap.addEdge(edge));

    console.log(" Graph loaded into MyMap from DB");
    console.log(" Nodes:", MyMap.getAllNodes(), "Edges:", MyMap.getAllEdges());
  } catch (err) {
    console.error(" Failed to load graph from DB:", err);
  }
}


