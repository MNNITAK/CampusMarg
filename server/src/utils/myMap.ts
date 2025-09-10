
//mymap is a temporary copy of database
//instead of using database directly , we will use mymap for fetching all info about nodes,edges and cached paths

import { INode } from "../models/Node";
import { IEdge } from "../models/Edge";
import { IGraph } from "../models/Graph";
import { IPathResult } from "../models/PathCache"; 


//these nodes , edges , cachedPaths arrays will be in local memory untill server restarts
// they are not stored in database
// This is a simple in-memory representation of the map
//instead of using a database , we will use in memory data structure
let nodes: INode[] = [];
let edges: IEdge[] = [];
let cachedPaths: IPathResult[] = [];



//my map is a object
export const MyMap = {
  
  addNode: (node: INode): INode => {
    nodes.push(node);
    return node;
  },

  getNodeById: (id: string): INode | undefined => {
    return nodes.find((n) => n.id === id);
  },

  getAllNodes: (): INode[] => nodes,


  addEdge: (edge: IEdge): IEdge=> {
    edges.push(edge);
    return edge;
  },

  getAllEdges: (): IEdge[] => edges,



  getGraph: (): IGraph => {
    return { nodes:nodes, edges:edges } as IGraph; // Return a graph object
  },

  
  saveCachedPath: (path: IPathResult): IPathResult=> {
    // Check if same route (from -> to with same mode) already cached
    const existing = cachedPaths.find(
      (p) =>
        p.path[0]?.from === path.path[0]?.from &&
        p.path[p.path.length - 1]?.to === path.path[path.path.length - 1]?.to &&
        p.mode === path.mode
    );

    if (!existing) {
      path.cached = true; 
      cachedPaths.push(path);
    }
    return path;
  },

  getCachedPath: (
    from: string,
    to: string,
    mode: "normal" | "wheelchair" | "emergency"
  ): IPathResult | undefined => {
    return cachedPaths.find(
      (p) =>
        p.path[0]?.from === from &&
        p.path[p.path.length - 1]?.to === to &&
        p.mode === mode
    );
  },

  getAllCachedPaths: (): IPathResult[] => cachedPaths,


  clear: (): void => {
    nodes = [];
    edges = [];
    cachedPaths = [];
  },
};

