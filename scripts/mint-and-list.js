const { ethers } = require("hardhat")

const price = ethers.utils.parseEther("0.1")

async function mintAndList() {
    // Get contracts
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const ERC721 = await ethers.getContract("BasicNft")
    
    // Mint the Nft and get the tokenId
    const mintTx = await ERC721.mintNft()
    const mintTxReceipt = await mintTx.wait(1)
    const tokenId = await mintTxReceipt.events[0].args.tokenId

    // Aprove the NFT
    const approvalTx = await ERC721.approve(nftMarketplace.address, tokenId)
    await approvalTx.wait(1)

    // List the nft
    const tx = await nftMarketplace.addNft(ERC721.address, tokenId, price)
    await tx.wait(1)

    console.log("Listed")
}

mintAndList()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e)
        process.exit(1)
    })