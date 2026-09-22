function validarTempo(tempo) {

    tempo = Number(tempo);

    if (!Number.isFinite(tempo)) {
        return false;
    }

    if (tempo <= 0) {
        return false;
    }

    return true;
}

function calcularResultado(tempo1, tempo2) {

    tempo1 = Number(tempo1);
    tempo2 = Number(tempo2);

    if (!validarTempo(tempo1) || !validarTempo(tempo2)) {
        return {
            valido: false,
            mensagem: 'Os tempos informados são inválidos.'
        };
    }

    if (tempo1 === tempo2) {
        return {
            valido: false,
            mensagem: 'Não pode haver empate entre os tempos.'
        };
    }

    const vencedor = tempo1 < tempo2 ? 1 : 2;

    return {
        valido: true,
        vencedor,
        tempo1,
        tempo2
    };
}

module.exports = {
    validarTempo,
    calcularResultado
};