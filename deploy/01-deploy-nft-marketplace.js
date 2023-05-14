const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require ("../utils/verify")

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments
    const { deployer } = await getNamedAccounts()

    const nftMarketplace = await deploy("NftMarketplace", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    console.log(nftMarketplace.address)

    if(!developmentChains.includes(network.name)){
        await verify(nftMarketplace.address, [])
    }

}

module.exports.tags = ["all", "nftMarketplace"]