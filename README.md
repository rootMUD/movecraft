# Aptoscraft

A Minecraft-like on-chain game written in Move language.

Motivation by: 

> https://github.com/movefuns/movecraft

💡 Attention:

> The smart contract is working under [randomnet](https://github.com/aptos-labs/aptos-core/tree/randomnet) branch now. It will publish to mainnet after the random module update to mainnet.

## Motivation

Try to simulate the block and crafting system in Minecraft through NFT, and show the combinability of Move NFT.

## How to play

### Minting

1. Select Tools: Hand(default), Axe, Hoe. Using Axe or Hoe can increase the probability of getting `Log` or `Stone`.
2. Execute Mint function, Random got a BasicBlock(Log|Stone) or Emerald NFT.

### Crafting

1. Tools: CraftingGrid(2x2) or CraftingTable(3x3). CraftingGrid is default.
2. Log --> Planks --> Stick 
3. Planks --> CraftingTable
4. Stick + Plants --> (Wooden Axe| Wooden Hoe)
5. Stick + Stone --> (Stone Axe| Stone Hoe)

### Trading

1. Emerald is the currency of the Game and only can be got by minting.
2. Players can publish Block NFT and Tool NFT in the market, and trade with Emerald.

## Roadmap

- [x] Implement Block NFT

- [ ] Implement Minting.

- [ ] Implement Crafting and Recipe.

- [ ] Implement Tools.

- [ ] Implement a simple Web interface.

- [ ] Implement the Market. 


## Community

* https://t.me/rootmud