# Quadratic voting DAO

# Introduction

Welcome to the Quadratic Voting DAO. The purpose of this project is to demonstrate a quadratic voting model. The project manages the election of the moderators of the DAO through quadratic voting.

# Setup
Please read through this setup for smart contracts and interface to work.

- Fork - https://github.com/ferrodri/quadratic-voting-dao
- Contracts folder
1. Install Node Modules (nvm use / npm install)
2. Run Tests (npx hardhat test)
3. Start a local node (npx hardhat node - *TERMINAL ONE*)
4. Deploy Contracts / Local Blockchain Instance (npx hardhat --network localhost run scripts/deploy.js - *TERMINAL TWO*)

- Interface folder
1. Install Node Modules (nvm use / npm install)
2. Build the project (npm run build)
3. Start Project (npm run start - *TERMINAL THREE*)

- Connect wallet using Metamask (Must connect to hardhat instance by switching network and importing a hardhat account)
https://support.chainstack.com/hc/en-us/articles/4408642503449-Using-MetaMask-with-a-Hardhat-node

- Import 1st hardhat account (You can find your private keys in the first terminal where you ran npx hardhat node)
https://mammothinteractive.com/metamask-how-to-get-funds-on-hardhat-network/#:~:text=Click%20on%20your%20account%20icon,This%20account%20has%2010000%20Eth.

*Note*: Sometimes you may need to reset your metamask account to be able to create, vote or execute a proposal:
https://wealthquint.com/reset-metamask-wallet-account-30599/#:~:text=To%20reset%20MetaMask%20Wallet%2C%20In,MetaMask%20Wallet%20will%20be%20reset.

Please reach out if you have any issues getting your dev env setup.