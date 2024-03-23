import {
  DAPP_ADDRESS,
  APTOS_FAUCET_URL,
  APTOS_NODE_URL,
  MODULE_URL,
  CAPY_COLLECTION_NAME,
  CAPY_STATE_SEED,
} from "../config/constants";
import { useWallet } from "@manahippo/aptos-wallet-adapter";
import { MoveResource } from "@martiandao/aptos-web3-bip44.js/dist/generated";
import { useState, useEffect } from "react";
import React from "react";
import {
  AptosAccount,
  WalletClient,
  HexString,
  Provider,
  Network,
} from "@martiandao/aptos-web3-bip44.js";
import toast, { LoaderIcon } from "react-hot-toast";
import { CapyItem } from "../components/CapyItem";
import { Capy } from "../types/Capy";

export default function Home() {
  const client = new WalletClient(APTOS_NODE_URL, APTOS_FAUCET_URL);

  const { account, signAndSubmitTransaction } = useWallet();

  const [isLoading, setLoading] = useState<boolean>(false);
  const [capys, setCapys] = useState<Capy[]>([]);
  const [selectedCapy, setSelectedCapy] = useState<Capy>();
  const [isStackMode, setStackMode] = useState<boolean>(false);

  const [genCapyInput, setGenCapyInput] = useState<{
    name: string;
    description: string;
    object_id_1: string;
    object_id_2: string;
  }>({
    name: "",
    description: "",
    object_id_1: "",
    object_id_2: "",
  });

  const playwithCapy = async () => {
    if (selectedCapy?.color === "yellow") {
      window.open("https://capy-game-yellow.vercel.app/", "_blank");
    } else if (selectedCapy?.color === "red") {
      window.open("https://capy-game-red.vercel.app/", "_blank");
    } else if (selectedCapy?.color === "blue") {
      window.open("https://capy-game-blue.vercel.app/", "_blank");
    } else if (selectedCapy?.color === "white") {
      window.open("https://capy-game-1.vercel.app/", "_blank");
    }
  };

  //   public entry fun generate_capy(
  //     account: &signer,
  //     name: String,
  //     description: String,
  //     elements_1: Object<Block>,
  //     elements_2: Object<Block>) acquires State{
  //      ...
  //     }
  async function generateCapy() {
    await signAndSubmitTransaction(doGenerateCapy(), {
      gas_unit_price: 100,
    }).then(() => {
      // updated it
      // setTimeout(get_services, 3000);
    });
  }

  function doGenerateCapy() {
    const { name, description, object_id_1, object_id_2 } = genCapyInput;
    return {
      type: "entry_function_payload",
      function: DAPP_ADDRESS + "::capy::generate_capy",
      type_arguments: [],
      arguments: [name, description, object_id_1, object_id_2],
    };
  }

  const loadBlocks = async () => {
    if (account && account.address) {
      // try {
      setLoading(true);

      setStackMode(false);
      setSelectedCapy(undefined);

      const provider = new Provider({
        fullnodeUrl: "https://fullnode.random.aptoslabs.com/v1",
        indexerUrl: "https://indexer-randomnet.hasura.app/v1/graphql",
      });
      const resourceAddress = await AptosAccount.getResourceAccountAddress(
        DAPP_ADDRESS,
        new TextEncoder().encode(CAPY_STATE_SEED)
      );
      const collectionAddress = await provider.getCollectionAddress(
        resourceAddress,
        CAPY_COLLECTION_NAME
      );

      const tokens = await provider.getTokenOwnedFromCollectionAddress(
        account.address.toString(),
        collectionAddress,
        {
          tokenStandard: "v2",
        }
      );

      const capys = tokens.current_token_ownerships_v2.map((t) => {
        const token_data = t.current_token_data;
        const properties = token_data?.token_properties;
        console.log("token_data", token_data);
        console.log("properties", properties);
        return {
          name: token_data?.token_name || "",
          token_id: token_data?.token_data_id || "",
          token_uri: token_data?.token_uri || "",
          color: properties.color,
          voxel_uri: properties.voxel_uri,
        };
      });
      console.log(tokens);
      setCapys(capys);
      // } catch {}

      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlocks();
  }, [account]);

  const handleSelect = (capy: Capy) => {
    console.log(capy);
    setSelectedCapy(capy);
  };

  return (
    <div>
      {/* TODO:
     [x] Mint Block with smart contract 
     2/ Stack the block
     3/ Gallery to show the blocks
    */}
      <center>
        <p>
          <b>Module Path: </b>
          <a target="_blank" href={MODULE_URL} className="underline">
            {DAPP_ADDRESS}::capy
          </a>
        </p>

        {
          <div className="my-4">
            {/* TODO: YI with diff colors */}
            <h1 style={{ fontSize: "1.5rem" }}>
              ꇐ <b>An Example For The Decentralizd Craft!</b> ꇐ
            </h1>
            <br></br>
            <iframe
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-scripts allow-popups-to-escape-sandbox"
              src="https://arweave.net/Nzxwnihz6LCcwOSp2TzpgJM2uT8yCFOLSGFCOXlmfWE"
            />
            <h3>👇 Generate Your Capy by Craft Rules!👇</h3>
            <br></br>
            <p>
              <b>The Recipe Book</b>
            </p>
            <p> * one cell 0 and one cell 1 generate red capy.</p>
            <p> * one cell 2 and one cell 3 generate blue capy.</p>
            <p> * one cell 4 and one cell 5 generate yellow capy.</p>
            <p> * two cell 0 and one cell 5 generate white capy.</p>

            <br></br>
            <input
              placeholder="Name for your Capy"
              className="mt-8 p-4 input input-bordered input-primary w-1/2"
              onChange={(e) =>
                setGenCapyInput({ ...genCapyInput, name: e.target.value })
              }
            />
            <br></br>
            <input
              placeholder="Description for your Capy"
              className="mt-8 p-4 input input-bordered input-primary w-1/2"
              onChange={(e) =>
                setGenCapyInput({
                  ...genCapyInput,
                  description: e.target.value,
                })
              }
            />
            <br></br>
            <input
              placeholder="Object ID for your Cells 1"
              className="mt-8 p-4 input input-bordered input-primary w-1/2"
              onChange={(e) =>
                setGenCapyInput({
                  ...genCapyInput,
                  object_id_1: e.target.value,
                })
              }
            />
            <br></br>
            <input
              placeholder="Object ID for your Cells 2"
              className="mt-8 p-4 input input-bordered input-primary w-1/2"
              onChange={(e) =>
                setGenCapyInput({
                  ...genCapyInput,
                  object_id_2: e.target.value,
                })
              }
            />
            <br></br>

            <button
              onClick={generateCapy}
              className={
                "btn btn-primary font-bold mt-4  text-white rounded p-4 shadow-lg"
              }
            >
              generate Capy by Cells!
            </button>
            <br></br>
            <br></br>

            <br></br>
            <br></br>
            <div className="flex gap-4">
              {isLoading ? (
                <LoaderIcon className="!w-8 !h-8" />
              ) : (
                capys.map((capy, idx) => (
                  <CapyItem
                    key={idx}
                    capy={capy}
                    selectedCapy={selectedCapy}
                    handleSelect={handleSelect}
                  />
                ))
              )}
            </div>

            <div className="flex gap-4 items-center justify-center">
              {selectedCapy && (
                <>
                  {/* <button
                    type="button"
                    className="bg-red-500 rounded-md text-white px-4 py-2 hover:bg-red-600"
                    onClick={handleBurnBlock}
                  >
                    Burn Block
                  </button> */}
                  <button
                    type="button"
                    className="bg-green-500 rounded-md text-white px-4 py-2 hover:bg-green-600"
                    onClick={() => playwithCapy()}
                  >
                    Play by this Capy!
                  </button>
                </>
              )}
            </div>
          </div>
        }
      </center>
    </div>
  );
}
