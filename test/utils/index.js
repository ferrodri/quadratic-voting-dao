module.exports = {
    moveBlocks: async function (amount) {
        for (let i = 0; i < amount; i++) {
            await network.provider.request({ method: 'evm_mine' });
        }
    }
}