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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VM = exports.INSTANCE_STATE_ERROR = exports.INSTANCE_STATE_STARTED = exports.API_STATUS_OK = void 0;
const axios = __importStar(require("axios"));
const https_1 = __importDefault(require("https"));
const log_1 = require("./log");
exports.API_STATUS_OK = 'OK';
exports.INSTANCE_STATE_STARTED = 'Started';
exports.INSTANCE_STATE_ERROR = 'Error';
class VM {
    constructor(baseURL, rootToken, httpsAgentCa, httpsAgentCert, httpsAgentKey, httpsAgentPassphrase, httpsAgentSkipCertVerify) {
        const config = { baseURL };
        if (rootToken) {
            config.auth = {
                username: '',
                password: rootToken
            };
        }
        if (httpsAgentCa ||
            httpsAgentCert ||
            httpsAgentKey ||
            httpsAgentPassphrase ||
            httpsAgentSkipCertVerify) {
            const agentOpts = {};
            if (httpsAgentCa) {
                agentOpts.ca = httpsAgentCa;
            }
            if (httpsAgentCert) {
                agentOpts.cert = httpsAgentCert;
            }
            if (httpsAgentKey) {
                agentOpts.key = httpsAgentKey;
            }
            if (httpsAgentPassphrase) {
                agentOpts.passphrase = httpsAgentPassphrase;
            }
            if (httpsAgentSkipCertVerify) {
                agentOpts.rejectUnauthorized = false;
            }
            config.httpsAgent = new https_1.default.Agent(agentOpts);
        }
        this.client = axios.default.create(config);
    }
    start(actionId, repoUrl, runnerToken, templateRunnerDir, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const startupScriptWithEnv = `cd ${templateRunnerDir} \
  && ./config.sh --url "${repoUrl}" --token "${runnerToken}" --labels "${actionId}" --runnergroup "Default" --name "${actionId}" --work "_work" \
  && ./svc.sh install \
  && ./svc.sh start`;
            (0, log_1.logDebug)(`startupScriptWithEnv: ${startupScriptWithEnv}`);
            const reqBody = JSON.stringify(body);
            (0, log_1.logDebug)(`StartVMRequest body: ${reqBody}`);
            try {
                const response = yield this.client.post('/api/v1/vm', reqBody);
                (0, log_1.logDebug)(`StartVMResponse ${JSON.stringify(response.data)}`);
                if (response.data.status !== exports.API_STATUS_OK) {
                    throw new Error(`API response status:${response.data.status}`);
                }
                if (!response.data.body.length) {
                    throw new Error(`API response body: ${JSON.stringify(response.data.body)}`);
                }
                return response.data.body[0];
            }
            catch (error) {
                throw createError(error);
            }
        });
    }
    getState(vmid) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get(`/api/v1/vm?id=${encodeURIComponent(vmid)}`);
                (0, log_1.logDebug)(`ListVMResponse status: ${response.status}; body: ${JSON.stringify(response.data)}`);
                if (response.data.status !== exports.API_STATUS_OK) {
                    throw new Error(`API response status:${response.data.status}`);
                }
                if (!response.data.body.instance_state) {
                    throw new Error(`API response body: ${JSON.stringify(response.data.body)}`);
                }
                if (response.data.body.instance_state === exports.INSTANCE_STATE_ERROR) {
                    let errorMsg = `VM failed to start: ${response.data.body.message}`;
                    if (response.data.body.startup_script) {
                        errorMsg = `${errorMsg}: ${response.data.body.startup_script.stderr}`;
                    }
                    throw new Error(errorMsg.trim());
                }
                return response.data.body.instance_state;
            }
            catch (error) {
                throw createError(error);
            }
        });
    }
    getInstanceId(actionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get(`/api/v1/vm`);
                (0, log_1.logDebug)(`ListVMResponse status: ${response.status}; body: ${JSON.stringify(response.data)}`);
                if (response.data.status !== exports.API_STATUS_OK) {
                    throw new Error(`API response status:${response.data.status}`);
                }
                const instances = response.data.body.filter(instance => instance.external_id === actionId);
                if (instances.length) {
                    return instances[0].instance_id;
                }
                return null;
            }
            catch (error) {
                throw createError(error);
            }
        });
    }
    terminate(instanceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.delete(`/api/v1/vm`, {
                    data: {
                        id: instanceId
                    }
                });
                (0, log_1.logDebug)(`TerminateVMResponse status: ${response.status}; body: ${JSON.stringify(response.data)}`);
                if (response.data.status !== exports.API_STATUS_OK) {
                    throw new Error(`API response status:${response.data.status}`);
                }
            }
            catch (error) {
                throw createError(error);
            }
        });
    }
}
exports.VM = VM;
function createError(error) {
    if (error instanceof axios.AxiosError && error.response) {
        if (error.response.status === 400) {
            throw new Error(`Controller responded with an error: ${JSON.stringify(error.response.data)}`);
        }
        else {
            throw new Error(`HTTP request failed: status: ${error.response.status}, data: ${JSON.stringify(error.response.data)}`);
        }
    }
    else if (error instanceof axios.AxiosError && error.request) {
        throw new Error(`Controller request failed: ${error.cause}`);
    }
    throw error;
}
