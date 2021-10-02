"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var routes_1 = require("./routes");
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded());
app.use('/', routes_1.uiRouter);
var listenPort = process.env.PORT || 30000;
app.listen(listenPort, function () {
    console.log('Server is listening on port ', listenPort);
});
