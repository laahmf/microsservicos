const express = require('express');
const app = express();
app.use(express.json());
const axios = require('axios');

const ingressosClienteId = {};
const {
    v4: uuidv4
} = require('uuid');

const funcoes = {
    IngressoClassificado: (ingresso) => {
        const ingressos =
            ingressosClienteId[ingresso.clienteId];
        const ingParaAtualizar = ingressos.find(o => o.id === ingresso.id)
        ingParaAtualizar.status = ingresso.status;
        axios.post('http://localhost:10000/eventos', {
            tipo: "IngressoAtualizado",
            dados: {
                id: ingresso.id,
                texto: ingresso.texto,
                lembreteId: ingresso.clienteId,
                status: ingresso.status
            }
        });
    }
}

app.post("/eventos", (req, res) => {
    try {
        funcoes[req.body.tipo](req.body.dados);
    } catch (err) {}
    req.status(200).send({
        msg: "ok"
    });
});

app.put('/clientes/:id/ingressos', async (req, res) => {
    const idIng = uuidv4();

    const {
        texto
    } = req.body;

    const ingressosCliente =
        ingressosClienteId[req.params.id] || [];
    ingressosCliente.push({
        id: idIng,
        texto,
        status: 'aguardando'
    });
    ingressosClienteId[req.params.id] =
        ingressosCliente;
    await axios.post('http://localhost:1000/eventos', {
        tipo: "IngressoCriado",
        dados: {
            id: idIng,
            texto,
            clienteId: req.params.id,
            status: 'aguardando'
        }
    })
    res.status(201).send(ingressosCliente);
});
app.get('/clientes/:id/ingressos', (req, res) => {
    res.send(ingressosClienteId[req.params.id] || []);

});
app.listen(5000, (() => {
    console.log('Ingressos. Porta 5000');
}));