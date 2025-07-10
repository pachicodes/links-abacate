const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Armazenamento em memória para a Vercel (temporário)
// Em produção, você deveria usar um banco de dados externo como MongoDB, PostgreSQL, etc.
let links = new Map();
let clicks = [];

// Dados de exemplo
links.set('gh-pachi', {
    id: 1,
    original_url: 'https://github.com/pachicodes',
    short_code: 'gh-pachi',
    created_at: new Date().toISOString(),
    clicks: 15
});

links.set('rickroll', {
    id: 2,
    original_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    short_code: 'rickroll',
    created_at: new Date().toISOString(),
    clicks: 42
});

links.set('mdn-docs', {
    id: 3,
    original_url: 'https://developer.mozilla.org/pt-BR/',
    short_code: 'mdn-docs',
    created_at: new Date().toISOString(),
    clicks: 28
});

// Função para gerar código curto
function generateShortCode() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Rota para servir a página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para servir o dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// API para encurtar URL
app.post('/api/shorten', (req, res) => {
    try {
        const { url } = req.body;
        
        console.log('Recebido request para encurtar:', url);
        
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
        
        const host = req.get('host');
        const protocol = req.get('x-forwarded-proto') || req.protocol;
        
        console.log('Link criado:', linkData);
        
        res.json({
            original_url: url,
            short_url: `${protocol}://${host}/${shortCode}`,
            short_code: shortCode
        });
    } catch (error) {
        console.error('Erro no /api/shorten:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para redirecionar URL encurtada
app.get('/:shortCode', (req, res) => {
    try {
        const { shortCode } = req.params;
        
        // Ignorar arquivos estáticos
        if (shortCode.includes('.') || shortCode === 'favicon.ico') {
            return res.status(404).send('Arquivo não encontrado');
        }
        
        console.log('Buscando código:', shortCode);
        
        const link = links.get(shortCode);
        
        if (!link) {
            return res.status(404).send('Link não encontrado');
        }
        
        // Registrar o clique
        const clickData = {
            id: Date.now(),
            short_code: shortCode,
            ip_address: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'],
            user_agent: req.get('User-Agent') || '',
            referer: req.get('Referer') || '',
            clicked_at: new Date().toISOString()
        };
        
        clicks.push(clickData);
        
        // Atualizar contador de cliques
        link.clicks = (link.clicks || 0) + 1;
        links.set(shortCode, link);
        
        console.log('Redirecionando para:', link.original_url);
        
        res.redirect(link.original_url);
    } catch (error) {
        console.error('Erro no redirect:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

// API para obter estatísticas de todos os links
app.get('/api/stats', (req, res) => {
    try {
        const linksArray = Array.from(links.values()).map(link => ({
            ...link,
            total_clicks: clicks.filter(click => click.short_code === link.short_code).length
        }));
        
        res.json(linksArray);
    } catch (error) {
        console.error('Erro no /api/stats:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// API para obter estatísticas detalhadas de um link específico
app.get('/api/stats/:shortCode', (req, res) => {
    try {
        const { shortCode } = req.params;
        
        const link = links.get(shortCode);
        
        if (!link) {
            return res.status(404).json({ error: 'Link não encontrado' });
        }
        
        const linkClicks = clicks.filter(click => click.short_code === shortCode);
        
        res.json({
            link: link,
            clicks: linkClicks
        });
    } catch (error) {
        console.error('Erro no /api/stats/:shortCode:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Para Vercel, exportar o app
module.exports = app;

// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🥑 Links Abacate rodando na porta ${PORT}`);
        console.log(`📊 Dashboard disponível em: http://localhost:${PORT}/dashboard`);
        console.log(`🌐 Site em produção: https://links-abacate.vercel.app/`);
    });
}
