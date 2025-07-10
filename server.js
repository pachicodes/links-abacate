const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('./links.db', (err) => {
    if (err) {
        console.error('Erro ao conectar com o banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

// Criar tabelas se não existirem
db.serialize(() => {
    // Tabela de links
    db.run(`CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original_url TEXT NOT NULL,
        short_code TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        clicks INTEGER DEFAULT 0
    )`);

    // Tabela de cliques para analytics
    db.run(`CREATE TABLE IF NOT EXISTS clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        short_code TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        referer TEXT,
        clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (short_code) REFERENCES links (short_code)
    )`);
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
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({ error: 'URL é obrigatória' });
    }

    // Validar URL
    try {
        new URL(url);
    } catch (e) {
        return res.status(400).json({ error: 'URL inválida' });
    }

    const shortCode = generateShortCode();
    
    db.run('INSERT INTO links (original_url, short_code) VALUES (?, ?)', 
        [url, shortCode], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        res.json({
            original_url: url,
            short_url: `${req.protocol}://${req.get('host')}/${shortCode}`,
            short_code: shortCode
        });
    });
});

// Rota para redirecionar URL encurtada
app.get('/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    
    db.get('SELECT original_url FROM links WHERE short_code = ?', [shortCode], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Erro interno do servidor');
        }
        
        if (!row) {
            return res.status(404).send('Link não encontrado');
        }
        
        // Registrar o clique
        const clickData = {
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent') || '',
            referer: req.get('Referer') || ''
        };
        
        db.run('INSERT INTO clicks (short_code, ip_address, user_agent, referer) VALUES (?, ?, ?, ?)',
            [shortCode, clickData.ip, clickData.userAgent, clickData.referer], (err) => {
            if (err) {
                console.error('Erro ao registrar clique:', err.message);
            }
        });
        
        // Atualizar contador de cliques
        db.run('UPDATE links SET clicks = clicks + 1 WHERE short_code = ?', [shortCode]);
        
        res.redirect(row.original_url);
    });
});

// API para obter estatísticas de todos os links
app.get('/api/stats', (req, res) => {
    db.all(`SELECT 
        l.id,
        l.original_url,
        l.short_code,
        l.created_at,
        l.clicks,
        COUNT(c.id) as total_clicks
        FROM links l
        LEFT JOIN clicks c ON l.short_code = c.short_code
        GROUP BY l.id
        ORDER BY l.created_at DESC`, (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        res.json(rows);
    });
});

// API para obter estatísticas detalhadas de um link específico
app.get('/api/stats/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    
    // Buscar informações do link
    db.get('SELECT * FROM links WHERE short_code = ?', [shortCode], (err, link) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        if (!link) {
            return res.status(404).json({ error: 'Link não encontrado' });
        }
        
        // Buscar cliques detalhados
        db.all('SELECT * FROM clicks WHERE short_code = ? ORDER BY clicked_at DESC', [shortCode], (err, clicks) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            res.json({
                link: link,
                clicks: clicks
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`🥑 Links Abacate rodando na porta ${PORT}`);
    console.log(`📊 Dashboard disponível em: http://localhost:${PORT}/dashboard`);
});
