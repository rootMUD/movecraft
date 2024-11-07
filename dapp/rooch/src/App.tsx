// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
// Author: Jason Jo

import { LoadingButton } from "@mui/lab";
import { Button, Chip, Divider, Stack, Typography, Card, CardContent, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Args, Transaction } from "@roochnetwork/rooch-sdk";
import {
  UseSignAndExecuteTransaction,
  useConnectWallet,
  useCreateSessionKey,
  useCurrentAddress,
  useCurrentSession,
  useRemoveSession,
  useRoochClientQuery,
  useWalletStore,
  useWallets,
} from "@roochnetwork/rooch-sdk-kit";
import { useState, useEffect } from "react";
import "./App.css";
import { shortAddress } from "./utils";

import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// Publish address of the counter contract
const counterAddress =
  "0xbc16486ec92097459c6ea8c6d7e9d33a3501307423ac8e1d8c572ccff27c2ca3";

function App() {
  const wallets = useWallets();
  const currentAddress = useCurrentAddress();
  const sessionKey = useCurrentSession();
  const connectionStatus = useWalletStore((state) => state.connectionStatus);
  const setWalletDisconnected = useWalletStore(
    (state) => state.setWalletDisconnected
  );
  const { mutateAsync: connectWallet } = useConnectWallet();

  const { mutateAsync: createSessionKey } = useCreateSessionKey();
  const { mutateAsync: removeSessionKey } = useRemoveSession();
  const { mutateAsync: signAndExecuteTransaction } =
    UseSignAndExecuteTransaction();
  const { data, refetch } = useRoochClientQuery("executeViewFunction", {
    target: `${counterAddress}::cellsv6::get_all_cells_with_details`,
  });

  const { data: data2 } = useRoochClientQuery("executeViewFunction", {
    target: `${counterAddress}::cellsv6::get_all_cells`,
  });

  const [cells, setCells] = useState<any[]>([]);

  useEffect(() => {
    if (data?.return_values?.[0]?.decoded_value && data2?.return_values?.[0]?.decoded_value) {
      const objectIds = data2.return_values[0].decoded_value;
      const cellDetails = data.return_values[0].decoded_value.map((cell: any, index: number) => ({
        id: objectIds[index],
        name: `${cell.value.name}${cell.value.cell_type}`,
        number: cell.value.block_num,
        index: cell.value.index,
        creator: cell.value.creator,
        type: cell.value.cell_type
      }));
      setCells(cellDetails);
    }
  }, [data, data2]);


  const [sessionLoading, setSessionLoading] = useState(false);
  const [txnLoading, setTxnLoading] = useState(false);
  const [utxoId, setUtxoId] = useState("");
  const [cell_id, setCellId] = useState("");
  const [cell_id_2, setCellId2] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const handlerCreateSessionKey = async () => {
    if (sessionLoading) {
      return;
    }
    setSessionLoading(true);

    const defaultScopes = [`${counterAddress}::*::*`];
    createSessionKey(
      {
        appName: "my_first_rooch_dapp",
        appUrl: "http://localhost:5173",
        maxInactiveInterval: 1000,
        scopes: defaultScopes,
      },
      {
        onSuccess: (result) => {
          console.log("session key", result);
        },
        onError: (why) => {
          console.log(why);
        },
      }
    ).finally(() => setSessionLoading(false));
  };

  return (
    <Stack
      className="font-sans min-w-[1024px]"
      direction="column"
      sx={{
        minHeight: "calc(100vh - 4rem)",
      }}
    >
      <Stack justifyContent="space-between" className="w-full">
        <img src="./rooch_black_combine.svg" width="120px" alt="" />
        <Stack spacing={1} justifyItems="flex-end">
          <Chip
            label="Rooch Testnet"
            variant="filled"
            className="font-semibold !bg-slate-950 !text-slate-50 min-h-10"
          />
          <Button
            variant="outlined"
            onClick={async () => {
              if (connectionStatus === "connected") {
                setWalletDisconnected();
                return;
              }
              await connectWallet({ wallet: wallets[0] });
            }}
          >
            {connectionStatus === "connected"
              ? shortAddress(currentAddress?.genRoochAddress().toStr(), 8, 6)
              : "Connect Wallet"}
          </Button>
        </Stack>
      </Stack>
      <Typography className="text-4xl font-semibold mt-6 text-left w-full mb-4">
        Movecraft | <span className="text-2xl">on Rooch</span>
      </Typography>
      <Divider className="w-full" />
      <Stack
        direction="column"
        className="mt-4 font-medium font-serif w-full text-left"
        spacing={2}
        alignItems="flex-start"
      >
        <Typography className="text-xl">
          Rooch Address:{" "}
          <span className="underline tracking-wide underline-offset-8 ml-2">
            {currentAddress?.genRoochAddress().toStr()}
          </span>
        </Typography>
        <Typography className="text-xl">
          Hex Address:
          <span className="underline tracking-wide underline-offset-8 ml-2">
            {currentAddress?.genRoochAddress().toHexAddress()}
          </span>
        </Typography>
        <Typography className="text-xl">
          Bitcoin Address:
          <span className="underline tracking-wide underline-offset-8 ml-2">
            {currentAddress?.toStr()}
          </span>
        </Typography>
      </Stack>
      <Divider className="w-full !mt-12" />
      <Stack
        className="mt-4 w-full font-medium "
        direction="column"
        alignItems="flex-start"
      >
        <Typography className="text-3xl font-bold">Session Key</Typography>
        {/* <Typography className="mt-4">
          Status: Session Key not created
        </Typography> */}
        <Stack
          className="mt-4 text-left"
          spacing={2}
          direction="column"
          alignItems="flex-start"
        >
          <Typography className="text-xl">
            Session Rooch address:{" "}
            <span className="underline tracking-wide underline-offset-8 ml-2">
              {sessionKey?.getRoochAddress().toStr()}
            </span>
          </Typography>
          <Typography className="text-xl">
            Key scheme:{" "}
            <span className="underline tracking-wide underline-offset-8 ml-2">
              {sessionKey?.getKeyScheme()}
            </span>
          </Typography>
          <Typography className="text-xl">
            Create time:{" "}
            <span className="underline tracking-wide underline-offset-8 ml-2">
              {sessionKey?.getCreateTime()}
            </span>
          </Typography>
        </Stack>
        {!sessionKey ? (
          <LoadingButton
            loading={sessionLoading}
            variant="contained"
            className="!mt-4"
            disabled={connectionStatus !== "connected"}
            onClick={() => {
              handlerCreateSessionKey();
            }}
          >
            {connectionStatus !== "connected"
              ? "Please connect wallet first"
              : "Create"}
          </LoadingButton>
        ) : (
          <Button
            variant="contained"
            className="!mt-4"
            onClick={() => {
              removeSessionKey({ authKey: sessionKey.getAuthKey() });
            }}
          >
            Clear Session
          </Button>
        )}
      </Stack>
      <Divider className="w-full !mt-12" />
      <Stack
        className="mt-4 w-full font-medium "
        direction="column"
        alignItems="flex-start"
      >
        <Typography className="text-3xl font-bold">
          Cell Generator(Staking to Earn)
          <span className="text-base font-normal ml-4">({counterAddress})</span>
        </Typography>
        
        <h4>
          <b>ALL CELLS!</b> ꂖꈠꅁꀦꄃꇐꅐꅃ
        </h4>
        <br></br>
        <div className="flex gap-4 items-center justify-center">
          {/* bold the YI language */}
          {/*const URI: vector<u8> = b"ZSuRY-jNPllbaPAWKLfGUPRv-5_QCP8Rya2sskqfqyc";
              const URI: vector<u8> = b"m2FUu-9_-qFw91eM5ft9N07QyUJzrtiT7lCBhtvU5BA";
              const URI: vector<u8> = b"3z0hO8mspZ7uihEpAVoo7xbOrYIlKYwwtQKFvd0t11s";
              const URI: vector<u8> = b"h5PywMJR0_7TfGYjBcYHTtclpd1kP26XOM1m9VFIUQc";
              const URI: vector<u8> = b"Q4GjxhumU1s621b4F1rCWJkzIEpuMiS4KrRttuL3F-c";
              const URI: vector<u8> = b"5QPqZsLb9CbpHqIojZGNXf6QkLB5FGB4_qjbFGDEn4E";
              const URI: vector<u8> = b"NwWHZeliXk7UIwjUnCCw35vKEhBd8KTbd591jInMhRw";
              const URI: vector<u8> = b"tc9aNgx5OxcFoC9IuCadqnDUHIq1i036u2qgqdW77Pw"; */}

          <img
            style={{ width: "10%" }}
            src="https://arweave.net/7xopmyHOuhNtH2UXomaCt8m3FK42EzJ8Fb8MuGtXU58"
          ></img>
          <img
            style={{ width: "10%" }}
            src="https://arweave.net/vKq1vpQ2gR05Hf9Nn50Ut-0j2BhtOwzBnUxxDNCuTXA"
          ></img>
          <img
            style={{ width: "10%" }}
            src="https://arweave.net/y8aRTqcRdvBmI6DwJ7_RgK22U2tcsD97vQ8Mz64IGn0"
          ></img>
          <img
            style={{ width: "10%" }}
            src="https://arweave.net/1WNPHI6RU0L91vDM9p6a7MY6AoGlO959iRPrle_0QAA"
          ></img>
          <img
            style={{ width: "10%" }}
            src="https://arweave.net/pPX-WLBK-CfLe_TdE-Bm7QURuUvFIEwok9tc_aGQjrM"
          ></img>
          <img
            style={{ width: "10%" }}
            src="https://arweave.net/IynWqymNQoSPeIjGjV0I1vhXp9mCiOzyB6F9Pbd1aoQ"
          ></img>
          <img
            style={{ width: "10%" }}
            src="https://arweave.net/uZAmafyXBL8KFeIWuLi6P3jSeRZke7oVnuAMRgup0_k"
          ></img>
          <img
            style={{ width: "10%" }}
            src="https://arweave.net/GokPo_tEy0AYT1RUrHm9fz0J29cQ0eEmYt4CT5kuq5I"
          ></img>
        </div>
        <br></br>
        <Stack
          className="mt-4"
          spacing={2}
          direction="column"
          alignItems="flex-start"
        >
          <Typography className="text-xl">
            My Cells:
          </Typography>
          <Stack direction="column" spacing={2}>
            {Array.from({ length: Math.ceil(cells.length / 4) }).map((_, rowIndex) => (
              <Stack key={rowIndex} direction="row" spacing={2}>
                {cells.slice(rowIndex * 4, (rowIndex + 1) * 4).map((cell, index) => (
                  <Card key={index} sx={{ minWidth: 275, margin: 1 }}>
                    <CardContent>
                      <Typography variant="h5" component="div">
                        {cell.name}
                      </Typography>
                      <Typography color="text.secondary">
                        Number: {cell.number}
                      </Typography>
                      <Typography color="text.secondary">
                        Index: {cell.index}
                      </Typography>
                      <Typography 
                        color="text.secondary" 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.7 },
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                        onClick={() => {
                          navigator.clipboard.writeText(cell.id);
                        }}
                      >
                        OBJ ID: {shortAddress(cell.id, 4, 4)} <ContentCopyIcon fontSize="small" />
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ))}
          </Stack>
          <LoadingButton
            loading={txnLoading}
            variant="contained"
            fullWidth
            disabled={!sessionKey}
            onClick={async () => {
              try {
                setTxnLoading(true);
                const txn = new Transaction();
                const randomNum = Math.floor(Math.random() * 8); // Generate random number 0-7
                txn.callFunction({
                  address: counterAddress,
                  module: "cellsv6",
                  function: "mint_entry_for_testing",
                  args: [Args.u64(BigInt(randomNum))],
                });
                await signAndExecuteTransaction({ transaction: txn });
                await refetch();
              } catch (error) {
                console.error(String(error));
              } finally {
                setTxnLoading(false);
              }
            }}
          >
            {sessionKey
              ? "Mint Block Randomly!"
              : "Please create Session Key first"}
          </LoadingButton>
          <Stack direction="column" spacing={2}>
            <TextField
              label="UTXO ID"
              variant="outlined"
              fullWidth
              value={utxoId}
              onChange={(e) => setUtxoId(e.target.value)}
              placeholder="Enter your UTXO ID"
            />
            <LoadingButton
              loading={txnLoading}
              variant="contained"
              fullWidth
              disabled={!sessionKey || !utxoId.trim()}
              onClick={async () => {
                try {
                  setTxnLoading(true);
                  const txn = new Transaction();
                  txn.callFunction({
                    address: counterAddress,
                    module: "blockv6",
                    function: "stack",
                    args: [Args.string(utxoId)],
                  });
                  await signAndExecuteTransaction({ transaction: txn });
                  await refetch();
                } catch (error) {
                  console.error(String(error));
                } finally {
                  setTxnLoading(false);
                }
              }}
            >
              {sessionKey
                ? "Staking BTC for Cells Generation..."
                : "Please create Session Key first"}
            </LoadingButton>
            <LoadingButton
              loading={txnLoading}
              variant="contained"
              fullWidth
              disabled={!sessionKey || !utxoId.trim()}
              onClick={async () => {
                try {
                  setTxnLoading(true);
                  const txn = new Transaction();
                  txn.callFunction({
                    address: counterAddress,
                    module: "blockv6",
                    function: "stack",
                    args: [Args.string(utxoId)],
                  });
                  await signAndExecuteTransaction({ transaction: txn });
                  await refetch();
                } catch (error) {
                  console.error(String(error));
                } finally {
                  setTxnLoading(false);
                }
              }}
            >
              {sessionKey
                ? "Claim my Cells!"
                : "Please create Session Key first"}
            </LoadingButton>
          </Stack>
        </Stack>
      </Stack>
      <Divider className="w-full !mt-12" />
      <Stack
        className="mt-4 w-full font-medium "
        direction="column"
        alignItems="flex-start"
      >
        <Typography className="text-3xl font-bold">
          The Craft 
          <span className="text-base font-normal ml-4">({counterAddress})</span>
        </Typography>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography>1</Typography>
          <img
            style={{ width: "10%" }}
            src="https://arweave.net/7xopmyHOuhNtH2UXomaCt8m3FK42EzJ8Fb8MuGtXU58"
          />
          <Typography>+ 1 </Typography>
          <img
            style={{ width: "10%" }}
            src="https://arweave.net/vKq1vpQ2gR05Hf9Nn50Ut-0j2BhtOwzBnUxxDNCuTXA"
          />
          <Typography> = 👻</Typography> 
        </Stack>
        <br></br>
        <Typography>Try This!</Typography>
        <br></br>
        <TextField
          label="Cell ID"
          variant="outlined"
          fullWidth
          value={cell_id}
          onChange={(e) => setCellId(e.target.value)}
          placeholder="Enter your Cell ID"
        />
        +
        <TextField
          label="Cell ID"
          variant="outlined"
          fullWidth
          value={cell_id_2}
          onChange={(e) => setCellId2(e.target.value)}
          placeholder="Enter your Cell ID"
        />
        <br></br>
        <LoadingButton
          loading={txnLoading}
          variant="contained"
          fullWidth
          disabled={!sessionKey || !cell_id.trim() || !cell_id_2.trim()}
          onClick={() => setOpenModal(true)}
        >
          Generate!
        </LoadingButton>
      </Stack>

      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Congratulations! 🎉</DialogTitle>
        <DialogContent>
          You successfully generated the 👻! You can now use it in the dungeon.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => window.open('https://dm.rootmud.xyz/#/map-editor?ifGhost=true', '_blank')}>
            Open Dungeon
          </Button>
          <Button onClick={() => setOpenModal(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default App;
