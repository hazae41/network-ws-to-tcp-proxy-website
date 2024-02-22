import { Outline } from "@/libs/heroicons"
import { useAllProxies } from "@/mods/entities/proxy/data"
import { ProxyRow } from "@/mods/entities/proxy/row"

export default function Home() {
  const proxies = useAllProxies(0)

  return <div className="h-full w-full overflow-y-scroll">
    <div className="h-full w-full m-auto max-w-4xl flex flex-col">
      <div className="p-8 grow flex flex-col">
        <div className="h-[min(32rem,90dvh)] shrink-0 grow flex flex-col items-center">
          <div className="grow" />
          <h1 className="text-center font-medium text-6xl">
            WebSocket to TCP
          </h1>
          <div className="h-4" />
          <div className="text-center text-contrast text-xl">
            Free and unlimited WebSocket-to-TCP proxies for everyone.
          </div>
          <div className="grow" />
          <div>
            {proxies.data?.get()?.map((proxy, i) =>
              <div key={i}>
                <ProxyRow data={proxy} />
              </div>)}
            <a className="flex items-center hover:underline"
              href="https://gnosisscan.io/address/0x23Ece04aF67cC4c484f3A4b136A6F97b76A12Ebe#writeContract"
              target="_blank" rel="noreferrer">
              <Outline.PlusIcon className="size-5" />
              <div className="w-4" />
              Add your own
            </a>
          </div>
          <div className="grow" />
        </div>
        <div className="h-8" />
        <div className="grid place-items-stretch gap-4 grid-cols-[repeat(auto-fill,minmax(16rem,1fr))]">
          <InfoCard title="Free"
            subtitle={`Free and unlimited for any kind of usage.`} />
          <InfoCard title="Fast"
            subtitle={`Nodes are incentivized to relay your data.`} />
          <InfoCard title="Open"
            subtitle={`Anyone can use and run nodes.`} />
        </div>
      </div>
    </div>
  </div>
}

export function InfoCard(props: { title: string, subtitle: string }) {
  const { title, subtitle } = props

  return <div className="p-6 aspect-square bg-contrast rounded-xl flex flex-col">
    <div className="text-6xl">
      {title}
    </div>
    <div className="h-4 grow" />
    <div className="">
      <span className="text-contrast text-justify">
        {subtitle}
      </span>
    </div>
  </div>
}

