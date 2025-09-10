import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useRouter } from 'expo-router';
import axios from "axios";

type Path = {
  from: string;
  to: string;
  coordinates: {
    x: number;
    y: number;
    floor: number;
  }[];
  instruction?: string;
};


type AppContextType = {
  initial: string | null;
  setInitial: (val: string | null) => void;
  final: string | null;
  setFinal: (val: string | null) => void;
  disable: boolean;
  setDisable: (val: boolean) => void;
  path: Path[];
  setPath: (val: Path[]) => void;
  getPath: () => Promise<any>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const BASE_URL = 'http://172.18.243.174:5000/api';
  const router = useRouter();
  const [initial, setInitial] = useState<string | null>(null);
  const [final, setFinal] = useState<string | null>(null);
  const [disable, setDisable] = useState<boolean>(false);
  const [path, setPath] = useState<Path[]>([]);


//   while(final==null && initial==null){
// console.log("final,initial",final,initial)
//   }

const getPath = useCallback(async (): Promise<any> => {
  console.log("Initial, final", final, initial);

  if (!initial || !final) {
    console.error("Initial or final ID is not set");
    return;
  }

  console.log("Fetching path with:", { initial, final, disable });

  try {
    const response = await axios.post(
      `${BASE_URL}/acad/getpath`,
      { initial, final, disable },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log("Response for /acad/getpath", response);

    // ✅ Check if path exists in the response
    const pathData = response.data?._doc?.path;
    if (!pathData) {
      throw new Error("No path data found in the response");
    }

    setPath(pathData);

    return response.data;
  } catch (error) {
    console.error("Error fetching path:", error);
    throw error;
  }
}, [initial, final, disable]);

  return (
    <AppContext.Provider
      value={{
        initial,
        setInitial,
        final,
        setFinal,
        disable,
        setDisable,
        getPath,
        path,
        setPath
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }
  return context;
}





// "path": [
//             {
//                 "from": "S1",
//                 "to": "J1",
//                 "coordinates": [
//                     {
//                         "x": 25,
//                         "y": 60,
//                         "floor": 1
//                     },
//                     {
//                         "x": 25,
//                         "y": 40,
//                         "floor": 1
//                     }
//                 ],
//                 "instruction": "Move from Staircase 1 to Junction 1"
//             },
//             {
//                 "from": "J1",
//                 "to": "C1",
//                 "coordinates": [
//                     {
//                         "x": 25,
//                         "y": 40,
//                         "floor": 1
//                     },
//                     {
//                         "x": 20,
//                         "y": 20,
//                         "floor": 1
//                     }
//                 ],
//                 "instruction": "Move from Junction 1 to Corridor 1"
//             },
//             {
//                 "from": "C1",
//                 "to": "R101",
//                 "coordinates": [
//                     {
//                         "x": 20,
//                         "y": 20,
//                         "floor": 1
//                     },
//                     {
//                         "x": 10,
//                         "y": 20,
//                         "floor": 1
//                     }
//                 ],
//                 "instruction": "Move from Corridor 1 to Classroom 101"
//             }
//         ],