const { BracketsManager } = require('brackets-manager');
const { InMemoryDatabase } = require('brackets-memory-db');

function criarManager() {

    const storage = new InMemoryDatabase();
    const manager = new BracketsManager(storage);

    return manager;
}

function proximaPotenciaDeDois(numero) {
    let tamanho = 1;

    while (tamanho < numero) {
        tamanho *= 2;
    }

    return tamanho;
}

async function criarBracket(CampeonatoId, participantes, esporte) {

    const manager = criarManager();
    const tamanho = proximaPotenciaDeDois(participantes.length);
    const seeding = [...participantes];

    while (seeding.length < tamanho) {
        seeding.push(null);
    }

    let matchesChildCount = 0;

    if (esporte === 'voleibol') {
        matchesChildCount = 5;
    }

    await manager.create.stage({
        tournamentId: CampeonatoId,
        name: 'Chaveamento',
        type: 'single_elimination',
        seeding: participantes,
        settings: {
            size: tamanho,
            matchesChildCount: matchesChildCount,
            balanceByes: true
        }
    });

    return await manager.export();
}

async function carregarBracket(bracketData) {

    const manager = criarManager();
    await manager.import(bracketData);
    return manager;
}

module.exports = {
    criarManager,
    criarBracket,
    carregarBracket
};