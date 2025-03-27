App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadContract();
    await App.render();
  },
  loadWeb3: async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        console.error("User denied account access");
      }
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.log("Non-Ethereum browser detected. Install MetaMask!");
      window.web3 = new Web3(
        new Web3.providers.HttpProvider("http://localhost:8545")
      );
    }
  },
  loadAccount: async () => {
    const accounts = await ethereum.request({ method: "eth_accounts" });
    App.account = accounts[0];
  },

  loadContract: async () => {
    const groceryList = await $.getJSON("GroceryList.json");
    App.contracts.GroceryList = TruffleContract(groceryList);
    App.contracts.GroceryList.setProvider(window.ethereum);
    // Hydrate the smart contract with values from the blockchain
    App.groceryList = await App.contracts.GroceryList.deployed();
  },

  render: async () => {
    // Prevent double render
    if (App.loading) {
      return;
    }
    App.setLoading(true);
    $("#account").html(App.account);
    await App.renderGroceries();
    App.setLoading(false);
  },

  renderGroceries: async () => {
    const groceryCount = await App.groceryList.groceryCount();
    const $groceryTemplate = $(".groceryTemplate");

    for (var i = 1; i <= groceryCount; i++) {
      const grocery = await App.groceryList.grocery(i);
      const groceryId = grocery[0].toNumber();
      const groceryContent = grocery[1];
      const groceryCompleted = grocery[2];

      const $newGroceryTemplate = $groceryTemplate.clone();
      $newGroceryTemplate.find(".content").html(groceryContent);
      $newGroceryTemplate
        .find("input")
        .prop("name", groceryId)
        .prop("checked", groceryCompleted)
        .on("click", App.toggleCompleted);

      if (groceryCompleted) {
        $("#completedGroceryList").prepend($newGroceryTemplate);
      } else {
        $("#groceryList").prepend($newGroceryTemplate);
      }

      $newGroceryTemplate.show();
    }
  },

  createGrocery: async () => {
    App.setLoading(true);
    const content = $("#newGrocery").val();
    await App.groceryList.createGrocery(content, { from: App.account });
    window.location.reload();
  },

  toggleCompleted: async (e) => {
    try {
      App.setLoading(true);
      const groceryId = e.target.name;
      await App.groceryList.toggleCompleted(groceryId, {
        from: App.account,
        gas: 300000,
      });
      window.location.reload();
    } catch (error) {
      console.error("Toggle error:", error);
      alert(`Error: ${error.message}`);
      App.setLoading(false);
    }
  },

  setLoading: (boolean) => {
    App.loading = boolean;
    const loader = $("#loader");
    const content = $("#content");
    if (boolean) {
      loader.show();
      content.hide();
    } else {
      loader.hide();
      content.show();
    }
  },
};

$(() => {
  $(window).load(() => {
    App.load();
  });
});
