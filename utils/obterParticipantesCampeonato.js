const { Campeonatos, Inscritos_Campeonato, User, User_Voleibol_Treinador, Equipes } = require('../model');



async function obterParticipantesCampeonato(campeonatoId) {

    const campeonato = await Campeonatos.findByPk(campeonatoId);

    if (!campeonato) {
        throw new Error('Campeonato não encontrado');
    }

    const inscritos = await Inscritos_Campeonato.findAll({
        raw: false,
        where: {
            id_campeonato: campeonatoId
        },
        include: [
            {
                model: User,
                as: 'userInscrito',

                include: [
                    {
                        model: User_Voleibol_Treinador,
                        as: 'perfilVoleibolTreinador',

                        include: [
                            {
                                model: Equipes,
                                as: 'equipeTreinador'
                            }
                        ]
                    }
                ]
            }
        ]

    });

    if (campeonato.esporte === 'voleibol') {

        return inscritos.map(inscrito => {

            const treinador = inscrito.userInscrito.perfilVoleibolTreinador;
            const equipe = treinador.equipeTreinador;

            if (!equipe) {
                throw new Error(
                    `O usuário ${inscrito.id_usuario} não possui equipe`
                );
            }

            return {
                name: treinador.nomeEquipe,
                externalId: equipe.id,
                tipo: 'equipe'
            };

        });

    }

    return inscritos.map(inscrito => {

        return {
            name: inscrito.userInscrito.nome,
            externalId: inscrito.userInscrito.id,
            tipo: 'usuario'
        };

    });

}

module.exports = obterParticipantesCampeonato;