// API Handler para logout
module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ erro: 'Método não permitido' });
    }

    try {
        // Para logout, não precisamos fazer nada no servidor
        // O cliente deve remover o token do localStorage
        console.log('Logout realizado');

        res.status(200).json({
            sucesso: true,
            mensagem: 'Logout realizado com sucesso!'
        });

    } catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({ 
            erro: 'Erro interno do servidor' 
        });
    }
};
