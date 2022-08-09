module.exports = {
    moveBlocks: async (amount) => {
        for (let i = 0; i < amount; i++) {
            // eslint-disable-next-line no-undef
            await network.provider.request({ method: 'evm_mine' });
        }
    }
};