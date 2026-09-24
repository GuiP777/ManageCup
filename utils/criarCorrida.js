function criarCorrida(participantes) {
    const quantidadeBaterias = Math.ceil(participantes.length / 8);

    if (quantidadeBaterias === 1) {
        return {
            tipo: 'corrida',
            baterias: [],
            final: {
                concluida: false,
                participantes: participantes.map((participante, index) => ({
                    id: index + 1,
                    externalId: participante.externalId,
                    name: participante.name,
                    tempo: null,
                    colocacao: null
                }))
            }
        };
    }

    const tamanhoBase = Math.floor(participantes.length / quantidadeBaterias);
    const restantes = participantes.length % quantidadeBaterias;
    const baterias = [];
    let inicio = 0;

    for (let i = 0; i < quantidadeBaterias; i++) {
        const quantidade = tamanhoBase + (i < restantes ? 1 : 0);
        const participantesBateria = participantes.slice(inicio, inicio + quantidade);

        baterias.push({
            numero: i + 1,
            concluida: false,
            participantes: participantesBateria.map((participante, index) => ({
                id: index + 1,
                externalId: participante.externalId,
                name: participante.name,
                tempo: null,
                colocacao: null
            }))
        });

        inicio += quantidade;
    }

    return {
        tipo: 'corrida',
        baterias,
        final: quantidadeBaterias === 1
            ? null
            : {
                concluida: false,
                participantes: []
            }
    };
}

module.exports = { criarCorrida };