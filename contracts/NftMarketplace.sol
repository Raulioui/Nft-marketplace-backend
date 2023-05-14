// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NftMarketplace is ReentrancyGuard {

    struct Listado {
        uint256 price;
        address seller;
    }

    
    mapping (address => mapping(uint256 => Listado)) private s_listados;

    // Seller address => amount earned
    mapping(address => uint256) private s_nftProviders;

    event nftAdded(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event nftBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event nftCanceled(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed seller
    );

    
    function addNft(
        address nftAddress,
        uint tokenId,
        uint price
        //address tokenPayment
    )   
        external
        notAdded(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        require(price > 0, "Insufficient price");
        require(
            IERC721(nftAddress).getApproved(tokenId) == address(this),
            "Not approved"
        );

        s_listados[nftAddress][tokenId] = Listado(price, msg.sender);

        emit nftAdded(
            msg.sender,
            nftAddress,
            tokenId,
            price
        );
    }

    function buyNft(address nftAddress, uint256 tokenId) 
        external 
        payable 
        notAdded(nftAddress, tokenId)
        // For avoid reentrance hackinkg
        nonReentrant
    {
        Listado memory targetNft = s_listados[nftAddress][tokenId];
        require(targetNft.price > 0, "Wrong price");
        //require(targetNft.price == msg.value, "Value not correct");

        // We assign the value of the selled nft to her owner
        s_nftProviders[targetNft.seller] += msg.value;

        // Delete from the mapping of NFT's
        delete(targetNft);

        // Transfer the NFT to the client
        IERC721(nftAddress).safeTransferFrom(
            targetNft.seller,
            msg.sender,
            tokenId
        );

        emit nftBought(msg.sender, nftAddress, tokenId, targetNft.price);
    }

    function cancelListado(address nftAddress, uint256 tokenId)
        external
        isOwner(nftAddress, tokenId, msg.sender)
        notAdded(nftAddress, tokenId)
    {
        delete(s_listados[nftAddress][tokenId]);
        emit nftCanceled(nftAddress, tokenId, msg.sender);
    }

    function updatePriceNft(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )
        external
        isOwner(nftAddress, tokenId, msg.sender)
        notAdded(nftAddress, tokenId) 
    {
            s_listados[nftAddress][tokenId].price = newPrice;
            emit nftAdded(msg.sender, nftAddress, tokenId, newPrice);
    }

    function withdrawProceeds() external {
        require(s_nftProviders[msg.sender] > 0 , "You don't hace proceeds");
        s_nftProviders[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: s_nftProviders[msg.sender]}("");
        require(success, "The transaction has failed!");
    }

     modifier notAdded(
        address nftAddress,
        uint256 tokenId
    ) {
       Listado memory listado = s_listados[nftAddress][tokenId];
        require(listado.price == 0, "Nft is not added");
        _;
    } 

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        require(IERC721(nftAddress).ownerOf(tokenId) == spender, "Not owner");
        _;
    }

    function getListados(address nftAddress, uint256 tokenId) external view returns(Listado memory){
        return s_listados[nftAddress][tokenId];
    }

    function getProceeds(address userAddress) external view returns(uint256){
        return s_nftProviders[userAddress];
    }
    
}
