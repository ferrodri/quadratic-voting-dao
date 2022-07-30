const { loadFixture, } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { TIMELOCK: { MIN_DELAY } } = require('./shared/constants');
const { deployTimelockFixture } = require('./shared/fixtures');


describe('Timelock', function () {

    describe('Deployment', function () {
        it('Should set the right minimum delay', async function () {
            const Timelock = await loadFixture(deployTimelockFixture);
            expect(await Timelock.getMinDelay()).to.equal(MIN_DELAY);
        });
    });

});