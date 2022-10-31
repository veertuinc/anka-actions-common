import * as crypto from 'crypto'
import * as http from 'http'
import * as fs from 'fs'
import {StartVMRequest, VM} from '../src/instance'
import {expect, test} from '@jest/globals'

test('starts VM successfully', async () => {
  const body: StartVMRequest = {
    vmid: 'templateid'
  }

  const server = http.createServer(function (req, res) {
    const chunks: Array<Uint8Array> = []
    req.on('data', chunk => {
      chunks.push(chunk)
    })
    req.on('end', () => {
      const data = Buffer.concat(chunks)
      expect(req.method).toEqual('POST')
      expect(req.url).toEqual(`/api/v1/vm`)
      expect(data.toString()).toEqual('{"vmid":"templateid"}')
    })

    res.setHeader('Content-Type', 'application/json')
    res.end(Buffer.from(fs.readFileSync('__tests__/fixtures/start-vm-ok.json')))
  })

  return new Promise((resolve, reject) => {
    server.listen(4444, () => {
      const vm = new VM('http://127.0.0.1:4444')
      expect(
        vm.start(
          crypto.randomUUID(),
          'veertu/anka-actions-common',
          'ABC123',
          '/Users/anka/actions-runner',
          body
        )
      )
        .resolves.toBeTruthy()
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
    vmid: 'templateid'
  }

  const server = http.createServer(function (req, res) {
    const chunks: Array<Uint8Array> = []
    req.on('data', chunk => {
      chunks.push(chunk)
    })
    req.on('end', () => {
      const data = Buffer.concat(chunks)
      expect(req.method).toEqual('POST')
      expect(req.url).toEqual(`/api/v1/vm`)
      expect(data.toString()).toEqual('{"vmid":"templateid"}')
    })

    res.setHeader('Content-Type', 'application/json')
    res.end(
      Buffer.from(fs.readFileSync('__tests__/fixtures/start-vm-error.json'))
    )
  })

  return new Promise((resolve, reject) => {
    server.listen(4444, () => {
      const vm = new VM('http://127.0.0.1:4444')
      expect(
        vm.start(
          crypto.randomUUID(),
          'veertu/anka-actions-common',
          'ABC123',
          '/Users/anka/actions-runner',
          body
        )
      )
        .rejects.toThrowError(new Error('API response status:FAIL'))
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

test('get VM state successful', async () => {
  const server = http.createServer(function (req, res) {
    const chunks: Array<Uint8Array> = []
    req.on('data', chunk => {
      chunks.push(chunk)
    })
    req.on('end', () => {
      const data = Buffer.concat(chunks)
      expect(req.method).toEqual('GET')
      expect(req.url).toEqual(`/api/v1/vm?id=vmid`)
    })

    res.setHeader('Content-Type', 'application/json')
    res.end(
      Buffer.from(
        fs.readFileSync(
          '__tests__/fixtures/list-vm-single-state-scheduling.json'
        )
      )
    )
  })

  return new Promise((resolve, reject) => {
    server.listen(4444, () => {
      const vm = new VM('http://127.0.0.1:4444')
      expect(vm.getState('vmid'))
        .resolves.toEqual('Scheduling')
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

test('get VM state error', async () => {
  const server = http.createServer(function (req, res) {
    const chunks: Array<Uint8Array> = []
    req.on('data', chunk => {
      chunks.push(chunk)
    })
    req.on('end', () => {
      const data = Buffer.concat(chunks)
      expect(req.method).toEqual('GET')
      expect(req.url).toEqual(`/api/v1/vm?id=vmid`)
    })

    res.setHeader('Content-Type', 'application/json')
    res.end(
      Buffer.from(
        fs.readFileSync(
          '__tests__/fixtures/list-vm-single-startup-script-error.json'
        )
      )
    )
  })

  return new Promise((resolve, reject) => {
    server.listen(4444, () => {
      const vm = new VM('http://127.0.0.1:4444')
      expect(vm.getState('vmid'))
        .rejects.toThrowError(
          new Error(
            `VM failed to start: startup script exit code 127: sh: line 1: asdadfasdflakdsmnflaksdnfaklsdnf!@#$: command not found`
          )
        )
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

test('get instance id', async () => {
  const server = http.createServer(function (req, res) {
    const chunks: Array<Uint8Array> = []
    req.on('data', chunk => {
      chunks.push(chunk)
    })
    req.on('end', () => {
      const data = Buffer.concat(chunks)
      expect(req.method).toEqual('GET')
      expect(req.url).toEqual(`/api/v1/vm`)
    })

    res.setHeader('Content-Type', 'application/json')
    res.end(
      Buffer.from(fs.readFileSync('__tests__/fixtures/list-vm-multiple.json'))
    )
  })

  return new Promise((resolve, reject) => {
    server.listen(4444, () => {
      const vm = new VM('http://127.0.0.1:4444')
      expect(vm.getInstanceId('0651d321-bf5a-4d8f-b926-1c2cf27744d5'))
        .resolves.toEqual('cd1937fd-68e7-4d5b-6b75-5ac3260b40f7')
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

test('terminate instance', async () => {
  const server = http.createServer(function (req, res) {
    const chunks: Array<Uint8Array> = []
    req.on('data', chunk => {
      chunks.push(chunk)
    })
    req.on('end', () => {
      const data = Buffer.concat(chunks)
      expect(req.method).toEqual('DELETE')
      expect(req.url).toEqual(`/api/v1/vm`)
      expect(JSON.parse(data.toString()).id).toEqual(
        `0651d321-bf5a-4d8f-b926-1c2cf27744d5`
      )
    })

    res.setHeader('Content-Type', 'application/json')
    res.end(
      Buffer.from(fs.readFileSync('__tests__/fixtures/terminate-vm.json'))
    )
  })

  return new Promise((resolve, reject) => {
    server.listen(4444, () => {
      const vm = new VM('http://127.0.0.1:4444')
      expect(vm.terminate('0651d321-bf5a-4d8f-b926-1c2cf27744d5'))
        .resolves.toBeUndefined()
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
