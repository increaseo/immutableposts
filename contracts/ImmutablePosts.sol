pragma solidity >= 0.5.0 < 0.7.0;
pragma experimental ABIEncoderV2;

contract ImmutablePosts {
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
    
    //Posts
    //mapping (uint => Post) public posts;
    
    mapping (uint => address) public PostToOwner;
    mapping (address => uint) ownerToPost;
    mapping (address => uint) ownerPostCount;
    
    
    event newPost (uint id, string title, string description, string category);
    event newCategory(uint id, string categoryname);

    // ARRAY METHOD
    Post[] public posts;
    Category[] public categories;
    
    function setPost(string memory _title, string memory _description, string memory _category) public {
          uint id = posts.push(Post(_title,_description,_category)) - 1;
          PostToOwner[id] = msg.sender;
          ownerToPost[msg.sender] = id;
          ownerPostCount[msg.sender]++;
          emit newPost(id, _title, _description,_category);
          nbarticles ++;
    }
    
    function createCategory (string memory _categoryname) public {
         uint id = categories.push(Category(_categoryname)) - 1;
         emit newCategory(id, _categoryname);
    }
    
    function getPosts() public view returns (Post[] memory){
      Post[] memory id = new Post[](nbarticles);
      for (uint i = 0; i < nbarticles; i++) {
          Post storage post = posts[i];
          id[i] = post;
      }
      return id;
     }
     
     function getPostbyAccount(address _myAddress) public view returns (uint) {
        return ownerToPost[_myAddress];
      }

}
