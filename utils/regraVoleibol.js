function validarSet(pontos1, pontos2, numeroSet) {

    pontos1 = Number(pontos1);
    pontos2 = Number(pontos2);

    if (!Number.isInteger(pontos1) || !Number.isInteger(pontos2)) {
        return {
            valido: false,
            mensagem: 'A pontuação deve ser formada por números inteiros.'
        };
    }

    if (pontos1 < 0 || pontos2 < 0) {
        return {
            valido: false,
            mensagem: 'A pontuação não pode ser negativa.'
        };
    }

    if (pontos1 === pontos2) {
        return {
            valido: false,
            mensagem: 'Um set não pode terminar empatado.'
        };
    }

    const limite = numeroSet === 5 ? 15 : 25;
    const maior = Math.max(pontos1, pontos2);
    const menor  = Math.min(pontos1, pontos2);
    const diferenca = Math.abs(pontos1 - pontos2);

    if (maior < limite) {
        return {
            valido: false,
            mensagem:
                `O ${numeroSet}º set precisa chegar a pelo menos ${limite} pontos.`
        };
    }

    if (maior > limite) {
        if (menor < limite - 1 || diferenca !== 2) {
            return {
                valido: false,
                mensagem: `Depois dos ${limite} pontos, é necessário manter 2 pontos de diferença e o adversário deve ter pelo menos ${limite - 1} pontos.`
            };
        }
    } else if (diferenca < 2) {
        return {
            valido: false,
            mensagem: 'É necessário ter pelo menos 2 pontos de diferença.'
        };
    }

    return {
        valido: true
    };
}

module.exports = {
    validarSet
};