const { loadFixture, } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { BigNumber } = require('ethers');
const { moveBlocks } = require('./shared/utilities');
const { deployGovernanceTokenFixture } = require('./shared/fixtures');
const { GOVERNANCE_TOKEN: { TOTAL_SUPPLY } } = require('./shared/constants');


describe('GovernanceToken', function () {

    describe('Deployment', function () {
        it('Should set the right total supply of checkpoints(voting power)',
            async function () {
                const GovernanceToken = 
                    await loadFixture(deployGovernanceTokenFixture);
                await moveBlocks(1);
                const { number } = await ethers.provider.getBlock('latest');
                expect(
                    await GovernanceToken.getPastTotalSupply(number - 1)
                ).to.equal(TOTAL_SUPPLY);
            }
        );

        it('Owner ERC20Votes balance should equal total supply', async function () {
            const GovernanceToken = 
                await loadFixture(deployGovernanceTokenFixture);
            const [{ address: owner }] = await ethers.getSigners();
            expect(
                await GovernanceToken.balanceOf(owner)
            ).to.equal(TOTAL_SUPPLY);
        });
    });

    describe('Delegation and transfer of ERC20Votes', function () {
        it('Owner should delegate voting power to himself', async function () {
            const GovernanceToken = 
                await loadFixture(deployGovernanceTokenFixture);
            const [{ address: owner }] = await ethers.getSigners();
            await GovernanceToken.delegate(owner);
            expect(await GovernanceToken.getVotes(owner)).to.equal(TOTAL_SUPPLY);
        });

        it('Owner should transfer a third of ERC20Votes to another address',
            async function () {
                const GovernanceToken = 
                    await loadFixture(deployGovernanceTokenFixture);
                const [, { address: to }] = await ethers.getSigners();
                const amount = TOTAL_SUPPLY / 3;
                await GovernanceToken.transfer(
                    to, BigNumber.from(amount)
                );
                expect(await GovernanceToken.balanceOf(to)).to.equal(amount);
            }
        );

        it('Transfer should fail if transfer amount is more than ERC20Votes balance',
            async function () {
                const GovernanceToken = 
                    await loadFixture(deployGovernanceTokenFixture);
                const [, { address: to }] = await ethers.getSigners();
                const amount = TOTAL_SUPPLY + 50;
                await expect(
                    GovernanceToken.transfer(to, BigNumber.from(amount))
                ).to.be.reverted;
            }
        );
    });

});
