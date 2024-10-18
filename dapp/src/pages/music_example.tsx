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
import { useState, useEffect, useCallback } from "react";
import React from "react";
import {
  Account,
  Aptos,
  AptosConfig,
  Network,
  AccountAddressInput,
} from "@aptos-labs/ts-sdk";
import toast, { LoaderIcon } from "react-hot-toast";
import { MusicItem } from "../components/MusicItem";
import { Block } from "../types/Block";
import { BlockItem } from "../components/BlockItem";
import { Capy } from "../types/Capy";

export default function Home() {
  const config = new AptosConfig({ network: Network.TESTNET });
  const client = new Aptos(config);

  const { account, signAndSubmitTransaction } = useWallet();

  const [isLoading, setLoading] = useState<boolean>(false);
  const [selectedBlock, setSelectedBlock] = useState<Block>();

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [capys, setCapys] = useState<Capy[]>([]);
  const [selectedCapy, setSelectedCapy] = useState<Capy>();
  const [isStackMode, setStackMode] = useState<boolean>(false);

  const [selectedId, setSelectedId] = useState<number>();

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

  const [craft, setCraft] = useState<Map<number, number>>(new Map());
  const [craftTokenIds, setCraftTokenIds] = useState<string[]>([]);

  const [craftPreview, setCraftPreview] = useState<string | null>(
    "https://question-vox.vercel.app/"
  );

  // Add this new function
  const cleanCraft = () => {
    setCraft(new Map());
    setCraftTokenIds([]);
    setCraftPreview("https://question-vox.vercel.app/");
  };

  const playwithCapy = useCallback((capy: Capy) => {
    const gameUrls = {
      yellow: "https://capy-game-yellow.vercel.app/",
      red: "https://capy-game-red.vercel.app/",
      blue: "https://capy-game-blue.vercel.app/",
      white: "https://capy-game-1.vercel.app/",
    };

    const url = gameUrls[capy.color as keyof typeof gameUrls];
    if (url) {
      window.open(url, "_blank");
    } else {
      console.error("Invalid capy color");
    }
  }, []);

  //   public entry fun generate_capy(
  //     account: &signer,
  //     name: String,
  //     description: String,
  //     elements_1: Object<Block>,
  //     elements_2: Object<Block>) acquires State{
  //      ...
  //     }
  const generateCapy = useCallback(async () => {
    console.log("craftTokenIds", craftTokenIds);
    if (craftTokenIds.length < 2) {
      toast.error("You need at least 2 blocks to generate a Music NFT.");
      return;
    }

    const [object_id_1, object_id_2] = craftTokenIds;

    await signAndSubmitTransaction(
      doGenerateMusicNFT(object_id_1, object_id_2),
      {
        gas_unit_price: 100,
      }
    )
      .then(() => {
        toast.success("Music NFT generated successfully!");
        loadMusicNFTs(); // Refresh the Music NFT list
        cleanCraft(); // Clear the craft after successful generation
      })
      .catch((error) => {
        console.error("Error generating Music NFT:", error);
        toast.error("Failed to generate Music NFT. Please try again.");
      });
  }, [craftTokenIds]);
  function doGenerateMusicNFT(object_id_1: string, object_id_2: string) {
    const { name, description } = genCapyInput;

    return {
      type: "entry_function_payload",
      function: DAPP_ADDRESS + "::music_nft_test::mint_music_nft",
      type_arguments: [],
      arguments: [name, description, object_id_1, object_id_2],
    };
  }

  const handleSelect = (block: Block) => {
    console.log("selected block", block);
    setSelectedBlock(block);
    if (selectedId != block.id) {
      setSelectedId(block.id);
    } else {
      setSelectedId(undefined);
    }
  };

  const loadBlocks = async () => {
    if (account && account.address) {
      // try {
      setLoading(true);
      setSelectedId(undefined);

      setStackMode(false);

      const collectionAddress = await getCollectionAddr();

      const tokens = await client.getAccountOwnedTokensFromCollectionAddress({
        accountAddress: account.address as AccountAddressInput,
        collectionAddress: collectionAddress as AccountAddressInput,
      });

      const blocks = tokens.map((t) => {
        const token_data = t.current_token_data;
        const properties = token_data?.token_properties;
        console.log("token_data", token_data);
        console.log("properties", properties);
        return {
          object_id: token_data?.token_data_id || "",
          name: token_data?.token_name || "",
          token_id: token_data?.token_data_id || "",
          token_uri: token_data?.token_uri || "",
          id: properties.id,
          type: properties.type,
          count: properties.count,
        };
      });
      console.log(tokens);
      setBlocks(blocks);
      // } catch {}

      setLoading(false);
    }
  };

  async function getCollectionAddr() {
    const payload = {
      function: DAPP_ADDRESS + `::block::get_collection_address`,
      type_arguments: [],
      arguments: [],
    };
    const res = await client.view({ payload: payload });
    console.log("collectionAddr", res[0]);
    return res[0];
  }

  async function getCapyCollectionAddr() {
    const payload = {
      function: DAPP_ADDRESS + `::music_nft_test::get_collection_address`,
      type_arguments: [],
      arguments: [],
    };
    const res = await client.view({ payload: payload });
    console.log("collectionAddr", res[0]);
    return res[0];
  }

  const loadMusicNFTs = async () => {
    if (account && account.address) {
      // try {
      setLoading(true);

      setStackMode(false);

      const collectionAddress = await getCapyCollectionAddr();

      const tokens = await client.getAccountOwnedTokensFromCollectionAddress({
        accountAddress: account.address.toString(),
        collectionAddress: collectionAddress,
      });

      const musicNFTs = tokens.map((t) => {
        const token_data = t.current_token_data;
        const properties = token_data?.token_properties;
        console.log("token_data", token_data);
        console.log("properties", properties);
        return {
          name: token_data?.token_name || "",
          description: token_data?.description || "",
          token_id: token_data?.token_data_id || "",
          token_uri: token_data?.token_uri || "",
          color: properties.color,
          voxel_uri: properties.voxel_uri,
          properties: properties,
        };
      });
      console.log(tokens);
      setCapys(musicNFTs);

      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlocks();
    loadMusicNFTs();
  }, [account]);

  // Add this function to determine the capy color based on the craft
  const determineCapyColor = (craft: Map<number, number>) => {
    console.log("craft", craft);
    if (craft.get(0) >= 1 && craft.get(1) >= 1) return "red";
    if (craft.get(2) >= 1 && craft.get(3) >= 1) return "blue";
    if (craft.get(4) >= 1 && craft.get(5) >= 1) return "yellow";
    if (craft.get(0) >= 2 && craft.get(5) >= 1) return "white";
    return null;
  };

  // Add this function to get the voxel URI based on the color
  const getVoxelUri = (color: string | null) => {
    switch (color) {
      case "red":
        return "Nzxwnihz6LCcwOSp2TzpgJM2uT8yCFOLSGFCOXlmfWE";
      case "blue":
        return "gP7-DtTWVHy6TleP2_12UyRrzDDj3inOgzhOk22YcNw";
      case "yellow":
        return "iFsaqek91VCvrN_wHsXNl5LP8riS0CEKtnVLNXMECag";
      case "white":
        return "yjgbg-Prmr_wjhZXpjofQCTfOUSi58lMAO0lwrp1ctM";
      default:
        return null;
    }
  };

  // Update the addToCraft function
  const addToCraft = async () => {
    if (!selectedBlock) return;

    try {
      setCraft((prevCraft) => {
        const newCraft = new Map(prevCraft);
        const currentCount = newCraft.get(selectedBlock.type) || 0;

        // Check if adding this block would exceed the limit of 2 different types
        if (newCraft.size === 2 && !newCraft.has(Number(selectedBlock.type))) {
          toast.error(
            "You can only use up to 2 different types of blocks in your craft."
          );
          return prevCraft;
        }

        newCraft.set(
          Number(selectedBlock.type),
          currentCount + Number(selectedBlock.count)
        );
        // Determine the capy color and set the preview
        const color = determineCapyColor(newCraft) || "";
        // Update craftTokenIds with the object_id of the selected block
        setCraftTokenIds((prevTokenIds) => {
          if (!prevTokenIds.includes(selectedBlock.object_id)) {
            return [...prevTokenIds, selectedBlock.object_id];
          }
          return prevTokenIds;
        });
        console.log("craftTokenIds", craftTokenIds);

        console.log("color", color);
        const uri = getVoxelUri(color);
        setCraftPreview(
          uri
            ? `https://arweave.net/${uri}`
            : "https://question-vox.vercel.app/"
        );
        return newCraft;
      });
      console.log("craft", craft);
    } catch (err) {
      console.error("Failed to add to craft: ", err);
      toast.error("Failed to add to craft.");
    }
  };

  // Add this function to render the craft
  const renderCraft = () => {
    return (
      <div>
        <button
          type="button"
          className="bg-red-500 rounded-md text-white px-4 py-2 hover:bg-red-600 mb-4"
          onClick={() => cleanCraft()}
        >
          Clean Craft
        </button>
        {Array.from(craft.entries()).map(([type, count]) => (
          <div
            key={type}
            className="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-2"
          >
            <span>Cell #{type}</span>
            <span>Count: {count}</span>
          </div>
        ))}
      </div>
    );
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
            {DAPP_ADDRESS}::music_nft_test
          </a>
        </p>

        {
          <div className="my-4">
            {/* TODO: YI with diff colors */}
            <h1 style={{ fontSize: "1.5rem" }}>
              ꇐ <b>An Example For The Decentralizd Craft!</b> ꇐ
            </h1>
            <br></br>
            <img src="https://arweave.net/EgGO7to0lFf3z-I5JlFNHO9Q6XYeh9v3XkE_3c7elcw" />
            <br></br>
            <h3>👇 Generate Your Music NFT by Craft Rules!👇</h3>
            <br></br>
            <p>
              <b>📙 The Recipe Book 📙</b>
            </p>
            <br></br>
            <p> * 1 cell #0 + 1 cell #1 = Music NFT #1</p>
            <p> * 1 cell #2 + 1 cell #3 = Music NFT #2</p>
            <p> * 1 cell #4 + 1 cell #5 = Music NFT #3</p>
            <br></br><br></br>
            Selected the cells for generate Music NFT:
            <br></br>
            {selectedId && (
              <>
                <button
                  type="button"
                  className="bg-green-500 rounded-md text-white px-4 py-2 hover:bg-green-600"
                  onClick={() => addToCraft()}
                >
                  Add to Craft
                </button>
                <br></br>
              </>
            )}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Current Craft</h3>
              <div className="w-1/2 mx-auto">
                {craft.size > 0 ? renderCraft() : <p>No items in craft yet</p>}
              </div>
            </div>
            <input
              placeholder="Name for your Music NFT"
              className="mt-8 p-4 input input-bordered input-primary w-1/2"
              onChange={(e) =>
                setGenCapyInput({ ...genCapyInput, name: e.target.value })
              }
            />
            <br></br>
            <input
              placeholder="Description for your Music NFT"
              className="mt-8 p-4 input input-bordered input-primary w-1/2"
              onChange={(e) =>
                setGenCapyInput({
                  ...genCapyInput,
                  description: e.target.value,
                })
              }
            />
            <br></br>
            <br></br>
            <div className="flex gap-4 justify-center items-center">
              {isLoading ? (
                <LoaderIcon className="!w-8 !h-8" />
              ) : (
                blocks.map((block, idx) => (
                  <BlockItem
                    key={idx}
                    block={block}
                    selectedId={selectedId}
                    isStackMode={isStackMode}
                    handleSelect={handleSelect}
                  />
                ))
              )}
            </div>
            <br></br>
            <button
              onClick={generateCapy}
              className={
                "btn btn-primary font-bold mt-4  text-white rounded p-4 shadow-lg"
              }
            >
              Generate Music NFT by Cells!
            </button>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <div className="flex gap-4 justify-center items-center">
              {isLoading ? (
                <LoaderIcon className="!w-8 !h-8" />
              ) : (
                capys.map((capy, idx) => (
                  <MusicItem
                    key={idx}
                    capy={capy}
                    selectedCapy={selectedCapy}
                    handleSelect={(capy) => setSelectedCapy(capy)}
                    handlePlay={playwithCapy}
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
                    onClick={() => playwithCapy(selectedCapy)}
                  >
                    Play by this Music NFT!
                  </button>
                </>
              )}
            </div>
            <br></br>
          </div>
        }
      </center>
    </div>
  );
}
