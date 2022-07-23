const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DAOModerators Flow", async () => {
    let DAOModerators;
    beforeEach(async () => {
        const DAOModeratorsFactory = await ethers.getContractFactory(
            "DAOModerators"
        );
        DAOModerators = await DAOModeratorsFactory.deploy();
        await DAOModerators.deployed();
    });

    it("sets 2 new moderators", async () => {
        await DAOModerators.setNewModerators(
            'Fernando', 'f.rodriguez.hervias@gmail.com',
            '0xC776cBDDeA014889E8BaB4323C894C5c34DB214D'
        );
        await DAOModerators.setNewModerators(
            'Hernando', 'h.rodriguez.hervias@gmail.com',
            '0x859f65bb20A07099C6a2fA555a500Cf5D76AD5E7'
        );

        const moderators = await DAOModerators.getModerators();
        expect(moderators).to.have.lengthOf(2);
    });

    it("sets 2 new moderators and then deletes them", async () => {
        await DAOModerators.setNewModerators(
            'Fernando', 'f.rodriguez.hervias@gmail.com',
            '0xC776cBDDeA014889E8BaB4323C894C5c34DB214D'
        );
        await DAOModerators.setNewModerators(
            'Hernando', 'h.rodriguez.hervias@gmail.com',
            '0x859f65bb20A07099C6a2fA555a500Cf5D76AD5E7'
        );

        await DAOModerators.deleteModerators();

        const moderators = await DAOModerators.getModerators();
        expect(moderators).to.have.lengthOf(0);
    });
});