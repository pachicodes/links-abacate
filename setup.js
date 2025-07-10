const sqlite3 = require('sqlite3').verbose();

// Script para configurar o banco de dados
const db = new sqlite3.Database('./links.db', (err) => {
    if (err) {
        console.error('Erro ao conectar com o banco de dados:', err.message);
        process.exit(1);
    } else {
        console.log('🗄️  Conectado ao banco de dados SQLite.');
    }
});

db.serialize(() => {
    console.log('📊 Criando tabelas...');
    
    // Tabela de links
    db.run(`CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original_url TEXT NOT NULL,
        short_code TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        clicks INTEGER DEFAULT 0
    )`, (err) => {
        if (err) {
            console.error('Erro ao criar tabela links:', err.message);
        } else {
            console.log('✅ Tabela "links" criada com sucesso');
        }
    });

    // Tabela de cliques para analytics
    db.run(`CREATE TABLE IF NOT EXISTS clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        short_code TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        referer TEXT,
        clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (short_code) REFERENCES links (short_code)
    )`, (err) => {
        if (err) {
            console.error('Erro ao criar tabela clicks:', err.message);
        } else {
            console.log('✅ Tabela "clicks" criada com sucesso');
        }
    });

    // Inserir alguns dados de exemplo
    const sampleLinks = [
        ['https://github.com/pachicodes', 'gh-pachi'],
        ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'rickroll'],
        ['https://developer.mozilla.org/pt-BR/', 'mdn-docs']
    ];

    const insertStmt = db.prepare('INSERT OR IGNORE INTO links (original_url, short_code, clicks) VALUES (?, ?, ?)');
    
    sampleLinks.forEach(([url, code]) => {
        const clicks = Math.floor(Math.random() * 50) + 1;
        insertStmt.run(url, code, clicks, (err) => {
            if (err) {
                console.log(`Link ${code} já existe ou erro:`, err.message);
            } else {
                console.log(`📝 Link de exemplo criado: ${code} -> ${url}`);
            }
        });
    });

    insertStmt.finalize();
});

db.close((err) => {
    if (err) {
        console.error('Erro ao fechar banco de dados:', err.message);
    } else {
        console.log('🎉 Configuração do banco de dados concluída!');
        console.log('');
        console.log('🚀 Para iniciar o servidor, execute:');
        console.log('   npm start');
        console.log('');
        console.log('💡 Para desenvolvimento (com auto-reload):');
        console.log('   npm run dev');
    }
});
