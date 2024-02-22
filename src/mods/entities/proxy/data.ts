import { Data, Fail, createQuery, useError, useFetch, useQuery } from "@hazae41/glacier"
import { Nullable } from "@hazae41/option"
import { Catched } from "@hazae41/result"

export interface ProxyData {
  readonly data: string
}

export type GraphResponse<T> =
  | GraphOk<T>
  | GraphErr

export interface GraphOk<T> {
  readonly data: T
}

export interface GraphErr {
  readonly error: {
    readonly message: string
  }
}

export namespace Proxy {

  export namespace All {

    export type Key = string
    export type Data = ProxyData[]
    export type Fail = Error

    export function key(offset: number) {
      return `proxies/all/${offset}`
    }

    export function schema(offset: Nullable<number>) {
      if (offset == null)
        return

      const fetcher = async () => {
        try {
          const query = `{\n  datas(first: 100, skip: ${offset}) {\n    data\n  }\n}`

          const headers = { "Content-Type": "application/json" }
          const body = JSON.stringify({ query })

          const res = await fetch("https://api.thegraph.com/subgraphs/name/hazae41/network-ws-to-tcp-proxy", { method: "POST", headers, body })

          if (!res.ok)
            throw new Error(await res.text())

          const response = await res.json() as GraphResponse<{ datas: ProxyData[] }>

          if ("error" in response)
            throw new Error(response.error.message)

          return new Data(response.data.datas.reverse())
        } catch (e: unknown) {
          return new Fail(Catched.from(e))
        }
      }

      return createQuery<Key, Data, Error>({
        key: key(offset),
        fetcher
      })
    }

  }

}

export function useAllProxies(offset: Nullable<number>) {
  const query = useQuery(Proxy.All.schema, [offset])
  useFetch(query)
  useError(query, console.error)
  return query
}