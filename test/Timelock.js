const { loadFixture, } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { BigNumber } = require('ethers');

//Minimum delay in seconds for an operation to become valid
const minDelay = 3600;

describe('Timelock', function () {
    async function deployContractFixture() {
        const TimelockFactory = await ethers.getContractFactory('Timelock');

        const Timelock =
            await TimelockFactory.deploy(BigNumber.from(minDelay), [], []);

        await Timelock.deployed();

        return Timelock;
    }

    describe('Deployment', function () {
        it('Should set the right minimum delay', async function () {
            const Timelock = await loadFixture(deployContractFixture);
            expect(await Timelock.getMinDelay()).to.equal(minDelay);
        });
    });

});