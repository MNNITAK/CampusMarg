"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = __importDefault(require("./config/config"));
const mapLoder_1 = require("./services/mapLoder");
const cors_1 = __importDefault(require("cors"));
const route_1 = __importDefault(require("./routes/route"));
const Graph_1 = require("./models/Graph");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 5000;
app.use(express_1.default.json());
const corsOptions = {
    origin: ["http://localhost:8081", "*"]
};
const graph = [
    {
        "nodes": [
            { "id": "R101", "name": "Classroom 101", "type": "room", "floor": 1, "coordinates": { "x": 10, "y": 20 }, "accessible": true },
            { "id": "R102", "name": "Classroom 102", "type": "room", "floor": 1, "coordinates": { "x": 30, "y": 20 }, "accessible": true },
            { "id": "R103", "name": "Classroom 103", "type": "room", "floor": 1, "coordinates": { "x": 50, "y": 20 }, "accessible": true },
            { "id": "C1", "name": "Corridor 1", "type": "corridor", "floor": 1, "coordinates": { "x": 20, "y": 20 }, "accessible": true },
            { "id": "C2", "name": "Corridor 2", "type": "corridor", "floor": 1, "coordinates": { "x": 40, "y": 20 }, "accessible": true },
            { "id": "J1", "name": "Junction 1", "type": "junction", "floor": 1, "coordinates": { "x": 25, "y": 40 }, "accessible": true },
            { "id": "S1", "name": "Staircase 1", "type": "stair", "floor": 1, "coordinates": { "x": 25, "y": 60 }, "accessible": false },
            { "id": "L1", "name": "Lift 1", "type": "lift", "floor": 1, "coordinates": { "x": 25, "y": 65 }, "accessible": true },
            { "id": "R201", "name": "Classroom 201", "type": "room", "floor": 2, "coordinates": { "x": 10, "y": 20 }, "accessible": true },
            { "id": "R202", "name": "Classroom 202", "type": "room", "floor": 2, "coordinates": { "x": 30, "y": 20 }, "accessible": true },
            { "id": "R203", "name": "Classroom 203", "type": "room", "floor": 2, "coordinates": { "x": 50, "y": 20 }, "accessible": true },
            { "id": "C3", "name": "Corridor 3", "type": "corridor", "floor": 2, "coordinates": { "x": 20, "y": 20 }, "accessible": true },
            { "id": "C4", "name": "Corridor 4", "type": "corridor", "floor": 2, "coordinates": { "x": 40, "y": 20 }, "accessible": true },
            { "id": "J2", "name": "Junction 2", "type": "junction", "floor": 2, "coordinates": { "x": 25, "y": 40 }, "accessible": true },
            { "id": "S2", "name": "Staircase 1 (Floor 2)", "type": "stair", "floor": 2, "coordinates": { "x": 25, "y": 60 }, "accessible": false },
            { "id": "L2", "name": "Lift 1 (Floor 2)", "type": "lift", "floor": 2, "coordinates": { "x": 25, "y": 65 }, "accessible": true }
        ],
        "edges": [
            { "from": "R101", "to": "C1", "weight": 5, "bidirectional": true },
            { "from": "R102", "to": "C2", "weight": 5, "bidirectional": true },
            { "from": "R103", "to": "C2", "weight": 5, "bidirectional": true },
            { "from": "C1", "to": "C2", "weight": 5, "bidirectional": true },
            { "from": "C1", "to": "J1", "weight": 6, "bidirectional": true },
            { "from": "C2", "to": "J1", "weight": 6, "bidirectional": true },
            { "from": "J1", "to": "S1", "weight": 10, "bidirectional": true },
            { "from": "J1", "to": "L1", "weight": 8, "bidirectional": true },
            { "from": "R201", "to": "C3", "weight": 5, "bidirectional": true },
            { "from": "R202", "to": "C4", "weight": 5, "bidirectional": true },
            { "from": "R203", "to": "C4", "weight": 5, "bidirectional": true },
            { "from": "C3", "to": "C4", "weight": 5, "bidirectional": true },
            { "from": "C3", "to": "J2", "weight": 6, "bidirectional": true },
            { "from": "C4", "to": "J2", "weight": 6, "bidirectional": true },
            { "from": "J2", "to": "S2", "weight": 10, "bidirectional": true },
            { "from": "J2", "to": "L2", "weight": 8, "bidirectional": true },
            { "from": "S1", "to": "S2", "weight": 2, "bidirectional": true },
            { "from": "L1", "to": "L2", "weight": 2, "bidirectional": true }
        ]
    }
];
app.use((0, cors_1.default)(corsOptions));
async function startServer() {
    try {
        await (0, config_1.default)();
        await Graph_1.GraphModel.deleteMany({});
        await Graph_1.GraphModel.create(graph);
        await (0, mapLoder_1.loadGraphFromDB)();
        app.listen(5000, '0.0.0.0', () => {
            console.log(` Server running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}
app.get("/", (req, res) => {
    res.send("Campus Marg  api running ");
});
app.use("/api/acad", route_1.default);
startServer();
