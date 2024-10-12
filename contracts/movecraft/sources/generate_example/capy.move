module movecraft::capy {
    use aptos_framework::account::{Self, SignerCapability};

    use std::vector;
    use std::option;
    use std::signer;
    use std::string::{Self, String};

    use aptos_framework::object::{Self, ConstructorRef, Object};

    use aptos_token_objects::collection;
    use aptos_token_objects::token;

    use aptos_token_objects::property_map;

    // use block
    use movecraft::block;
    use movecraft::block::Block;

    ///  To generate resource account
    const STATE_SEED: vector<u8> = b"capy_v4_signer";
    
    const COLLECTION_NAME: vector<u8> = b"CAPY COLLECTION";
    const COLLECTION_URI: vector<u8> = b"https://arweave.net/nA2X5vYk2i9yhfF8idqWT32xn1_erp-bsAh7Gdvpu7s";

    const BASE_URI: vector<u8> = b"https://arweave.net/";

    // diff capy
    const URI_RED: vector<u8> = b"qE3DOyvxrGqoZXSWaU0goeE0KMKSICmwQ0co4-ThkL0";
    const URI_BLUE: vector<u8> = b"ZqZMedZn_iCsg_dyC0YjTyVyMKuAxABaXywYasijg7E";
    const URI_YELLOW: vector<u8> = b"eSuAMMk4ThnhqEzSyTWx2-fqmeU6gBNdREwr7qTRiCQ";
    const URI_WHITE: vector<u8> = b"QmZY09PpzUp8N5t3bOBp7MgupFTpBD3xIWpPsbY2fG0";

    // diff voxel
    const URI_VOXEL_RED: vector<u8> = b"Nzxwnihz6LCcwOSp2TzpgJM2uT8yCFOLSGFCOXlmfWE";
    const URI_VOXEL_BLUE: vector<u8> = b"gP7-DtTWVHy6TleP2_12UyRrzDDj3inOgzhOk22YcNw";
    const URI_VOXEL_YELLOW: vector<u8> = b"iFsaqek91VCvrN_wHsXNl5LP8riS0CEKtnVLNXMECag";
    const URI_VOXEL_WHITE: vector<u8> = b"yjgbg-Prmr_wjhZXpjofQCTfOUSi58lMAO0lwrp1ctM";

    /// error code 
    const ENOT_CREATOR: u64 = 1001;
    const ENOT_FOLLOW_RULE: u64 = 2001;

    /// Global state
    struct State has key {
        // the signer cap of the module's resource account
        signer_cap: SignerCapability
    }


    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct Capy has key {
        // TODO: try equipment?
        color: String,
        voxel_uri: String,
        mutator_ref: token::MutatorRef, 
        property_mutator_ref: property_map::MutatorRef, 
    }

    fun init_module(account: &signer) {
        let (resource_account, signer_cap) = account::create_resource_account(account, STATE_SEED);
        let collection = string::utf8(COLLECTION_NAME);
        collection::create_unlimited_collection(
            &resource_account,
            string::utf8(COLLECTION_NAME),
            collection,
            option::none(),
            string::utf8(COLLECTION_URI),
        );

        move_to(account, State {
            signer_cap
        });

        // move_to(&resource_account, State {
        //     signer_cap
        // });
    }

    fun create(
        _creator: &signer,
        description: String,
        name: String,
        uri: String,
    ): ConstructorRef acquires State {

        let state = borrow_global_mut<State>(@movecraft);
        let resource_account = account::create_signer_with_capability(&state.signer_cap); 
        token::create_named_token(
            &resource_account,
            string::utf8(COLLECTION_NAME), 
            description,
            name,
            option::none(),
            uri,
        )
    }

    // Creation methods

    public fun create_capy(
        creator: &signer,
        name: String,
        description: String,
        uri: String,
        voxel_uri: String, 
        color: String
    ): Object<Capy> acquires State {

        // generate resource acct
        let state = borrow_global_mut<State>(@movecraft);
        let resource_account = account::create_signer_with_capability(&state.signer_cap);

        let constructor_ref = create(&resource_account, description, name, uri);
        let token_signer = object::generate_signer(&constructor_ref);

        // <-- create properties
        let property_mutator_ref = property_map::generate_mutator_ref(&constructor_ref); 
        let properties = property_map::prepare_input(vector[], vector[], vector[]);

        property_map::init(&constructor_ref, properties);

        property_map::add_typed<String>(
            &property_mutator_ref,
            string::utf8(b"color"),
            color,
        );

        property_map::add_typed<String>(
            &property_mutator_ref,
            string::utf8(b"voxel_uri"),
            voxel_uri,
        );
        // create properties -->

        let capy = Capy {
            color: color,
            voxel_uri: voxel_uri, 
            mutator_ref: token::generate_mutator_ref(&constructor_ref),
            property_mutator_ref,
        };
        move_to(&token_signer, capy);

        // move to creator

        let transfer_ref = object::generate_transfer_ref(&constructor_ref);
        let creator_address = signer::address_of(creator);
        object::transfer_with_ref(object::generate_linear_transfer_ref(&transfer_ref), creator_address);

        object::address_to_object(signer::address_of(&token_signer))
    }

    // Entry functions

    public entry fun generate_capy(
        account: &signer, 
        name: String, 
        description: String, 
        elements_1: Object<Block>, 
        elements_2: Object<Block>) acquires State{
        // Rules now.
        let uri = vector::empty<u8>();
        let voxel_uri = vector::empty<u8>();
        vector::append(&mut uri, BASE_URI);
         vector::append(&mut voxel_uri, BASE_URI);
        let (id_1, _name_1, type_1, count_1, _stackable_1) = block::get_block_properties_by_obj(elements_1);
        let (id_2, _name_2, type_2, count_2, _stackable_2) = block::get_block_properties_by_obj(elements_2);
        
        // one type 0 and one type 1 generate red.
        // one type 2 and one type 3 generate blue.
        // one type 4 and one type 5 generate yellow.
        // two type 0 and one type 5 generate white.
        if ((type_1 == 0 && type_2 == 1) || (type_1 == 1 && type_2 == 0)) {
            vector::append(&mut uri, URI_RED);
            vector::append(&mut voxel_uri, URI_VOXEL_RED);
            create_capy(account, name, description, string::utf8(uri), string::utf8(voxel_uri), string::utf8(b"red"));
            block::burn_block(account, id_1);
            block::burn_block(account, id_2);
        } else if ((type_1 == 2 && type_2 == 3) || (type_1 == 3 && type_2 == 2)) {
            vector::append(&mut uri, URI_BLUE);
            vector::append(&mut voxel_uri, URI_VOXEL_BLUE);
            create_capy(account, name, description, string::utf8(uri), string::utf8(voxel_uri), string::utf8(b"blue"));
            block::burn_block(account, id_1);
            block::burn_block(account, id_2);
        }else if((type_1 == 4 && type_2 == 5) || (type_1 == 5 && type_2 == 4)){
            vector::append(&mut uri, URI_YELLOW);
            vector::append(&mut voxel_uri, URI_VOXEL_YELLOW);
            create_capy(account, name, description, string::utf8(uri), string::utf8(voxel_uri),  string::utf8(b"yellow"));
            block::burn_block(account, id_1);
            block::burn_block(account, id_2);
        }else if((type_1 == 0 && type_2 == 5 && count_1 >= 2) || (type_1 == 5 && type_2 == 0 && count_2 >= 2)){
            vector::append(&mut uri, URI_WHITE);
            vector::append(&mut voxel_uri, URI_VOXEL_WHITE);
            block::burn_block(account, id_1);
            block::burn_block(account, id_2);
            create_capy(account, name, description, string::utf8(uri), string::utf8(voxel_uri), string::utf8(b"white"));
        }else{
            assert!(false, ENOT_FOLLOW_RULE);
        };
    }

    #[view]
    public fun get_collection_address(): address {
        let resource_address = get_resource_address();
        collection::create_collection_address(&resource_address, &string::utf8(COLLECTION_NAME))
    }

        #[view]
    public fun get_resource_address(): address {
        account::create_resource_address(&@movecraft, STATE_SEED)
    }

    #[view]
    public fun view_capy(creator: address, collection: String, name: String): Capy acquires Capy {
        let token_address = token::create_token_address(
            &creator,
            &collection,
            &name,
        );
        move_from<Capy>(token_address)
    }

    #[view]
    public fun view_capy_by_object(capy_obj: Object<Capy>): Capy acquires Capy {
        let token_address = object::object_address(&capy_obj);
        move_from<Capy>(token_address)
    }

    inline fun get_capy(creator: &address, collection: &String, name: &String): (Object<Capy>, &Capy) {
        let token_address = token::create_token_address(
            creator,
            collection,
            name,
        );
        (object::address_to_object<Capy>(token_address), borrow_global<Capy>(token_address))
    }
}
