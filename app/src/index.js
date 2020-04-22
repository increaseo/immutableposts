import Web3 from "web3";
import 'jquery';
import 'buffer';
import immutablePostsArtifact from "../../build/contracts/ImmutablePosts.json";

const IPFS = require('ipfs-api');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
var $ = require('jquery');

// IPFS Upload
$("#featimg").on("change", function () {
  const file = this.files[0];
  const reader = new window.FileReader();
  reader.readAsArrayBuffer(file);

  reader.onload = function (e) {
    const bufferimg = Buffer(reader.result); // honestly as a web developer I do not fully appreciate the difference between buffer and arrayBuffer 
    ipfs.add(bufferimg, (err, result) => {
      console.log(err, result);

      let ipfsLink = result[0].hash;
      console.log(ipfsLink);
      $('#ipfshash').attr('data-ipfs', ipfsLink);

    })
  }
})


$('#btnext').on('click', function () {
  $('#sectionformstart').hide();
  $('#sectionformend').show();
  window.scrollTo({ top: 0, behavior: 'smooth' });
})
$('#btprev').on('click', function () {
  $('#sectionformstart').show();
  $('#sectionformend').hide();
  window.scrollTo({ top: 0, behavior: 'smooth' });
})



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
      
    } catch (error) {
      console.error("Could not connect to contract or chain.");
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
    const benefwallet = document.getElementById("submit-bt").getAttribute("data-sharewallet");
    const { getFee } = this.meta.methods;
    const thefee = await getFee().call();

    const imageipfs = document.getElementById("ipfshash").getAttribute("data-ipfs");
    const authorname = document.getElementById("authorname").value;
    const bio = document.getElementById("authorbio").value;
    const link = document.getElementById("authorlink").value;
    const compname = document.getElementById("compname").value;
    const compcountry = document.getElementById("compcountry").value;
    const compaddress = document.getElementById("compaddress").value;
    const compcontactname = document.getElementById("compcontactname").value;
    const compphone = document.getElementById("compphone").value;
    const compemail = document.getElementById("compemail").value;

    console.log(imageipfs);

    if (title == "" || description == "" || category == "" || authorname == "" || bio == "" || compname == "" || compcountry == "" || compaddress == "" || compcontactname == "" || compphone == "" || compemail == "") {
      if (title == "") {
        $('#title').next('.errorfield').html('Please complete this field');
        $('#sectionformstart').show();
        $('#sectionformend').hide();
        return false;
      } else if (description == "") {
        $('#description').next('.errorfield').html('Please complete this field');
        $('#sectionformstart').show();
        $('#sectionformend').hide();
        return false;
      } else if (category == "") {
        $('#category').next('.errorfield').html('Please complete this field');
        return false;
      } else if (authorname == "") {
        $('#authorname').next('.errorfield').html('Please complete this field');
        return false;
      } else if (bio == "") {
        $('#authorbio').next('.errorfield').html('Please complete this field');
        return false;
      } else if (compname == "") {
        $('#compname').next('.errorfield').html('Please complete this field');
        return false;
      } else if (compcountry == "") {
        $('#compcountry').next('.errorfield').html('Please complete this field');
        return false;
      } else if (compaddress == "") {
        $('#compaddress').next('.errorfield').html('Please complete this field');
        return false;
      } else if (compcontactname == "") {
        $('#compcontactname').next('.errorfield').html('Please complete this field');
        return false;
      } else if (compphone == "") {
        $('#compphone').next('.errorfield').html('Please complete this field');
        return false;
      } else if (compemail == "") {
        $('#compemail').next('.errorfield').html('Please complete this field');
        return false;
      }

    } else {

      this.setStatus("Initiating submission... (please wait)");


      //getting author information and adding author to the post
      const { createAuthor } = this.meta.methods;
      await createAuthor(authorname, bio, link).send({ from: this.account });

      //Posting Article
      if (imageipfs == "") {
        const { createPostandPay } = this.meta.methods;
        await createPostandPay(title, description, category, benefwallet, '').send({ from: this.account, value: web3.toWei(thefee, "wei") });
      } else {
        const { createPostandPay } = this.meta.methods;
        await createPostandPay(title, description, category, benefwallet, imageipfs).send({ from: this.account, value: web3.toWei(thefee, "wei") });

      }
      
      // Email Tax Invoice
      const { getNbArticles } = this.meta.methods;
      var nbposts = await getNbArticles().call();
      var j = nbposts;

      var tempDate = new Date();
      var invoicenumberdate = tempDate.getFullYear() + '' + (tempDate.getMonth() + 1) + '' + tempDate.getDate() + '' + tempDate.getHours() + '' + tempDate.getMinutes() + '' + tempDate.getSeconds();
      var date = tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate();
      //Get GST option
      var pricenogst = 0.0872 * 0.909090909090909;
      var gst = 0.0872 - pricenogst;
      const currDate = date;

      //Get the link posted
      var strcat = category;
      strcat = strcat.replace(/\s+/g, '-').toLowerCase();
      var strtitle = title;
      strtitle = strtitle.replace(/\s+/g, '-').toLowerCase();
      var url = encodeURI("https://immutablepost.com/post/" + strcat + "/" + strtitle + "/" + j);


      var company_name = $('#compname').val();
      var company_contact_name = $('#compcontactname').val();
      var company_country = $('#compcountry').val();
      var company_address = $('#compaddress').val();
      var company_phone = $('#compphone').val();
      var company_email = $('#compemail').val();
      var fee = "0.0872 ETH";
      var date = currDate;
      var feenogst = pricenogst.toFixed(4);
      var gstcal = gst.toFixed(4);
      var invoicenb = invoicenumberdate;
      var posturl = url;

      //For Split Invoice
      var plugin_company_name = $('#pluginsetup_company').val();
      var plugin_company_contact_name = $('#pluginsetup_fullname').val();
      var plugin_company_country = $('#pluginsetup_country').val();
      var plugin_company_address = $('#pluginsetup_address').val();
      var plugin_company_phone = $('#pluginsetup_phone').val();
      var plugin_company_email = $('#pluginsetup_email').val();

      jQuery.ajax({
        type: "post",
        dataType: "json",
        url: my_ajax_object.ajax_url,
        data: {
          action: "send_email_post",
          company_name: company_name,
          company_contact_name: company_contact_name,
          company_country: company_country,
          company_address: company_address,
          company_phone: company_phone,
          company_email: company_email,
          fee: fee,
          feenogst: feenogst,
          gstcal: gstcal,
          invoicenb: invoicenb,
          posturl: posturl,
          plugin_company_name: plugin_company_name,
          plugin_company_contact_name: plugin_company_contact_name,
          plugin_company_country: plugin_company_country,
          plugin_company_address: plugin_company_address,
          plugin_company_phone: plugin_company_phone,
          plugin_company_email: plugin_company_email,
        },
        success: function (response) {
          if (response.type == "success") {

          }
          else {
            //alert("Your vote could not be added")
          }
        }
      })   


      this.setStatus("Upload completed!");

      this.refreshPosts();
      title = "";
      description = "";

    }

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
    $('#noweb3').hide();
    $('.immutablepost-form').show();
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    $('#noweb3').show();
    $('.immutablepost-form').hide();
    // console.warn(
    //   "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    // );
    // // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    // App.web3 = new Web3(
    //   new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
    // );
  }

  App.start();
});

