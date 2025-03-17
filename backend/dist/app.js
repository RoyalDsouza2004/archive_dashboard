"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeCache = void 0;
const express_1 = __importDefault(require("express"));
const node_cache_1 = __importDefault(require("node-cache"));
const morgan_1 = __importDefault(require("morgan"));
//Importing routes
const error_js_1 = require("./middlewares/error.js");
const newspaper_js_1 = __importDefault(require("./routes/newspaper.js"));
const port = process.env.PORT || 4000;
exports.nodeCache = new node_cache_1.default();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.use("/api/v1", newspaper_js_1.default);
app.get('/', (req, res) => {
    res.send("Api working");
});
app.use("/papers", express_1.default.static("storage"));
app.use(error_js_1.errorMiddleware);
app.listen(port, () => {
    console.log(`server is working on http://localhost:${port}`);
});
