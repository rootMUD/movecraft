module movecraft::tools {
    // <!-- doc
    // a example to generate the tools by the basic block
    // -->

    use aptos_framework::account::{Self, SignerCapability};
    use aptos_framework::event;
    use aptos_framework::object;
    use aptos_framework::timestamp;
    use aptos_std::string_utils::{Self};
    use aptos_std::simple_map::{Self, SimpleMap};
    use aptos_token_objects::collection;
    use aptos_token_objects::token;
    use aptos_token_objects::property_map;
    use std::option;
    use std::signer::address_of;
    use std::signer;
    use std::string::{Self, String};

    use movecraft::block;
    use movecraft::block::Block;

    const STATE_SEED: vector<u8> = b"tools_signer";
    const TOOL_COLLECTION_NAME: vector<u8> = b"Tools";
    const TOOL_COLLECTION_DESCRIPTION: vector<u8> = b"Example Tools";
    const TOOL_COLLECTION_URI: vector<u8> = b"tools.svg";

    // This function is only callable during publishing
    fun init_module(admin: &signer) {
        // Create the resource account with admin account and provided SEED constant
        let (resource_account, signer_cap) = account::create_resource_account(admin, STATE_SEED);

        // TODO: RECORD STATE.

        // Create collection to the resource account
        collection::create_unlimited_collection(
            &resource_account,
            string::utf8(TOOL_COLLECTION_DESCRIPTION),
            string::utf8(TOOL_COLLECTION_NAME),
            option::none(),
            string::utf8(TOOL_COLLECTION_URI),
        );
    }
    // a example to mint_sword
    // public entry fun mint_iron_sword(owner: &signer, block_1_id: u64, block_2_id: u64) acquires Block {
    //     // block_1_id = iron * 2
    //     // block_2_id = log
    //     // mint a iron sword to collection and transfer to owner.
    // }
}