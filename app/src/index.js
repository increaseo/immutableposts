import Web3 from "web3";
import immutablePostsArtifact from "../../build/contracts/ImmutablePosts.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      console.log(networkId);
      const deployedNetwork = immutablePostsArtifact.networks[networkId];
      
      this.meta = new web3.eth.Contract(
        immutablePostsArtifact.abi,
        deployedNetwork.address,
      );
        
      // get accounts
      const accounts = await web3.eth.getAccounts();
      console.log(accounts);
      this.account = accounts[0];
      const balance = await web3.eth.getBalance(this.account);
      const baleth = web3.utils.fromWei(balance,'ether');
      const balanceElement = document.getElementsByClassName("balance")[0];
       balanceElement.innerHTML = baleth;
       this.refreshPosts();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },
 
  refreshPosts: async function() {
     const { getPostbyAccount } = this.meta.methods;
     const { getPostbyId } = this.meta.methods;
     const { getNbArticles } = this.meta.methods;
    
     const postlist = document.getElementById("postlist");
     const allpostlist = document.getElementById("allpostlist");
     const posts = await getPostbyAccount(this.account).call();
     const nbposts = await getNbArticles().call();
     console.log(nbposts);
     postlist.innerHTML = "";
     for (var i=0; i <= posts.length-1; i++) {
          var postdata = await getPostbyId(posts[i]).call();
          console.log(postdata.title);
          console.log(postdata.description);
          console.log(postdata.category);
          postlist.innerHTML +="<li><h2>"+postdata.title+"<small>("+postdata.category+")</small></h2><p>"+postdata.description+"</p></li>";
     }

     allpostlist.innerHTML = "";
     for (var j=0; j <= nbposts-1; j++) {
          var postdata = await getPostbyId(j).call();
          console.log(postdata.title);
          console.log(postdata.description);
          console.log(postdata.category);
          allpostlist.innerHTML +="<li><h2>"+postdata.title+"<small>("+postdata.category+")</small></h2><p>"+postdata.description+"</p></li>";
     }

  
  },

  refreshBalance: async function() {
    // const { getBalance } = this.meta.methods;
    // const balance = await getBalance(this.account).call();
    const balance = await web3.eth.getBalance(this.account);
      //console.log(balance);
    const balanceElement = document.getElementsByClassName("balance")[0];
    balanceElement.innerHTML = balance;
  },

  createPostandPay: async function() {
 
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;

    this.setStatus("Initiating submission... (please wait)");
    const { createPostandPay } = this.meta.methods;
    await createPostandPay(title, description, category).send({ from: this.account, value:web3.toWei(1, "ether") });

    // web3.eth.sendTransaction({
    //   to:'0xa27F275bA433f981a6Ed1D94A3597Fb82952c6C6', 
    //   from:'0x36c1A317314678f57871A94E5cAE28cF89d53432', 
    //   value:web3.toWei("0.5", "ether")
    // }, console.log)

    this.setStatus("Upload completed!");
    this.refreshPosts();
    title = "";
    description ="";
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },
};

window.App = App;

window.addEventListener("load", function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
    );
  }

  App.start();
});
