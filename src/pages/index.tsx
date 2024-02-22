import { Outline } from "@/libs/heroicons"
import { useAllProxies } from "@/mods/entities/proxy/data"
import { ProxyRow } from "@/mods/entities/proxy/row"
import { ReactNode } from "react"

export function SmallShrinkableOppositeAnchor(props: { children: ReactNode } & { "aria-disabled"?: boolean } & JSX.IntrinsicElements["a"]) {
  const { children, "aria-disabled": disabled = false, ...rest } = props

  return <a className="group po-md bg-opposite text-opposite rounded-xl outline-none aria-[disabled=false]:hover:bg-opposite-hover focus-visible:outline-opposite aria-disabled:opacity-50 transition-opacity"
    aria-disabled={disabled}
    {...rest}>
    <div className="h-full w-full flex items-center justify-center gap-2 group-aria-[disabled=false]:group-active:scale-90 transition-transform">
      {children}
    </div>
  </a >
}

export default function Home() {
  const proxies = useAllProxies(0)

  return <div className="h-full w-full overflow-y-scroll">
    <div className="h-full w-full m-auto max-w-3xl flex flex-col">
      <div className="p-4 grow flex flex-col">
        <div className="h-[min(32rem,90dvh)] shrink-0 grow flex flex-col items-center">
          <div className="grow" />
          <h1 className="text-center font-medium text-6xl">
            WebSocket to TCP
          </h1>
          <div className="h-4" />
          <div className="text-center text-contrast text-xl">
            Free and unlimited WebSocket-to-TCP proxies,
          </div>
          <div className="text-center text-contrast text-xl">
            powered by the Network protocol.
          </div>
          <div className="grow" />
          <div className="flex items-center">
            <SmallShrinkableOppositeAnchor
              href="#proxies">
              All proxies
            </SmallShrinkableOppositeAnchor>
          </div>
          <div className="grow" />
        </div>
        <div className="h-8" />
        <div className="grid place-items-stretch gap-4 grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]">
          <InfoCard title="Free"
            subtitle={`Free and unlimited for any kind of usage.`} />
          <InfoCard title="Fast"
            subtitle={`Proxies are incentivized to relay your data.`} />
          <InfoCard title="Open"
            subtitle={`Anyone can run a proxy and join the network.`} />
        </div>
        <div className="h-[25dvh]" />
        <div id="proxies" />
        <div className="h-[25dvh]" />
        <div className="p-6 min-h-[50dvh] bg-contrast rounded-xl flex flex-col">
          <h1 className="text-6xl">
            Proxies
          </h1>
          <div className="text-contrast">
            All registered public proxies
          </div>
          <div className="h-8 grow shrink-0" />
          <div className="">
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
        </div>
        <div className="h-[50dvh]" />
        <div className="text-center p-4">
          <a className="hover:underline"
            target="_blank" rel="noreferrer"
            href="https://ethbrno.cz">
            Made by cypherpunks
          </a>
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

