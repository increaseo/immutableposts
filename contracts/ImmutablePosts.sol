pragma solidity >= 0.4.0 < 0.7.0;
//pragma experimental ABIEncoderV2;
import "zeppelin-solidity/contracts/ownership/Ownable.sol";




contract ImmutablePosts is Ownable {
    constructor() public {
  
    }


   struct Post {
        string title;
        string description;
        string category;
    }
    
    struct Category {
        string name;
    }
    uint nbarticles = 0;

    // Beneficiary Wallet address
    address pluginbeneficiary;
    
    //Our Wallet
    address walletaddress;

    mapping (uint => address) public postToOwner;
    mapping (address => uint) ownerToPost;
    mapping (address => uint) ownerPostCount;
    
    
    event newPost (uint id, string title, string description, string category);
    event newCategory(uint id, string categoryname);

    // ARRAY METHOD
    Post[] public posts;
    Category[] public categories;

    // Fee to post a Post
    uint postFee = 0.001 ether;
    
    function createPostandPay(string memory _title, string memory _description, string memory _category) public payable {
          require(msg.value == postFee);
          uint id = posts.push(Post(_title,_description,_category)) - 1;
          postToOwner[id] = msg.sender;
          ownerToPost[msg.sender] = id;
          ownerPostCount[msg.sender]++;
          emit newPost(id, _title, _description,_category);
          nbarticles ++;
          payAndSplitFee(postFee);
          
          
    }
    //Split fee between Beneficiary and Us
    function payAndSplitFee(uint _fullfee) internal {
          uint commissionPercentage = 2;
          uint postFeeBeneficiary = _fullfee * commissionPercentage / 100;
          pluginbeneficiary.transfer(postFeeBeneficiary);
          uint postFeeUs = _fullfee - postFeeBeneficiary;
          walletaddress.transfer(postFeeUs);
    }

    
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

     function getPostbyAccount(address _owner) external view returns(uint[]) {
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
    function setUpBeneficiary(address _newbeneficiary) internal {
       pluginbeneficiary = _newbeneficiary;
    }

     function setUpOurWallerAddress(address _ourwallet) external onlyOwner {
       walletaddress = _ourwallet;
    }
     

}
