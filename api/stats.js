// Função serverless para estatísticas
const links = new Map();
const clicks = [];

// Dados de exemplo (mesmos que shorten.js)
links.set('gh-pachi', {
    id: 1,
    original_url: 'https://github.com/pachicodes',
    short_code: 'gh-pachi',
    created_at: new Date().toISOString(),
    clicks: 8
});

links.set('rickroll', {
    id: 2,
    original_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    short_code: 'rickroll',
    created_at: new Date().toISOString(),
    clicks: 5
});

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            const linksArray = Array.from(links.values()).map(link => ({
                ...link,
                total_clicks: clicks.filter(click => click.short_code === link.short_code).length
            }));
            
            return res.status(200).json(linksArray);
        }
        
        return res.status(405).json({ error: 'Método não permitido' });
        
    } catch (error) {
        console.error('Erro na API stats:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
