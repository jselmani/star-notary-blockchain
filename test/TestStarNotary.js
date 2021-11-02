const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
  accounts = accs;
  owner = accounts[0];
});

it('can Create a Star', async () => {
  let tokenId = 1;
  let instance = await StarNotary.deployed();
  await instance.createStar('Awesome Star!', tokenId, { from: accounts[0] })
  assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let starId = 2;
  let starPrice = web3.utils.toWei(".01", "ether");
  await instance.createStar('awesome star', starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 3;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar('awesome star', starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  await instance.buyStar(starId, { from: user2, value: balance });
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
  let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  let value2 = Number(balanceOfUser1AfterTransaction);
  assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 4;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar('awesome star', starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance });
  assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 5;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar('awesome star', starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
  const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
  let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
  assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async () => {
  // 1. create a Star with different tokenId
  //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided

  let starInstance = await StarNotary.deployed();
  let user1 = accounts[1];
  let starId = 6;
  await starInstance.createStar('Awesome Star #2', starId, { from: user1 });

  // 2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
  let ContractName = await starInstance.name();
  let ContractSymbol = await starInstance.symbol();

  // Looks up the stars using the Token ID, and then returns the name of the star
  let starLookup = await starInstance.lookUptokenIdToStarInfo(starId);

  assert.equal(ContractName, 'Star');
  assert.equal(ContractSymbol, 'STR');
  assert.equal(starLookup, 'Awesome Star #2');
});

it('lets 2 users exchange stars', async () => {
  // 1. create 2 Stars with different tokenId
  // 2. Call the exchangeStars functions implemented in the Smart Contract
  // 3. Verify that the owners changed

  let starInstance = await StarNotary.deployed();
  let user1 = accounts[1];
  let star1Id = 7;
  await starInstance.createStar('Awesome Star #7', star1Id, { from: user1 });
  let user2 = accounts[0];
  let star2Id = 8;
  await starInstance.createStar('Awesome Star #8', star2Id, { from: user2 });

  await starInstance.exchangeStars(star1Id, star2Id);

  let star2User = await starInstance.ownerOf(star2Id);
  let star1User = await starInstance.ownerOf(star1Id);

  assert.equal(star2User, user1);
  assert.equal(star1User, user2);
});

it('lets a user transfer a star', async () => {
  // 1. create a Star with different tokenId
  // 2. use the transferStar function implemented in the Smart Contract
  // 3. Verify the star owner changed.

  let starInstance = await StarNotary.deployed();
  let user1 = accounts[0];
  let user2 = accounts[1];
  let starId = 9;

  await starInstance.createStar('Star 1', starId, { from: user1 });

  await starInstance.transferStar(user2, starId, { from: user1 });

  let starUser = await starInstance.ownerOf(starId);

  assert.equal(starUser, user2);
});

it('lookUptokenIdToStarInfo test', async () => {
  // 1. create a Star with different tokenId
  // 2. Call your method lookUptokenIdToStarInfo
  // 3. Verify if you Star name is the same

  let starInstance = await StarNotary.deployed();
  let user1 = accounts[0];
  let starId = 10;

  await starInstance.createStar('Star 1', starId, { from: user1 });

  let starName = await starInstance.lookUptokenIdToStarInfo(starId);

  assert.equal(starName, 'Star 1');
});