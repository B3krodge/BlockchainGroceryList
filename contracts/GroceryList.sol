pragma solidity ^0.5.0;

contract GroceryList {
  uint public groceryCount = 0;

  struct Grocery {
    uint id;
    string content;
    bool completed;
  }

  mapping(uint => Grocery) publ ic grocery;

  event GroceryCreated(
    uint id,
    string content,
    bool completed
  );

  event GroceryCompleted(
    uint id,
    bool completed
  );

  constructor() public {
    createGrocery("Example Item: Milk");
  }

  function createGrocery(string memory _content) public {
    groceryCount ++;
    grocery[groceryCount] = Grocery(groceryCount, _content, false);
    emit GroceryCreated(groceryCount, _content, false);
  }

  function toggleCompleted(uint _id) public {
    Grocery memory _grocery = grocery[_id];
    _grocery.completed = !_grocery.completed;
    grocery[_id] = _grocery;
    emit GroceryCompleted(_id, _grocery.completed);
  }
}