const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

// Moderator that will be added on the tests
const newModerator = {
    name: 'Daniel',
    email: 'daniel@gmail.com',
    moderatorAddress: '0xEf19b3c41978bECC5fbEA27515a1894aa28e3461'
};
const { name, email, moderatorAddress } = newModerator;

describe('DAOModerators', async () => {
    async function deployContractFixture() {
        const DAOModeratorsFactory = await ethers
            .getContractFactory('DAOModerators');

        const DAOModerators = await DAOModeratorsFactory.deploy(
            'Fernando', 'f.rodriguez.hervias@gmail.com',
            '0xC776cBDDeA014889E8BaB4323C894C5c34DB214D'
        );

        await DAOModerators.deployed();

        return DAOModerators;
    }

    describe('Flux', function () {
        it('Should get current moderators', async () => {
            const DAOModerators = await loadFixture(deployContractFixture);
            const moderators = await DAOModerators.getModerators();
            expect(moderators).to.have.lengthOf(1);
        });

        it('Should set a new moderator', async () => {
            const DAOModerators = await loadFixture(deployContractFixture);
            await DAOModerators.setNewModerator(name, email, moderatorAddress);
            const moderators = await DAOModerators.getModerators();
            expect(moderators).to.have.lengthOf(2);
        });

        it('Should delete current moderators', async () => {
            const DAOModerators = await loadFixture(deployContractFixture);
            await DAOModerators.deleteModerators();
            const moderators = await DAOModerators.getModerators();
            expect(moderators).to.have.lengthOf(0);
        });
    });
    
    describe('Events', function () {
        it('Should emit an event on the appointment of a new moderator', async () => {
            const DAOModerators = await loadFixture(deployContractFixture);
            await expect(
                DAOModerators.setNewModerator(name, email, moderatorAddress)
            )
                .to.emit(DAOModerators, 'LogNewModerator')
                .withArgs(name, email, moderatorAddress);
        });
    });

});