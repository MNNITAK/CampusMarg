import { Request, Response } from "express";
import { MyMap } from "../utils/myMap";        
import { PathResult } from "../models/PathCache";
import { runDijkstra } from "../services/graphService";
import { IPathResult } from "../models/PathCache";


export const getPath = async (req: Request, res: Response) => {
  try {
    
    const { initial, final, disable } = req.body;
    console.log(initial,final,disable,"initial,final,disable in pathApi.ts");
    
    
    //initial and final are node ids
    const initialNode = MyMap.getNodeById(initial); //got the initial node object
    const finalNode = MyMap.getNodeById(final);  // got the final node object

    if (!initialNode || !finalNode) {
     
      return res.status(404).json({ error: "Invalid initial or final location" });
    }

    const mode: "normal" | "wheelchair" = disable ? "wheelchair" : "normal";  //disable =boolean
 
    // const cachedPath = MyMap.getCachedPath(initial, final, mode);
    // if (cachedPath) {
    //   return res.json({
    //     ...cachedPath,
    //     cached: true,
    //   });
    // }


    //for now removing the cache path calculation to test functinality of functions in sequential manner


    // const graph = MyMap.getGraph();
    const path: IPathResult = runDijkstra(initialNode.id, finalNode.id, mode);
    if (!path || !path.path.length) {
      return res.status(400).json({ error: "No path found" });
    }


    
    MyMap.saveCachedPath(path);

  
    await PathResult.create({
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

  } catch (err: any) {
    console.error("Path calculation error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
