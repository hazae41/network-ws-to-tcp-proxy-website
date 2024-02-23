import { Outline } from "@/libs/heroicons";
import { NetworkParams } from "@/libs/network";
import { Future } from "@hazae41/future";
import { RpcCounter, RpcRequestPreinit, RpcResponse, RpcResponseInit } from "@hazae41/jsonrpc";
import { SyntheticEvent, useCallback, useEffect, useState } from "react";
import { ProxyData } from "./data";

export function Loading(props: { className: string }) {
  const { className } = props

  return <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
}

export class SocketAndCounter {

  readonly counter = new RpcCounter()

  constructor(
    readonly socket: WebSocket
  ) { }

  async requestOrThrow<T>(init: RpcRequestPreinit<unknown>) {
    const { socket, counter } = this

    const request = counter.prepare(init)

    const future = new Future<RpcResponse<T>>()
    const signal = AbortSignal.timeout(1000)

    const onMessage = (e: MessageEvent) => {
      const response = JSON.parse(e.data) as RpcResponseInit<T>

      if (response.id !== request.id)
        return

      future.resolve(RpcResponse.from(response))
    }

    const onError = (cause: Event) => {
      future.reject(new Error("Error", { cause }))
    }

    const onClose = (cause: CloseEvent) => {
      future.reject(new Error("Close", { cause }))
    }

    const onTimeout = () => {
      future.reject(new Error("Timeout"))
    }

    try {
      socket.addEventListener("message", onMessage, { passive: true })
      socket.addEventListener("error", onError, { passive: true })
      socket.addEventListener("close", onClose, { passive: true })
      signal.addEventListener("abort", onTimeout, { passive: true })

      socket.send(JSON.stringify(request))

      return await future.promise
    } finally {
      socket.removeEventListener("message", onMessage)
      socket.removeEventListener("error", onError)
      socket.removeEventListener("close", onClose)
      signal.removeEventListener("abort", onTimeout)
    }
  }

}

export namespace WebSockets {

  export async function waitOpenOrThrow(socket: WebSocket) {
    const future = new Future<unknown>()
    const signal = AbortSignal.timeout(1000)

    const onError = (cause: Event) => {
      future.reject(new Error("Error", { cause }))
    }

    const onTimeout = () => {
      future.reject(new Error("Timeout"))
    }

    try {
      socket.addEventListener("open", future.resolve, { passive: true })
      socket.addEventListener("error", onError, { passive: true })
      signal.addEventListener("abort", onTimeout, { passive: true })

      await future.promise
    } finally {
      socket.removeEventListener("open", future.resolve)
      socket.removeEventListener("error", onError)
      signal.removeEventListener("abort", onTimeout)
    }
  }

  export async function waitMessageOrThrow<T>(socket: WebSocket) {
    const future = new Future<T>()
    const signal = AbortSignal.timeout(1000)

    const onMessage = (e: MessageEvent<T>) => {
      future.resolve(e.data)
    }

    const onError = (cause: Event) => {
      future.reject(new Error("Error", { cause }))
    }

    const onClose = (cause: CloseEvent) => {
      future.reject(new Error("Close", { cause }))
    }

    const onTimeout = () => {
      future.reject(new Error("Timeout"))
    }

    try {
      socket.addEventListener("message", onMessage, { passive: true })
      socket.addEventListener("error", onError, { passive: true })
      socket.addEventListener("close", onClose, { passive: true })
      signal.addEventListener("abort", onTimeout, { passive: true })

      return await future.promise
    } finally {
      socket.removeEventListener("message", onMessage)
      socket.removeEventListener("error", onError)
      socket.removeEventListener("close", onClose)
      signal.removeEventListener("abort", onTimeout)
    }
  }

}

export async function generateOrThrow(params: NetworkParams) {
  const future = new Future<string[]>()
  const worker = new Worker("/worker.js")

  const onMessage = (e: MessageEvent<string[]>) => {
    future.resolve(e.data)
  }

  try {
    worker.addEventListener("message", onMessage, { passive: true })
    worker.postMessage(params)

    return await future.promise
  } finally {
    worker.removeEventListener("message", onMessage)
    worker.terminate()
  }
}

export function ProxyRow(props: { data: ProxyData }) {
  const { data } = props

  const [active, setActive] = useState<boolean>()

  const testOrLog = useCallback(async () => {
    try {
      const session = crypto.randomUUID()
      const hostname = "google.com"
      const port = 443

      const socket = new WebSocket(`wss://${data.data}/?session=${session}&hostname=${hostname}&port=${port}`)

      await WebSockets.waitOpenOrThrow(socket)

      try {
        const socketAndCounter = new SocketAndCounter(socket)

        const params = await socketAndCounter.requestOrThrow<NetworkParams>({
          method: "net_get"
        }).then(r => r.unwrap())

        const minimumBigInt = BigInt(params.minimumZeroHex)

        if (minimumBigInt > (2n ** 20n))
          throw new Error("Minimum too high")

        const secretZeroHexArray = await generateOrThrow(params)

        await socketAndCounter.requestOrThrow<string>({
          method: "net_tip",
          params: [secretZeroHexArray]
        }).then(r => BigInt(r.unwrap()))

        const tlsHelloBase16 = "16030100a5010000a10303000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f000020cca8cca9c02fc030c02bc02cc013c009c014c00a009c009d002f0035c012000a010000580000001800160000136578616d706c652e756c666865696d2e6e6574000500050100000000000a000a0008001d001700180019000b00020100000d0012001004010403050105030601060302010203ff0100010000120000"
        const tlsHelloBytes = new Uint8Array(Buffer.from(tlsHelloBase16, "hex"))

        socket.send(tlsHelloBytes)

        await WebSockets.waitMessageOrThrow<Uint8Array>(socket)

        setActive(true)
      } finally {
        socket.close()
      }
    } catch (e: unknown) {
      console.error(e)
      setActive(false)
    }
  }, [data])

  useEffect(() => {
    testOrLog()
  }, [testOrLog])

  const onClickOrFocus = useCallback((e: SyntheticEvent<HTMLInputElement>) => {
    e.preventDefault()
    e.currentTarget.select()
  }, [])

  const onMouseUp = useCallback((e: SyntheticEvent<HTMLInputElement>) => {
    e.preventDefault()
  }, [])

  return <div className="flex items-center">
    {active == null && <Loading className="size-4" />}
    {active === true && <Outline.CheckIcon className="text-green-500 size-5" />}
    {active === false && <Outline.XMarkIcon className="text-red-500 size-5" />}
    <div className="w-4" />
    <input className="w-full bg-transparent appearance-none"
      readOnly
      onFocus={onClickOrFocus}
      onClick={onClickOrFocus}
      onMouseUp={onMouseUp}
      value={data.data} />
  </div>
}