const {deployments, ethers, getNamedAccounts, network} = require("hardhat")
const {assert, expect} = require("chai")
const {developmentChains} = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) ? describe.skip :

describe("NftMarketplace", () => {
    let deployer, nftMarketplaceContract, nftMarketplace, ERC721, user, ERC721Contract
    const tokenId = 0
    const price = ethers.utils.parseEther("0.1")

    beforeEach(async function(){
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        user = accounts[1]
        await deployments.fixture(["all"])
        nftMarketplaceContract = await ethers.getContract("NftMarketplace")
        ERC721Contract = await ethers.getContract("BasicNft")
        ERC721 = ERC721Contract.connect(deployer)
        nftMarketplace = nftMarketplaceContract.connect(deployer)
        await ERC721.mintNft()
        await ERC721.approve(nftMarketplaceContract.address, tokenId)
    })

    describe("addNft", function(){
        it("emits an event listing an item", async () => {
            expect(await nftMarketplace.addNft(ERC721.address, tokenId, price)).to.emit(
                "nftAdded"
            )
        })
        it("Reverts if the price is 0 or lower", async () => {
            const ZERO_PRICE = ethers.utils.parseEther("0")
            expect(nftMarketplace.addNft(ERC721.address, tokenId, ZERO_PRICE)).to.be.revertedWith(
                "Insufficient price"
            )
        })
        it("Needs approvals to list item", async () => {
            expect(ERC721.approve(ethers.constants.AddressZero, tokenId)).to.be.revertedWith(
                "Not approved"
            ) 
        })
        it("Updates the list mapping", async () => {
            await nftMarketplace.addNft(ERC721.address, tokenId, price)
            const listado = await nftMarketplace.getListados(ERC721.address, tokenId)
            assert(listado.price.toString() == price.toString())
            assert(listado.seller.toString() == deployer.address)
        })
        it("exclusively items that haven't been listed", async () => {
            await nftMarketplace.addNft(ERC721.address, tokenId, price)
            expect(nftMarketplace.addNft(ERC721.address, tokenId, price)).to.be.revertedWith(
                "Nft is not added"
            )
        })
        it("exclusively allows owners to list", async () => {
            const nftMarketplaceUser = nftMarketplace.connect(user)
            await ERC721.approve(user.address, tokenId)
            await expect(
                nftMarketplaceUser.addNft(ERC721.address, tokenId, price)
            ).to.be.revertedWith("Not owner")
        })
    })
})