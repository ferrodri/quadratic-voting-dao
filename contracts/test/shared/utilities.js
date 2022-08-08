module.exports = {
    moveBlocks: async (amount) => {
        for (let i = 0; i < amount; i++) {
            await network.provider.request({ method: 'evm_mine' });
       }
    }
}