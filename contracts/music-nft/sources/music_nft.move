module my_addr::music_nft_test {
    use std::string::{Self, String};
    use std::option;
    use std::signer;
    use std::vector;
    use aptos_framework::account::{Self, SignerCapability};
    use aptos_framework::object::{Self, ConstructorRef, Object};
    use aptos_token_objects::collection;
    use aptos_token_objects::token;
    use aptos_token_objects::property_map;


    // use block
    use movecraft::block;
    use movecraft::block::Block;


    // Constants
    const COLLECTION_NAME: vector<u8> = b"MUSIC NFT COLLECTION";
    const COLLECTION_URI: vector<u8> = b"https://arweave.net/EgGO7to0lFf3z-I5JlFNHO9Q6XYeh9v3XkE_3c7elcw";
    const BASE_URI: vector<u8> = b"https://arweave.net/";

    // Music URI
    const URI_AUDIO_1: vector<u8> = b"VVISFrAS-E9ljIYv1qUaSH3-KgrnvLYPA5PweZU4dE4";
    const URI_AUDIO_2: vector<u8> = b"jfW4fN0DbEAKNSMek_CbXxbmcCfC2qk5ZY_kLPgYklA";
    const URI_AUDIO_3: vector<u8> = b"QgtwEWu7_fJFnwGlAGE0wX2azHlF6_eR4DHdGoOkBWk";

    // State and error constants
    const STATE_SEED: vector<u8> = b"music_nft_v1_signer";

    const ENOT_FOLLOW_RULE: u64 = 2001;

    /// Global state
    struct State has key {
        signer_cap: SignerCapability
    }

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct MusicNFT has key {
        audio_uri: String,
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

    public fun create_music_nft(
        creator: &signer,
        name: String,
        description: String,
        audio_uri: String
    ): Object<MusicNFT> acquires State {
        let state = borrow_global_mut<State>(@movecraft);
        let resource_account = account::create_signer_with_capability(&state.signer_cap);

        let constructor_ref = create(&resource_account, description, name, audio_uri);
        let token_signer = object::generate_signer(&constructor_ref);

        let property_mutator_ref = property_map::generate_mutator_ref(&constructor_ref);
        let properties = property_map::prepare_input(vector[], vector[], vector[]);

        property_map::init(&constructor_ref, properties);

        property_map::add_typed<String>(
            &property_mutator_ref,
            string::utf8(b"audio_uri"),
            audio_uri,
        );

        let music_nft = MusicNFT {
            audio_uri,
            mutator_ref: token::generate_mutator_ref(&constructor_ref),
            property_mutator_ref,
        };
        move_to(&token_signer, music_nft);

        let transfer_ref = object::generate_transfer_ref(&constructor_ref);
        let creator_address = signer::address_of(creator);
        object::transfer_with_ref(object::generate_linear_transfer_ref(&transfer_ref), creator_address);

        object::address_to_object(signer::address_of(&token_signer))
    }

    public entry fun mint_music_nft(
        account: &signer,
        name: String,
        description: String,
        elements_1: Object<Block>,
        elements_2: Object<Block>
    ) acquires State {
        let audio_uri = string::utf8(vector::empty<u8>());
        string::append(&mut audio_uri, string::utf8(BASE_URI));

        let (id_1, _name_1, type_1, _count_1, _stackable_1) = block::get_block_properties_by_obj(elements_1);
        let (id_2, _name_2, type_2, _count_2, _stackable_2) = block::get_block_properties_by_obj(elements_2);

        if ((type_1 == 0 && type_2 == 1) || (type_1 == 1 && type_2 == 0)) {
            string::append(&mut audio_uri, string::utf8(URI_AUDIO_1));
        } else if ((type_1 == 2 && type_2 == 3) || (type_1 == 3 && type_2 == 2)) {
            string::append(&mut audio_uri, string::utf8(URI_AUDIO_2));
        } else if ((type_1 == 4 && type_2 == 5) || (type_1 == 5 && type_2 == 4)) {
            string::append(&mut audio_uri, string::utf8(URI_AUDIO_3));
        } else {
            // If no valid combination is found, abort the transaction
            abort(ENOT_FOLLOW_RULE)
        };

        create_music_nft(account, name, description, audio_uri);

        // Burn the used blocks
        block::burn_block(account, id_1);
        block::burn_block(account, id_2);
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
    public fun view_music_nft(creator: address, collection: String, name: String): MusicNFT acquires MusicNFT {
        let token_address = token::create_token_address(
            &creator,
            &collection,
            &name,
        );
        move_from<MusicNFT>(token_address)
    }

    #[view]
    public fun view_music_nft_by_object(music_nft_obj: Object<MusicNFT>): MusicNFT acquires MusicNFT {
        let token_address = object::object_address(&music_nft_obj);
        move_from<MusicNFT>(token_address)
    }
}
