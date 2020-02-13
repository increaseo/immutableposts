pragma solidity >= 0.4.0 < 0.7.0;
//pragma experimental ABIEncoderV2;
import "@openzeppelin/contracts/ownership/Ownable.sol";

/// @title Immutable Post Contract
/// @author Seb @Increaseo on the concept idea of Troy @Increaseo
/// @notice For now, this contract create a post, category have a fee split.

contract ImmutablePosts is Ownable {
    
    // The Post
    struct Post {
        string title;
        string description;
        string category;
    }

    //Category 
    struct Category {
        string name;
    }
    uint nbarticles = 0;

    // Beneficiary Wallet address
    address payable pluginbeneficiary;
    
    //Our Wallet
    address payable walletaddress;

    //Post to Owner
    mapping (uint => address) public postToOwner;
    // Owner to Post
    mapping (address => uint) ownerToPost;
    //Post Count per Owner
    mapping (address => uint) ownerPostCount;
    
    // New Post created
    event newPost(uint id, string title, string description, string category);
    // New Category created
    event newCategory(uint id, string categoryname);

    // ARRAY METHOD for Posts and Categories
    Post[] public posts;
    Category[] public categories;

    // Fee to post a Post
    uint postFee = 0.001 ether;
    
    //Create a new post
    function createPostandPay(string memory _title, string memory _description, string memory _category) public payable {
          require(msg.value == postFee);
          uint id = posts.push(Post(_title,_description,_category)) - 1;
          postToOwner[id] = msg.sender;
          ownerToPost[msg.sender] = id;
          ownerPostCount[msg.sender]++;
          emit newPost(id, _title, _description,_category);
          nbarticles ++;
          //Pay and Split the Fee
          payAndSplitFee(postFee);
          
          
    }
    //Split fee for the post between Beneficiary and Us
    function payAndSplitFee(uint _fullfee) public payable {
          uint commissionPercentage = 2;
          uint postFeeBeneficiary = _fullfee * commissionPercentage / 100;
          pluginbeneficiary.transfer(postFeeBeneficiary);
          uint postFeeUs = _fullfee - postFeeBeneficiary;
          walletaddress.transfer(postFeeUs);
    }

    //Create new category
    function createCategory (string memory _categoryname) public {
         uint id = categories.push(Category(_categoryname)) - 1;
         emit newCategory(id, _categoryname);
    }
    

    // Experimental so removed
    // function getPosts() public view returns (Post[] memory){
    //   Post[] memory id = new Post[](nbarticles);
    //   for (uint i = 0; i < nbarticles; i++) {
    //       Post storage post = posts[i];
    //       id[i] = post;
    //   }
    //   return id;
    //  }
     
    //  function getPostbyAccount(address _myAddress) public view returns (uint) {
    //     return ownerToPost[_myAddress];
    //   }

     //Get Post per Account
     function getPostbyAccount(address _owner) external view returns(uint[] memory) {
        uint[] memory result = new uint[](ownerPostCount[_owner]);
        uint counter = 0;
        for (uint i = 0; i < posts.length; i++) {
          if (postToOwner[i] == _owner) {
            result[counter] = i;
            counter++;
          }
        }
        return result;
      }

     // For Admin of the contract to control the fee
     function setFee(uint _fee) external onlyOwner {
        postFee = _fee;
     }
     
     // Setup Beneficiary wallet adddress
    function setUpBeneficiary(address payable _newbeneficiary) internal {
       pluginbeneficiary = _newbeneficiary;
    }
     
    // Update our Wallet address Admin only 
     function setUpOurWallerAddress(address payable _ourwallet) external onlyOwner {
       walletaddress = _ourwallet;
    }
     

}
