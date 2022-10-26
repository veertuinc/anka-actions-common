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
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeout = exports.sleep = exports.HardTimeoutError = void 0;
class HardTimeoutError extends Error {
}
exports.HardTimeoutError = HardTimeoutError;
const sleep = (waitTimeInMs) => __awaiter(void 0, void 0, void 0, function* () { return new Promise(resolve => setTimeout(resolve, waitTimeInMs)); });
exports.sleep = sleep;
const timeout = (ms, message) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((_, reject) => {
        const id = setTimeout(() => {
            reject(new HardTimeoutError(message));
        }, ms);
        // let timer to not block Nodejs process to exit naturally
        id.unref();
    });
});
exports.timeout = timeout;
