import { useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
  useContractRead,
} from 'wagmi'
import { Contract, providers } from 'ethers'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'

import abi from './abi';

const contractAddress = '0x436500248A0E7494dc12D953e7EA00B8A50B9710';
const signer = new providers.Web3Provider(
  window.ethereum,
  "any"
).getSigner();
const con = new Contract(contractAddress, abi, signer);

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
    address: contractAddress,
    abi,
    functionName: 'getInfo',
  });

  const price = data?.runtimeConfig?.publicMintPrice?.toString();
  console.log(data);
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
        价格: {price} wei <br />
        每次限购：{data?.deploymentConfig?.tokensPerMint.toString()} 个 <br />
        数量：<input type='number' value={total} onChange={e => setTotal(e.target.value)} min={1} max={data?.deploymentConfig?.tokensPerMint.toString()} /> <br />
        <button onClick={async () => {
          try {
            // eslint-disable-next-line no-undef
            await con.mint(total, { from: address, value: BigInt(total * price) });
          } catch (e) {
            alert(`购买失败，详情如下：
            ${e.message}`);
          }
        }}>购买(mint)</button>
        <br />
        <br />
        {
          address === data?.deploymentConfig?.owner ? <button onClick={async () => { 
            try {
              // eslint-disable-next-line no-undef
              await con.withdrawFees();
            } catch (e) {
              alert(`提现失败，详情如下：
              ${e.message}`);
            }
          }}>您是作者可以：提现</button> : null
        }
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