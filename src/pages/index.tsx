import { Outline } from "@/libs/heroicons"
import { useAllProxies } from "@/mods/entities/proxy/data"
import { ProxyRow } from "@/mods/entities/proxy/row"

export default function Home() {
  const proxies = useAllProxies(0)

  return <div className="h-full w-full p-8 flex flex-col items-center">
    <div className="h-[35dvh]" />
    <div className="">
      <h1 className="text-6xl">
        Proxies
      </h1>
      <div className="text-contrast">
        All registered WebSocket-to-TCP proxies
      </div>
      <div className="h-8" />
      <ul>
        {proxies.data?.get()?.map((proxy, i) =>
          <li key={i}>
            <ProxyRow data={proxy} />
          </li>)}
      </ul>
      <a className="flex items-center hover:underline"
        href="https://gnosisscan.io/address/0x23Ece04aF67cC4c484f3A4b136A6F97b76A12Ebe#writeContract"
        target="_blank" rel="noreferrer">
        <Outline.PlusIcon className="size-5" />
        <div className="w-4" />
        Add your own
      </a>
    </div>
  </div>
}

