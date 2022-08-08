const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { deployDAOModeratorsFixture } = require('./shared/fixtures');
const { DAO_MODERATORS: { NEW_MODERATORS } } = require('./shared/constants');
const { NAME, EMAIL, MODERATOR_ADDRESS } = NEW_MODERATORS[0];


describe('DAOModerators', async () => {

    describe('Flux', function () {
        it('Should get current moderators', async () => {
            const DAOModerators = await loadFixture(deployDAOModeratorsFixture);
            const moderators = await DAOModerators.getModerators();
            expect(moderators).to.have.lengthOf(1);
        });

        it('Should set a new moderator', async () => {
            const DAOModerators = await loadFixture(deployDAOModeratorsFixture);
            await DAOModerators.setNewModerator(NAME, EMAIL, MODERATOR_ADDRESS);
            const moderators = await DAOModerators.getModerators();
            expect(moderators).to.have.lengthOf(2);
        });

        it('Should delete current moderators', async () => {
            const DAOModerators = await loadFixture(deployDAOModeratorsFixture);
            await DAOModerators.deleteModerators();
            const moderators = await DAOModerators.getModerators();
            expect(moderators).to.have.lengthOf(0);
        });
    });

    describe('Events', function () {
        it('Should emit an event on the appointment of a new moderator', async () => {
            const DAOModerators = await loadFixture(deployDAOModeratorsFixture);
            await expect(
                DAOModerators.setNewModerator(NAME, EMAIL, MODERATOR_ADDRESS)
            )
                .to.emit(DAOModerators, 'LogNewModerator')
                .withArgs( NAME, EMAIL, MODERATOR_ADDRESS );
        });
    });

});