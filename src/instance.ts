import * as axios from 'axios'
import https from 'https'
import {logDebug} from './log'

export const API_STATUS_OK = 'OK'
export const INSTANCE_STATE_STARTED = 'Started'
export const INSTANCE_STATE_ERROR = 'Error'

export type StartVMRequest = {
  vmid: string
  tag?: string
  version?: number
  name?: string
  external_id?: string
  count?: number
  node_id?: string
  startup_script?: string
  startup_script_condition?: number
  script_monitoring?: boolean
  script_timeout?: number
  script_fail_handler?: number
  name_template?: string
  group_id?: string
  priority?: number
  usb_device?: string
  vcpu?: number
  vram?: number
  metadata?: object
  mac_address?: string
  vlan_tag?: string
  video_controller?: string
  csr_active_config?: string
  hvapic?: string
}

export interface StartVMResponse {
  status: string
  message: string
  body: string[]
}

interface Instance {
  instance_id: string
  instance_state: string
  message?: string
  anka_registry: string
  vmid: string
  tag: string
  vminfo: {
    uuid: string
    name: string
    cpu_cores: number
    ram: string
    status: string
    node_id: string
    host_ip: string
    ip: string
    tag: string
    vnc_port: number
    creation_date: string
    stop_date: string
    version: string
  }
  node_id: string
  inflight_reqid: string
  ts: string
  cr_time: string
  progress: number
  external_id: string
  arch: string
  vlan: string
  startup_script: {
    return_code: number
    did_timeout: boolean
    stdout: string
    stderr: string
  }
}

export interface TerminateVMResponse {
  status: string
  message: string
}

export interface ListVMResponse {
  status: string
  message: string
  body: Instance[]
}

export interface ListVMResponseSingle {
  status: string
  message: string
  body: Instance
}

export class VM {
  private client: axios.AxiosInstance

  constructor(
    baseURL: string,
    rootToken?: string,
    httpsAgentCa?: string,
    httpsAgentCert?: string,
    httpsAgentKey?: string,
    httpsAgentPassphrase?: string,
    httpsAgentSkipCertVerify?: boolean
  ) {
    const config: axios.CreateAxiosDefaults = {baseURL}

    if (rootToken) {
      config.auth = {
        username: '',
        password: rootToken
      }
    }

    if (
      httpsAgentCa ||
      httpsAgentCert ||
      httpsAgentKey ||
      httpsAgentPassphrase ||
      httpsAgentSkipCertVerify
    ) {
      const agentOpts: https.AgentOptions = {}

      if (httpsAgentCa) {
        agentOpts.ca = httpsAgentCa
      }

      if (httpsAgentCert) {
        agentOpts.cert = httpsAgentCert
      }

      if (httpsAgentKey) {
        agentOpts.key = httpsAgentKey
      }

      if (httpsAgentPassphrase) {
        agentOpts.passphrase = httpsAgentPassphrase
      }

      if (httpsAgentSkipCertVerify) {
        agentOpts.rejectUnauthorized = false
      }

      config.httpsAgent = new https.Agent(agentOpts)
    }

    this.client = axios.default.create(config)
  }

  async start(
    actionId: string,
    repoUrl: string,
    runnerToken: string,
    templateRunnerDir: string,
    body: StartVMRequest
  ): Promise<string> {
    const startupScriptWithEnv = `cd ${templateRunnerDir} \
  && ./config.sh --url "${repoUrl}" --token "${runnerToken}" --labels "${actionId}" --runnergroup "Default" --name "${actionId}" --work "_work" \
  && ./svc.sh install \
  && ./svc.sh start`

    logDebug(`startupScriptWithEnv: ${startupScriptWithEnv}`)

    const reqBody = JSON.stringify(body)
    logDebug(`StartVMRequest body: ${reqBody}`)

    try {
      const response = await this.client.post<StartVMResponse>(
        '/api/v1/vm',
        reqBody
      )
      logDebug(`StartVMResponse ${JSON.stringify(response.data)}`)

      if (response.data.status !== API_STATUS_OK) {
        throw new Error(`API response status:${response.data.status}`)
      }

      if (!response.data.body.length) {
        throw new Error(
          `API response body: ${JSON.stringify(response.data.body)}`
        )
      }

      return response.data.body[0]
    } catch (error) {
      throw createError(error)
    }
  }

  async getState(vmid: string): Promise<string> {
    try {
      const response = await this.client.get<ListVMResponseSingle>(
        `/api/v1/vm?id=${encodeURIComponent(vmid)}`
      )
      logDebug(
        `ListVMResponse status: ${response.status}; body: ${JSON.stringify(
          response.data
        )}`
      )

      if (response.data.status !== API_STATUS_OK) {
        throw new Error(`API response status:${response.data.status}`)
      }

      if (!response.data.body.instance_state) {
        throw new Error(
          `API response body: ${JSON.stringify(response.data.body)}`
        )
      }

      if (response.data.body.instance_state === INSTANCE_STATE_ERROR) {
        let errorMsg = `VM failed to start: ${response.data.body.message}`

        if (response.data.body.startup_script) {
          errorMsg = `${errorMsg}: ${response.data.body.startup_script.stderr}`
        }

        throw new Error(errorMsg)
      }

      return response.data.body.instance_state
    } catch (error) {
      throw createError(error)
    }
  }

  async getInstanceId(actionId: string): Promise<string | null> {
    try {
      const response = await this.client.get<ListVMResponse>(`/api/v1/vm`)
      logDebug(
        `ListVMResponse status: ${response.status}; body: ${JSON.stringify(
          response.data
        )}`
      )

      if (response.data.status !== API_STATUS_OK) {
        throw new Error(`API response status:${response.data.status}`)
      }

      const instances = response.data.body.filter(
        instance => instance.external_id === actionId
      )

      if (instances.length) {
        return instances[0].instance_id
      }

      return null
    } catch (error) {
      throw createError(error)
    }
  }

  async terminate(instanceId: string): Promise<void> {
    try {
      const response = await this.client.delete<TerminateVMResponse>(
        `/api/v1/vm`,
        {
          data: {
            id: instanceId
          }
        }
      )
      logDebug(
        `TerminateVMResponse status: ${response.status}; body: ${JSON.stringify(
          response.data
        )}`
      )

      if (response.data.status !== API_STATUS_OK) {
        throw new Error(`API response status:${response.data.status}`)
      }
    } catch (error) {
      throw createError(error)
    }
  }
}

function createError(error: any): Error {
  if (error instanceof axios.AxiosError && error.response) {
    if (error.response.status === 400) {
      throw new Error(
        `Controller responded with an error: ${JSON.stringify(
          error.response.data
        )}`
      )
    } else {
      throw new Error(
        `HTTP request failed: status: ${
          error.response.status
        }, data: ${JSON.stringify(error.response.data)}`
      )
    }
  } else if (error instanceof axios.AxiosError && error.request) {
    throw new Error(`Controller request failed: ${error.cause}`)
  }

  throw error
}
