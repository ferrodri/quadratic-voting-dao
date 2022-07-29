const { loadFixture, } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { BigNumber } = require('ethers');
const { moveBlocks } = require('./utils');

// Total supply of ERC20Votes
const totalSupply = '300';

describe('GovernanceToken', function () {
    async function deployContractFixture() {
        const GovernanceTokenFactory = await ethers
            .getContractFactory('GovernanceToken');

        const GovernanceToken =
            await GovernanceTokenFactory.deploy(BigNumber.from(totalSupply));

        await GovernanceToken.deployed();

        return GovernanceToken;
    }

    describe('Deployment', function () {
        it('Should set the right total supply of checkpoints(voting power)',
            async function () {
                const GovernanceToken = await loadFixture(deployContractFixture);
                await moveBlocks(1);
                const { number } = await ethers.provider.getBlock('latest');
                expect(
                    await GovernanceToken.getPastTotalSupply(number - 1)
                ).to.equal(totalSupply);
            }
        );

        it("Owner's ERC20Votes balance should equal total supply", async function () {
            const GovernanceToken = await loadFixture(deployContractFixture);
            const [{ address: owner }] = await ethers.getSigners();
            expect(
                await GovernanceToken.balanceOf(owner)
            ).to.equal(totalSupply);
        });
    });

    describe('Delegation and transfer of ERC20Votes', function () {
        it('Owner should delegate voting power to himself', async function () {
            const GovernanceToken = await loadFixture(deployContractFixture);
            const [{ address: owner }] = await ethers.getSigners();
            await GovernanceToken.delegate(owner);
            expect(await GovernanceToken.getVotes(owner)).to.equal(totalSupply);
        });

        it('Owner should transfer a third of ERC20Votes to another address',
            async function () {
                const GovernanceToken = await loadFixture(deployContractFixture);
                const [, { address: to }] = await ethers.getSigners();
                const amount = totalSupply / 3;
                await GovernanceToken.transfer(
                    to, BigNumber.from((amount).toString())
                );
                expect(await GovernanceToken.balanceOf(to)).to.equal(amount);
            }
        );

        it('Transfer should fail if transfer amount is more than ERC20Votes balance',
            async function () {
                const GovernanceToken = await loadFixture(deployContractFixture);
                const [, { address: to }] = await ethers.getSigners();
                const amount = totalSupply + 50;
                await expect(
                    GovernanceToken.transfer(to, BigNumber.from((amount).toString()))
                ).to.be.reverted;
            }
        );
    });

});
