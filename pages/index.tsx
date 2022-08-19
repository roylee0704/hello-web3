import {
  useAddress,
  useContract,
  useDisconnect,
  useMetamask,
  useNFTs,
  useMintNFT,
  ThirdwebNftMedia,
  useNetworkMismatch,
  useNetwork,
  ChainId,
} from "@thirdweb-dev/react";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const disconnectWallet = useDisconnect();

  // paste your contract address on goerli
  const { contract } = useContract(
    "0x138ad768c9A3945712c2D3013bB82c3c49d8387d"
  );

  // note(roy): the hook is using react-query under the hood
  //
  // doc(roy): useNFTs: read all of the nfts from our contract
  const { data: nfts, isLoading: isLoadingNfts } = useNFTs(contract?.nft);
  const { mutate: mintNft, isLoading: isMinting } = useMintNFT(contract?.nft);

  const isWrongNetwork = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  async function mintAnNft() {
    // make sure users are connected to the wallet, if they dont
    if (!address) {
      connectWithMetamask();
      return;
    }

    // make sure the user is on the network that our contract is deployed to.
    if (isWrongNetwork) {
      switchNetwork?.(ChainId.Goerli);
      return;
    }

    mintNft(
      {
        // first param: metadata
        metadata: {
          name: "Yellow Star",

          // this is an uploaded ipfs image (with nft.storage service)
          image:
            "https://bafkreig5ixpttf3t6ubkbw3haqqh3gcr2ym2a2ukfuhx3ofy2o77nvlhr4.ipfs.nftstorage.link/",
        },

        // second param: address
        to: address,
      },
      {
        onSuccess(data) {
          console.log(data);
          alert("Successfully Minted NFT!");
        },
      }
    );
  }

  return (
    <div>
      {address ? (
        <>
          <button onClick={disconnectWallet}>Disconnect Wallet</button>
          <p>Your address: {address}</p>
          {!isLoadingNfts ? (
            // shows all the nft we loaded from the contract
            <div>
              {nfts?.map((nft) => (
                <div key={nft.metadata.id.toString()}>
                  <ThirdwebNftMedia metadata={nft.metadata}></ThirdwebNftMedia>
                  <h3>{nft.metadata.name}</h3>
                  <p>Owner: {nft.owner.slice(0, 6)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>Loading NFTs...</p>
          )}

          <button onClick={mintAnNft}>
            {isMinting ? "Minting..." : "Mint Nft"}
          </button>
        </>
      ) : (
        <button onClick={connectWithMetamask}>Connect with Metamask</button>
      )}
    </div>
  );
};

export default Home;
