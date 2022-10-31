import * as crypto from 'crypto'
import * as http from 'http'
import {StartVMRequest, VM} from '../src/instance'
import {expect, test} from '@jest/globals'
import * as fs from 'fs'

beforeEach(() => {
})

test('starts VM successfully', async () => {
  const body: StartVMRequest = {
    vmid: 'templateid',
  }

  const server = http.createServer(function (req, res) {
    const chunks: Array<Uint8Array> = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
    });
    req.on("end", () => {
      const data = Buffer.concat(chunks)
      expect(data.toString()).toEqual('{"vmid":"templateid"}')
    });

    res.setHeader('Content-Type', 'application/json');
    res.end(Buffer.from(fs.readFileSync('__tests__/fixtures/start-vm-ok.json')));
  })

  return new Promise((resolve, reject) => {
    server.listen(4444, () => {
      const vm = new VM('http://127.0.0.1:4444')
      expect(vm.start(crypto.randomUUID(), 'veertu/anka-actions-common', 'ABC123', '/Users/anka/actions-runner', body))
        .resolves
        .toBeTruthy()
        .then(result => {
          server.close()
          resolve(result)
        })
        .catch(reason => {
          server.close()
          reject(reason)
        })
    })
  })
})

test('fails to start VM', async () => {
  const body: StartVMRequest = {
    vmid: 'templateid',
  }

  const server = http.createServer(function (req, res) {
    const chunks: Array<Uint8Array> = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
    });
    req.on("end", () => {
      const data = Buffer.concat(chunks)
      expect(data.toString()).toEqual('{"vmid":"templateid"}')
    });

    res.setHeader('Content-Type', 'application/json');
    res.end(Buffer.from(fs.readFileSync('__tests__/fixtures/start-vm-error.json')));
  })

  return new Promise((resolve, reject) => {
    server.listen(4444, () => {
      const vm = new VM('http://127.0.0.1:4444')
      expect(vm.start(crypto.randomUUID(), 'veertu/anka-actions-common', 'ABC123', '/Users/anka/actions-runner', body))
        .rejects
        .toThrowError(new Error('API response status:FAIL'))
        .then(result => {
          server.close()
          resolve(result)
        })
        .catch(reason => {
          server.close()
          reject(reason)
        })
    })
  })
})

afterEach(() => {
})