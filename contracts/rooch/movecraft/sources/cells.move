module movecraft::cellsv6 {
    use std::string::{Self, String};
    use std::vector;
    use moveos_std::display;
    use moveos_std::object::{Self, Object};
    use moveos_std::object::ObjectID;
    use moveos_std::account;
    use moveos_std::signer;
    use moveos_std::table;
    use moveos_std::table::Table;
    use moveos_std::tx_context::sender;
    use rooch_framework::simple_rng;

    friend movecraft::blocksv6;

    #[test_only]
    use std::option;

    const ErrorCreatorNotMatch: u64 = 1;
    const ErrorInvalidCellType: u64 = 2;

    struct Cell has key, store, drop {
        index: u64,
        name: String,
        block_num: u64,
        type: u64,
        /// The creator of the cell
        /// It usually is the first owner of the Object<Cell>
        creator: address,
    }

    struct Config has key, store {
        indices: vector<u64>,
        minted_addresses: Table<address,vector<ObjectID>>,
        count: u64,
        all_cells: Table<u64, ObjectID>,
    }

    struct CellDetails has copy, drop, store {
        name: String,
        creator: address,
        block_num: u64,
        cell_type: u64,
        index: u64,
    }

    fun init() {
        // let _uris = vector[
        //     b"https://arweave.net/7xopmyHOuhNtH2UXomaCt8m3FK42EzJ8Fb8MuGtXU58",
        //     b"https://arweave.net/vKq1vpQ2gR05Hf9Nn50Ut-0j2BhtOwzBnUxxDNCuTXA",
        //     b"https://arweave.net/y8aRTqcRdvBmI6DwJ7_RgK22U2tcsD97vQ8Mz64IGn0",
        //     b"https://arweave.net/1WNPHI6RU0L91vDM9p6a7MY6AoGlO959iRPrle_0QAA",
        //     b"https://arweave.net/pPX-WLBK-CfLe_TdE-Bm7QURuUvFIEwok9tc_aGQjrM",
        //     b"https://arweave.net/IynWqymNQoSPeIjGjV0I1vhXp9mCiOzyB6F9Pbd1aoQ",
        //     b"https://arweave.net/uZAmafyXBL8KFeIWuLi6P3jSeRZke7oVnuAMRgup0_k",
        //     b"https://arweave.net/GokPo_tEy0AYT1RUrHm9fz0J29cQ0eEmYt4CT5kuq5I"
        // ];

        let nft_display_object = display::display<Cell>();
        display::set_value(nft_display_object, string::utf8(b"creator"), string::utf8(b"{value.creator}"));
        display::set_value(nft_display_object, string::utf8(b"name"), string::utf8(b"Cell # {value.type}"));
        display::set_value(nft_display_object, string::utf8(b"block_num"), string::utf8(b"{value.block_num}"));
        display::set_value(nft_display_object, string::utf8(b"type"), string::utf8(b"{value.type}"));
        display::set_value(nft_display_object, string::utf8(b"index"), string::utf8(b"{value.index}"));
        display::set_value(nft_display_object, string::utf8(b"uri"), string::utf8(b"https://raw.githubusercontent.com/rootMUD/movecraft/refs/heads/main/contracts/rooch/movecraft/cells/cell_{value.type}.svg"));

        let i = 0;
        let indices = vector[];
        let minted_addresses = table::new<address, vector<ObjectID>>();
        while (i < 8) {
            vector::push_back(&mut indices, 0);
            i = i + 1;
        };

        let module_signer = signer::module_signer<Config>();
        let config = Config {
            indices,
            minted_addresses,
            all_cells: table::new<u64, ObjectID>(),
            count: 0,
        };
        account::move_resource_to(&module_signer, config)
    }

    /// Create a new Cell
    fun new(
        cell_type: u64,
        index: u64,
        block_num: u64,
        creator: address,
    ): Object<Cell> {
        assert!(cell_type < 8, ErrorInvalidCellType);
        
        let nft = Cell {
            index,
            name: string::utf8(b"cell #"),
            block_num,
            type: cell_type,
            creator,
        };
        
        let nft_obj = object::new(nft);
        nft_obj
    }

    public fun burn (
        nft_object: Object<Cell>,
    ) {
        let (
            Cell {
                index:_,
                name:_,
                block_num:_,
                type:_,
                creator:_,
            }
        ) = object::remove<Cell>(nft_object);
    }


    public(friend) fun set_block_num(nft_obj: &mut Object<Cell>, block_num: u64) {
        let nft = object::borrow_mut(nft_obj);
        nft.block_num = block_num;
    }

    // view

    public fun name(nft: &Cell): String {
        nft.name
    }

    public fun creator(nft: &Cell): address {
        nft.creator
    }

    public fun block_num(nft: &Cell): u64 {
        nft.block_num
    }

    public fun type(nft: &Cell): u64 {
        nft.type
    }

    public fun index(nft: &Cell): u64 {
        nft.index
    }

    /// View function to get all Cell properties by ObjectID
    public fun view_cell_by_id(object_id: ObjectID): (String, address, u64, u64, u64) {
        let cell = object::borrow<Cell>(object::borrow_object(object_id));
        (
            name(cell),
            creator(cell),
            block_num(cell),
            type(cell),
            index(cell)
        )
    }

    public(friend) fun mint(owner: address, cell_type: u64, block_num: u64){
        assert!(cell_type < 8, ErrorInvalidCellType);
        let global = account::borrow_mut_resource<Config>(@movecraft);
        let index = *vector::borrow(&global.indices, cell_type);
        
        let nft_obj = new(cell_type, index, block_num, owner);
        let nft_id = object::id(&nft_obj);
        object::transfer(nft_obj, owner);

        *vector::borrow_mut(&mut global.indices, cell_type) = index + 1;
        
        if (!table::contains(&global.minted_addresses, owner)) {
            table::add(&mut global.minted_addresses, owner, vector::empty<ObjectID>());
        };
        let owner_nfts = table::borrow_mut(&mut global.minted_addresses, owner);
        vector::push_back(owner_nfts, nft_id);

        table::add(&mut global.all_cells, global.count, nft_id);
        global.count = global.count + 1;
    }

    public(friend) fun mint_random(owner: address, block_num: u64){
        let cell_type = simple_rng::rand_u64_range(0,8);
        mint(owner, cell_type, block_num);
    }

    /// Mint a new Cell and transfer it to sender
    public entry fun mint_entry() {
        mint_random(sender(), 1);
    }

    public fun get_all_cells_with_details(): vector<CellDetails> {
        let global = account::borrow_resource<Config>(@movecraft);
        let result = vector::empty<CellDetails>();
        let i = 0;
        while (i < global.count) {
            if (table::contains(&global.all_cells, i)) {
                let (name, creator, block_num, cell_type, index) = view_cell_by_id(*table::borrow(&global.all_cells, i));
                vector::push_back(&mut result, CellDetails { 
                    name, 
                    creator, 
                    block_num, 
                    cell_type, 
                    index 
                });
            };
            i = i + 1;
        };
        result
    }

    public fun get_all_cells(): vector<ObjectID> {
        let global = account::borrow_resource<Config>(@movecraft);
        let result = vector::empty<ObjectID>();
        let i = 0;
        while (i < global.count) {
            if (table::contains(&global.all_cells, i)) {
                vector::push_back(&mut result, *table::borrow(&global.all_cells, i));
            };
            i = i + 1;
        };
        result
    }

    public fun remove_cell(index: u64) {
        let global = account::borrow_mut_resource<Config>(@movecraft);
        table::remove(&mut global.all_cells, index);
    }

    /// This is a testing function for minting a specific cell type
    /// TODO: remove this function before release
    public entry fun mint_entry_for_testing(cell_type: u64){
        mint(sender(), cell_type, 1);
    }

    /// This is a testing function for setting the block number of a cell
    /// TODO: remove this function before release
    public entry fun set_block_num_for_testing(nft_obj: &mut Object<Cell>, block_num: u64) {
        set_block_num(nft_obj, block_num);
    }

    #[test_only]
    public fun mint_for_testing(owner: address, cell_type: u64, block_num: u64){
        mint(owner, cell_type, block_num);
    }

    #[test(sender = @nft)]
    public fun test_create_nft (sender: address){
        moveos_std::account::create_account_for_testing(sender);

        let nft_obj = mint(
            0,
            0,
            1,
        );
        object::transfer(nft_obj, sender);
    }

}