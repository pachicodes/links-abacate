// Função serverless para encurtar URLs
const { v4: uuidv4 } = require('uuid');

// Armazenamento temporário (em produção usar banco externo)
const links = new Map();
const clicks = [];

// Dados de exemplo
links.set('gh-pachi', {
    id: 1,
    original_url: 'https://github.com/pachicodes',
    short_code: 'gh-pachi',
    created_at: new Date().toISOString(),
    clicks: 15
});

function generateShortCode() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Tratar OPTIONS para CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        console.log('API chamada:', req.method, req.url);
        
        // Sempre retornar JSON
        res.setHeader('Content-Type', 'application/json');
        
        if (req.method === 'POST') {
            const { url } = req.body;
            
            console.log('URL recebida:', url);
            
            if (!url) {
                return res.status(400).json({ error: 'URL é obrigatória' });
            }

            // Validar URL
            try {
                new URL(url);
            } catch (e) {
                return res.status(400).json({ error: 'URL inválida' });
            }

            let shortCode = generateShortCode();
            
            // Garantir que o código é único
            while (links.has(shortCode)) {
                shortCode = generateShortCode();
            }
            
            const linkData = {
                id: Date.now(),
                original_url: url,
                short_code: shortCode,
                created_at: new Date().toISOString(),
                clicks: 0
            };
            
            links.set(shortCode, linkData);
            
            const protocol = req.headers['x-forwarded-proto'] || 'https';
            const host = req.headers.host;
            
            console.log('Link criado:', shortCode);
            
            return res.status(200).json({
                original_url: url,
                short_url: `${protocol}://${host}/${shortCode}`,
                short_code: shortCode
            });
        }
        
        return res.status(405).json({ error: 'Método não permitido' });
        
    } catch (error) {
        console.error('Erro na API:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
