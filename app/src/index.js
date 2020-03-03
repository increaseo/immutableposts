import Web3 from "web3";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
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
     const { getFee } = this.meta.methods;

     //Display Fee
     const thefee = await getFee().call();
     console.log(thefee);

    //List single post if loaded from Google with#!
    var theurl = document.location + '';
    
  if(theurl == "http://immutablepost.com/") {
  
    var pagelanding = document.getElementById('page-landing');
    pagelanding.style.display = 'block';
    var pagesingle = document.getElementById('singpost-page');
    pagesingle.style.display = 'none';
  } else {
   
     var splitUrl = theurl.split('/');  
     var getlasturlbit = splitUrl[4];
     var getlasturlbit = splitUrl[4];
     var splitUrlLast = getlasturlbit.split('-');
     var postid = splitUrlLast[splitUrlLast.length-1];
     App.getpostperid(postid);

  }

     //List all posts
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
          var strcat = postdata.category;
          strcat = strcat.replace(/\s+/g, '-').toLowerCase();
          var strtitle = postdata.title;
          strtitle = strtitle.replace(/\s+/g, '-').toLowerCase();
          var url = encodeURI("http://immutablepost.com/"+strcat+"/"+strtitle+"-"+posts[i]);
          console.log(url);
          postlist.innerHTML +="<li><h4><a href='#' data-url='"+url+"' onclick='App.gotopost(event,this)' class='pushlink'>"+postdata.title+"</a><small>("+postdata.category+")</small></h4><p>"+postdata.description+"</p></li>";
     }

     allpostlist.innerHTML = "";
     for (var j=0; j <= nbposts-1; j++) {
          var postdata = await getPostbyId(j).call();
          console.log(postdata.title);
          console.log(postdata.description);
          console.log(postdata.category);
          var strcat = postdata.category;
          strcat = strcat.replace(/\s+/g, '-').toLowerCase();
          var strtitle = postdata.title;
          strtitle = strtitle.replace(/\s+/g, '-').toLowerCase();
          var url = encodeURI("http://immutablepost.com/"+strcat+"/"+strtitle+"-"+j);
          console.log(url);
          allpostlist.innerHTML +="<li><h4><a href='#' data-url='"+url+"' onclick='App.gotopost(event,this)' class='pushlink'>"+postdata.title+"</a><small>("+postdata.category+")</small></h4><p>"+postdata.description+"</p></li>";
     }
     //alert("The URL of this page is: " + window.location);
    
  
  },
  gotopost: function(e,elem) {
    e = e || window.event;
    e.preventDefault();
    var urlgoto = elem.getAttribute('data-url');
    window.history.pushState("", "Immutable Post",urlgoto);

   

  },  
  refreshBalance: async function() {
    // const { getBalance } = this.meta.methods;
    // const balance = await getBalance(this.account).call();
    const balance = await web3.eth.getBalance(this.account);
      //console.log(balance);
    const balanceElement = document.getElementsByClassName("balance")[0];
    balanceElement.innerHTML = balance;
  },

  getpostperid: async function(postid) {
    const { getPostbyId } = this.meta.methods;
    var postdata = await getPostbyId(postid).call();
    const singletitle = document.getElementById("single-title");
    const singlecat = document.getElementById("single-category");
    const singledescription = document.getElementById("single-description");
    singletitle.innerHTML=postdata.title;
    singledescription.innerHTML=postdata.description;
    singlecat.innerHTML=postdata.category;
    var pagelanding = document.getElementById('page-landing');
    pagelanding.style.display = 'none';
    var pagesingle = document.getElementById('singpost-page');
    pagesingle.style.display = 'block';

  },  

  createPostandPay: async function() {
 
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;
    const benefwallet = document.getElementById("submit-bt").getAttribute("data-sharewallet");
    const { getFee } = this.meta.methods;
    const thefee = await getFee().call();

    this.setStatus("Initiating submission... (please wait)");
    const { createPostandPay } = this.meta.methods;

    await createPostandPay(title, description, category, benefwallet).send({ from: this.account, value:web3.toWei(thefee, "wei") });

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
  setNewFee: async function() {
 
    const newfee = document.getElementById("fee").value;
   
    this.setStatus("Initiating submission... (please wait)");
    const { setFee } = this.meta.methods;
    await setFee(newfee).send({ from: this.account });
    this.setStatus("Fee Updated!");
    this.refreshPosts();
    newfee = "";

  },
  setNewPercentage: async function() {
 
    const newpercent = document.getElementById("percentage").value;
   
    this.setStatus("Initiating submission... (please wait)");
    const { setPercentage } = this.meta.methods;
    await setPercentage(newpercent).send({ from: this.account });
    this.setStatus("Percentage Updated!");
    this.refreshPosts();
    //newfee = "";

  },
  // setNewWalletAddressBenef: async function() {
 
  //   const newwalletbenefiary = document.getElementById("newwalletbenefiary").value;
   
  //   this.setStatus("Initiating submission... (please wait)");
  //   const { setUpBeneficiary } = this.meta.methods;
  //   await setUpBeneficiary(newwalletbenefiary).send({ from: this.account });
  //   this.setStatus("Wallet Updated!");
  //   this.refreshPosts();
  //   //newwalletbenefiary = "";

  // },
  setNewWalletAddress: async function() {
 
    const newwallet = document.getElementById("newwallet").value;
   
    this.setStatus("Initiating submission... (please wait)");
    const { setUpOurWallerAddress } = this.meta.methods;
    await setUpOurWallerAddress(newwallet).send({ from: this.account });
    this.setStatus("Wallet Updated!");
    this.refreshPosts();
    //newwalletbenefiary = "";

  },

  

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },
};

window.App = App;

var pushState = history.pushState;
history.pushState = function () {
    pushState.apply(history, arguments);
    //fireEvents('pushState', arguments);  // Some event-handling function
    var theurl = document.location + '';
    if(theurl == "http://immutablepost.com/") {
      var pagelanding = document.getElementById('page-landing');
      pagelanding.style.display = 'block';
      var pagesingle = document.getElementById('singpost-page');
      pagesingle.style.display = 'none';
    } else {
      var splitUrl = theurl.split('/');  
      var getlasturlbit = splitUrl[4];
      var splitUrlLast = getlasturlbit.split('-');
      var postid = splitUrlLast[splitUrlLast.length-1];
      App.getpostperid(postid);

    }
   
};

window.onpopstate = function(event) {
  //alert(`location: ${document.location}, state: ${JSON.stringify(event.state)}`)
  var theurl = document.location + '';
  if(theurl == "http://immutablepost.com/") {
    var pagelanding = document.getElementById('page-landing');
    pagelanding.style.display = 'block';
    var pagesingle = document.getElementById('singpost-page');
    pagesingle.style.display = 'none';
  } else {
     var splitUrl = theurl.split('/');  
     var getlasturlbit = splitUrl[4];
     var getlasturlbit = splitUrl[4];
     var splitUrlLast = getlasturlbit.split('-');
     var postid = splitUrlLast[splitUrlLast.length-1];
     App.getpostperid(postid);

  }
  
}



window.addEventListener("hashchange", function(event){
  alert('eeee');
});

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

