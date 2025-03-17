"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const newspaper_1 = require("../controllers/newspaper");
const router = (0, express_1.Router)();
router.get("/getNewFiles", newspaper_1.getNewNewspapers);
router.post("/add-files", newspaper_1.addNewFiles);
exports.default = router;
