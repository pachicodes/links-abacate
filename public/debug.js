// Teste simples para verificar se a API funciona
async function testAPI() {
    try {
        console.log('🧪 Testando API...');
        
        const testUrl = 'https://github.com/pachicodes';
        
        const response = await fetch('/api/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: testUrl }),
        });
        
        console.log('Status:', response.status);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
        
        const text = await response.text();
        console.log('Response text:', text);
        
        try {
            const data = JSON.parse(text);
            console.log('✅ JSON válido:', data);
        } catch (e) {
            console.error('❌ JSON inválido:', e);
        }
        
    } catch (error) {
        console.error('💥 Erro no teste:', error);
    }
}

// Executar teste quando a página carregar (apenas para debug)
if (window.location.search.includes('debug=true')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testAPI, 1000);
    });
}
