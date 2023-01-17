import { useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi'
import { Contract } from 'ethers'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'

import abi from './abi';

export function Profile() {
  const [total, setTotal] = useState(1);

  const { address, isConnected } = useAccount()
  const { data: ensAvatar } = useEnsAvatar({ address })
  const { data: ensName } = useEnsName({ address })
  const { connect, error } = useConnect({
    connector: new MetaMaskConnector()
  })
  const { disconnect } = useDisconnect()

  const { data } = useContractRead({
    address: '0x436500248A0E7494dc12D953e7EA00B8A50B9710',
    abi,
    functionName: 'getInfo',
  });


  const { config } = usePrepareContractWrite({
    address: '0x436500248A0E7494dc12D953e7EA00B8A50B9710',
    abi,
    functionName: 'mint',
    args: [1]
  })
  const { write } = useContractWrite(config)
  console.log('write:', write);
  return (<>
    {isConnected ?
      <div>
        <img src={ensAvatar} alt="头像" />
        <div>当前用户: {ensName ? `${ensName} (${address})` : address}</div>
        <button onClick={disconnect}>断开</button>
        <br />
        <br />
        名称: {data?.deploymentConfig?.name} <br />
        作者： {data?.deploymentConfig?.owner} <br />
        价格: {data?.runtimeConfig?.publicMintPrice?.toString()} wei <br />
        数量：<input type='number' value={total} onChange={e => setTotal(e.target.value)} min={1} max={2} /> <br />
        <button onClick={() => write?.()}>购买(mint)</button>
      </div> :
      <div>
        <button
          onClick={() => connect()}
        >
          连接
        </button>

        {error && <div>{error.message}</div>}
      </div>}
  </>
  )

}