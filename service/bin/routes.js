"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uiRouter = void 0;
// All other GET requests will return the Astar portal
var express_1 = __importDefault(require("express"));
var path = require('path');
var router = express_1.default.Router();
exports.uiRouter = router;
var clientPath = '../../dist/spa';
// Have Node serve the files for the portal.
router.use(express_1.default.static(path.resolve(__dirname, clientPath)));
router.get('*', function (req, res) {
    console.log('get', path.resolve(__dirname, clientPath, 'index.html'));
    res.sendFile(path.resolve(__dirname, clientPath, 'index.html'));
});
