const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require ("../utils/verify")

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments
    const { deployer } = await getNamedAccounts()

    const basicNft = await deploy("BasicNft", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    console.log(basicNft.address)

    if(!developmentChains.includes(network.name)){
        await verify(basicNft.address, [])
    }

}

module.exports.tags = ["all", "BasicNft"]