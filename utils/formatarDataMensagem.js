function formatarDataMensagem(dataMensagem) {

    const data = new Date(dataMensagem);
    const agora = new Date();

    if (isNaN(data.getTime())) {
        return '--:--';
    }

    const mesmaData =
        data.getDate() === agora.getDate() &&
        data.getMonth() === agora.getMonth() &&
        data.getFullYear() === agora.getFullYear();

    // Mensagem de hoje
    if (mesmaData) {
        return data.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Mensagem de ontem
    const ontem = new Date(agora);
    ontem.setDate(agora.getDate() - 1);

    const foiOntem =
        data.getDate() === ontem.getDate() &&
        data.getMonth() === ontem.getMonth() &&
        data.getFullYear() === ontem.getFullYear();

    if (foiOntem) {
        return 'Ontem';
    }

    // Mensagem deste ano
    if (data.getFullYear() === agora.getFullYear()) {
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit'
        });
    }

    // Mensagem de outro ano
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

module.exports = formatarDataMensagem;