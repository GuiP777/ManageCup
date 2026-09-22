const TOTAL_ROUNDS = 3;

function validarRound(pontos1, pontos2, numeroRound) {

    pontos1 = Number(pontos1);
    pontos2 = Number(pontos2);

    if (!Number.isInteger(pontos1) || !Number.isInteger(pontos2)) {
        return {
            valido: false,
            mensagem: `Pontuação inválida no round ${numeroRound}.`
        };
    }

    if (pontos1 < 0 || pontos2 < 0) {
        return {
            valido: false,
            mensagem: 'A pontuação não pode ser negativa.'
        };
    }

    if (pontos1 > 10 || pontos2 > 10) {
        return {
            valido: false,
            mensagem: 'A pontuação de cada boxeador deve estar entre 0 e 10.'
        };
    }

    return {
        valido: true
    };
}

function calcularDecisao(rounds) {

    if (!Array.isArray(rounds)) {
        return {
            valido: false,
            mensagem: 'Rounds inválidos.'
        };
    }

    if (rounds.length !== TOTAL_ROUNDS) {
        return {
            valido: false,
            mensagem: `A luta deve possuir ${TOTAL_ROUNDS} rounds.`
        };
    }

    let total1 = 0;
    let total2 = 0;

    for (let i = 0; i < rounds.length; i++) {

        const round = rounds[i];

        const resultado = validarRound(
            round.pontos1,
            round.pontos2,
            i + 1
        );

        if (!resultado.valido) {
            return resultado;
        }

        total1 += Number(round.pontos1);
        total2 += Number(round.pontos2);
    }

    if (total1 === total2) {
        return {
            valido: false,
            mensagem: 'A pontuação final da luta terminou empatada.'
        };
    }

    const vencedor = total1 > total2 ? 1 : 2;

    return {
        valido: true,
        vencedor,
        total1,
        total2,
        media1: total1 / TOTAL_ROUNDS,
        media2: total2 / TOTAL_ROUNDS
    };
}

module.exports = {
    TOTAL_ROUNDS,
    validarRound,
    calcularDecisao
};