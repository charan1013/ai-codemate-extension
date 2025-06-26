"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var express_1 = require("express");
var cors_1 = require("cors");
var dotenv_1 = require("dotenv");
var axios_1 = require("axios");
dotenv_1.default.config();
var apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
    console.error('❌ Missing OPENROUTER_API_KEY in .env file');
    process.exit(1);
}
else {
    console.log('✅ OpenRouter API key loaded successfully');
}
var app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ✅ Serve React build (for VS Code webview)
var frontendPath = path_1.default.join(__dirname, '..', 'webview-ui', 'build');
console.log('📁 Serving frontend from:', frontendPath);
app.use(express_1.default.static(frontendPath));
var askHandler = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var prompt, response, reply, err_1;
    var _a, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                prompt = req.body.prompt;
                if (!prompt || typeof prompt !== 'string') {
                    res.status(400).json({ error: '❌ Invalid prompt format' });
                    return [2 /*return*/];
                }
                _f.label = 1;
            case 1:
                _f.trys.push([1, 3, , 4]);
                return [4 /*yield*/, axios_1.default.post('https://openrouter.ai/api/v1/chat/completions', {
                        model: 'mistralai/mistral-7b-instruct',
                        messages: [{ role: 'user', content: prompt }],
                    }, {
                        headers: {
                            Authorization: "Bearer ".concat(apiKey),
                            'Content-Type': 'application/json',
                        },
                    })];
            case 2:
                response = _f.sent();
                reply = ((_c = (_b = (_a = response.data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || '⚠️ No reply received';
                res.json({ reply: reply });
                return [3 /*break*/, 4];
            case 3:
                err_1 = _f.sent();
                console.error('❌ OpenRouter error:', ((_d = err_1.response) === null || _d === void 0 ? void 0 : _d.data) || err_1.message);
                res.status(500).json({
                    error: 'OpenRouter API error',
                    detail: ((_e = err_1.response) === null || _e === void 0 ? void 0 : _e.data) || err_1.message,
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
app.post('/ask', askHandler);
// ✅ Serve index.html for any other route (React SPA fallback)
// app.get('*', (_req: Request, res: Response) => {
//   res.sendFile(path.join(frontendPath, 'index.html'));
// });
var PORT = 5004;
app.listen(PORT, function () {
    console.log("\uD83D\uDE80 Backend running on http://localhost:".concat(PORT));
});
