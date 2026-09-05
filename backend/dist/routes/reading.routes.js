"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const readingController = __importStar(require("../controllers/reading.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const deviceAuth_middleware_1 = require("../middleware/deviceAuth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const reading_schema_1 = require("../schemas/reading.schema");
const router = (0, express_1.Router)();
router.post("/devices/:id/readings", deviceAuth_middleware_1.deviceAuthMiddleware, (0, validate_middleware_1.validate)(reading_schema_1.readingSchema), readingController.createReading);
router.get("/devices/:id/readings/latest", auth_middleware_1.authMiddleware, readingController.getLatestReading);
router.get("/devices/:id/readings", auth_middleware_1.authMiddleware, readingController.getReadingHistory);
exports.default = router;
