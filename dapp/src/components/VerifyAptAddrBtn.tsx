// import {
//     useBalance,
//     useContractLoader,
//     useContractReader,
//     // useOnBlock,
//     useUserProviderAndSigner,
//   } from "eth-hooks";
import { AptosWalletAdapter } from "@manahippo/aptos-wallet-adapter";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { useWallet } from '@manahippo/aptos-wallet-adapter';
import { DAPP_ADDRESS } from "../config/constants";
import { WalletClient } from "@martiandao/aptos-web3-bip44.js";
import { APTOS_NODE_URL, APTOS_FAUCET_URL, ETH_SIGNER_URL, APTOS_SIGNER_URL } from "../config/constants";

interface props {
    addrInfo: any,
    addrIndex: number,
    address: string,
    verified: boolean,
    get_addr_info: () => Promise<void>
}


export default function VerifyEthAddrBtn({ addrInfo, addrIndex, address, verified, get_addr_info }: props) {
    const [currentAccount, setCurrentAccount] = useState<string>();
    const { account, signAndSubmitTransaction } = useWallet();
    const [msg, setMsg] = useState<string>();
    const client = new WalletClient(APTOS_NODE_URL, APTOS_FAUCET_URL);
    const [signature, setSignature] = useState<string>("");

    useEffect(() => {
        setMsg(addrInfo[addrIndex].msg);
    }, []);

    const update_aptos_addr = async () => {
        setMsg(addrInfo[addrIndex].msg);
        console.log(signature);
        console.log(address);
        console.log("update_aptos_addr::msg" + msg);
        const payload = {
            type: 'entry_function_payload',
            function: DAPP_ADDRESS + '::addr_aggregator::update_aptos_addr',
            type_arguments: [],
            arguments: [address, signature, "APTOS\nmessage: " + msg + "\nnonce: random_string_may_change_as_nonce"],
        }
        const txn = await signAndSubmitTransaction(payload, { gas_unit_price: 100 });
        console.log(txn);
        get_addr_info();
    }

    const render_button = () => {
        if (address) { // only render if address exists
            if (verified) { // if verified already, disable button input
                return (
                    <>
                        <td>
                            <button className={
                                "btn btn-primary font-bold mt-4  text-white rounded p-4 shadow-lg"
                            } disabled={true}>
                                No Action Available
                            </button>
                        </td>
                        <td>
                            <input
                                placeholder="APT signature verified"
                                className="mt-8 p-4 input input-bordered input-primary w-full"
                            />
                        </td>
                    </>
                )
            } else { // if not verified
                if (signature !== "") { // if signature is filled, enable verification button
                    return (
                        <>
                            <td>
                                <button className={
                                    "btn btn-primary font-bold mt-4  text-white rounded p-4 shadow-lg"
                                } onClick={update_aptos_addr}>
                                    Verify APT Signature
                                </button>
                            </td>
                            <td>
                                <input
                                    placeholder="Paste generated signature here"
                                    className="mt-8 p-4 input input-bordered input-primary w-full"
                                    onChange={(e) => setSignature(e.target.value)}
                                />
                            </td>
                        </>
                    )
                } else { // if signature is not filled, enable generate signature button
                    return (
                        <>
                            <td>
                                <button className={
                                    "btn btn-primary font-bold mt-4  text-white rounded p-4 shadow-lg"
                                }>
                                    <a
                                        href={APTOS_SIGNER_URL + msg}
                                        target="_blank"
                                    >
                                        Generate APT Signature
                                    </a>
                                </button>
                            </td>
                            <td>
                                <input
                                    placeholder="Paste generated signature here"
                                    className="mt-8 p-4 input input-bordered input-primary w-full"
                                    onChange={(e) => setSignature(e.target.value)}
                                />
                            </td>
                        </>
                    )
                }
            }
        }
    }

    return (
        <>
            {render_button()}
        </>
    );
}