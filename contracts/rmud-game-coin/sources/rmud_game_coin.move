module my_addr::rmud_game_coin {
    struct RMUDGameCoin {}

    fun init_module(sender: &signer) {
        aptos_framework::managed_coin::initialize<RMUDGameCoin>(
            sender,
            b"RMUD Game Coin",
            b"RMUD",
            0,
            true,
        );
    }
}