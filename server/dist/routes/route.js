"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pathApi_1 = require("../api/pathApi");
const router = (0, express_1.Router)();
router.post("/getpath", pathApi_1.getPath);
exports.default = router;
