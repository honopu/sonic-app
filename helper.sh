# Canister ids
SWAP_CANISTER = r444h-piaaa-aaaah-qcl3q-cai
WICP_TEST = xe4vl-dqaaa-aaaam-qaa7a-cai 
TEST_TOKEN = a7saq-3aaaa-aaaai-qbcdq-cai
BETA_TOKEN = cfoim-fqaaa-aaaai-qbcmq-cai


# Get balance in token canister
$ dfx canister --network ic call cfoim-fqaaa-aaaai-qbcmq-cai balanceOf "(principal \"$(dfx identity get-principal)\")"
(883_000_000 : nat)

# Approve transfer
$ dfx canister --network ic call cfoim-fqaaa-aaaai-qbcmq-cai approve "(principal \"r444h-piaaa-aaaah-qcl3q-cai\", 10_000_000:nat)"
(variant { ok = 2 : nat })

# Transfer to sonic
$ dfx canister --network ic call r444h-piaaa-aaaah-qcl3q-cai deposit "(principal \"a7saq-3aaaa-aaaai-qbcdq-cai\", 10_000_000:nat)"
(variant { 24_860 = 54 : nat })

# Transfer from current identity to one Principal ID on sonic
$ dfx canister --network ic call r444h-piaaa-aaaah-qcl3q-cai transfer "(\"a7saq-3aaaa-aaaai-qbcdq-cai\", principal \"lkqmh-5vihe-t5x5j-smuot-vitei-tgfyx-losfh-bbud4-fp2rq-353dj-yqe\", 10_000_000:nat)"
(false)

# Create Pair
$ dfx canister --network ic call r444h-piaaa-aaaah-qcl3q-cai createPair "(principal \"cfoim-fqaaa-aaaai-qbcmq-cai\", principal \"a7saq-3aaaa-aaaai-qbcdq-cai\")"
(variant { 24_860 = 55 : nat })

# Add Liquidity (token0: Principal, token1: Principal, amount0Desired: Nat, amount1Desired: Nat, amount0Min: Nat, amount1Min: Nat, deadline: Int)
# deadline = (new Date().getTime() + 5 * 60 * 1000) * 10000000
$ dfx canister --network ic call r444h-piaaa-aaaah-qcl3q-cai addLiquidity "(principal \"cfoim-fqaaa-aaaai-qbcmq-cai\", principal \"a7saq-3aaaa-aaaai-qbcdq-cai\", 1_000_000_000:nat, 1_000_000_000:nat, 100_000_000:nat, 100_000_000:nat, 16395218241880000000)"
(variant { 24_860 = 56 : nat })