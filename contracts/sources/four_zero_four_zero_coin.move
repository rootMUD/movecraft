module movecraft::four_zero_four_coin {
    struct FourZeroFourCoin {}

    fun init_module(sender: &signer) {
        aptos_framework::managed_coin::initialize<FourZeroFourCoin>(
            sender,
            b"404 Coin",
            b"404",
            6,
            false,
        );
    }
}
