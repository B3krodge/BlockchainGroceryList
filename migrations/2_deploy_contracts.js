const GroceryList = artifacts.require("./GroceryList.sol");

module.exports = function (deployer) {
  deployer.deploy(GroceryList);
};
