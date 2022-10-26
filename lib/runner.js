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
exports.Runner = void 0;
const rest_1 = require("@octokit/rest");
class Runner {
    constructor(auth, owner, repo) {
        this.octokit = new rest_1.Octokit({ auth });
        this.owner = owner;
        this.repo = repo;
    }
    getRunnerByActionId(actionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const runnerListResp = yield this.octokit.actions.listSelfHostedRunnersForRepo({
                owner: this.owner,
                repo: this.repo
            });
            const found = runnerListResp.data.runners.filter(runner => runner.name === actionId);
            if (found.length) {
                return found[0].id;
            }
            return null;
        });
    }
    createToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenResp = yield this.octokit.actions.createRegistrationTokenForRepo({
                owner: this.owner,
                repo: this.repo
            });
            return tokenResp.data.token;
        });
    }
    delete(runnerId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.octokit.actions.deleteSelfHostedRunnerFromRepo({
                owner: this.owner,
                repo: this.repo,
                runner_id: runnerId
            });
        });
    }
}
exports.Runner = Runner;
