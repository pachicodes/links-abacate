// Alpine.js Components

// URL Shortener Component
function urlShortener() {
    return {
        url: '',
        loading: false,
        error: '',
        result: null,
        copied: false,

        async shortenUrl() {
            if (!this.url) return;

            this.loading = true;
            this.error = '';
            this.result = null;

            try {
                console.log('Enviando request para:', '/api/shorten');
                console.log('URL a ser encurtada:', this.url);
                
                const response = await fetch('/api/shorten', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: this.url }),
                });

                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);

                // Verificar se a resposta é JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const textResponse = await response.text();
                    console.error('Resposta não é JSON:', textResponse);
                    throw new Error('Servidor retornou resposta inválida. Verifique se a API está funcionando.');
                }

                const data = await response.json();
                console.log('Response data:', data);

                if (!response.ok) {
                    throw new Error(data.error || 'Erro ao encurtar URL');
                }

                this.result = data;
                this.url = '';
            } catch (error) {
                console.error('Erro completo:', error);
                this.error = error.message || 'Erro desconhecido ao encurtar URL';
            } finally {
                this.loading = false;
            }
        },

        async copyToClipboard(text) {
            try {
                await navigator.clipboard.writeText(text);
                this.copied = true;
                setTimeout(() => {
                    this.copied = false;
                }, 2000);
            } catch (error) {
                console.error('Erro ao copiar:', error);
                // Fallback para navegadores antigos
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.copied = true;
                setTimeout(() => {
                    this.copied = false;
                }, 2000);
            }
        }
    };
}

// Dashboard Component
function dashboard() {
    return {
        loading: true,
        links: [],
        searchTerm: '',
        sortBy: 'created_at',
        showModal: false,
        modalLoading: false,
        linkDetails: null,

        // Computed properties
        get totalLinks() {
            return this.links.length;
        },

        get totalClicks() {
            return this.links.reduce((sum, link) => sum + (link.clicks || 0), 0);
        },

        get averageClicks() {
            return this.totalLinks > 0 ? Math.round(this.totalClicks / this.totalLinks) : 0;
        },

        get topLinkClicks() {
            return Math.max(...this.links.map(link => link.clicks || 0), 0);
        },

        get filteredLinks() {
            let filtered = this.links;

            // Filter by search term
            if (this.searchTerm) {
                const search = this.searchTerm.toLowerCase();
                filtered = filtered.filter(link => 
                    link.original_url.toLowerCase().includes(search) ||
                    link.short_code.toLowerCase().includes(search)
                );
            }

            // Sort
            filtered.sort((a, b) => {
                switch (this.sortBy) {
                    case 'clicks':
                        return (b.clicks || 0) - (a.clicks || 0);
                    case 'original_url':
                        return a.original_url.localeCompare(b.original_url);
                    case 'created_at':
                    default:
                        return new Date(b.created_at) - new Date(a.created_at);
                }
            });

            return filtered;
        },

        async init() {
            await this.loadStats();
            this.initCharts();
        },

        async loadStats() {
            try {
                const response = await fetch('/api/stats');
                if (!response.ok) {
                    throw new Error('Erro ao carregar estatísticas');
                }
                this.links = await response.json();
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                this.loading = false;
            }
        },

        initCharts() {
            this.$nextTick(() => {
                this.createClicksChart();
                this.createTopLinksChart();
            });
        },

        createClicksChart() {
            const ctx = document.getElementById('clicksChart');
            if (!ctx) return;

            // Prepare data for clicks over time
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                last7Days.push(date.toISOString().split('T')[0]);
            }

            const clicksData = last7Days.map(date => {
                return this.links.filter(link => 
                    link.created_at && link.created_at.startsWith(date)
                ).reduce((sum, link) => sum + (link.clicks || 0), 0);
            });

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: last7Days.map(date => {
                        const d = new Date(date);
                        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                    }),
                    datasets: [{
                        label: 'Cliques',
                        data: clicksData,
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            });
        },

        createTopLinksChart() {
            const ctx = document.getElementById('topLinksChart');
            if (!ctx) return;

            // Get top 5 links by clicks
            const topLinks = [...this.links]
                .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
                .slice(0, 5);

            if (topLinks.length === 0) {
                ctx.getContext('2d').fillText('Nenhum dado disponível', 50, 50);
                return;
            }

            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: topLinks.map(link => link.short_code),
                    datasets: [{
                        data: topLinks.map(link => link.clicks || 0),
                        backgroundColor: [
                            '#22c55e',
                            '#f59e0b',
                            '#ef4444',
                            '#3b82f6',
                            '#8b5cf6'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        },

        async viewDetails(shortCode) {
            this.showModal = true;
            this.modalLoading = true;
            this.linkDetails = null;

            try {
                const response = await fetch(`/api/stats/${shortCode}`);
                if (!response.ok) {
                    throw new Error('Erro ao carregar detalhes');
                }
                this.linkDetails = await response.json();
            } catch (error) {
                console.error('Erro ao carregar detalhes:', error);
            } finally {
                this.modalLoading = false;
            }
        },

        closeModal() {
            this.showModal = false;
            this.linkDetails = null;
        },

        async deleteLink(linkId) {
            if (!confirm('Tem certeza que deseja excluir este link?')) {
                return;
            }

            try {
                // Note: We'd need to implement a delete endpoint in the server
                // For now, just remove from the local array
                this.links = this.links.filter(link => link.id !== linkId);
            } catch (error) {
                console.error('Erro ao excluir link:', error);
            }
        },

        async copyToClipboard(text) {
            try {
                await navigator.clipboard.writeText(text);
                // Show success feedback
                const event = new CustomEvent('show-toast', {
                    detail: { message: 'Link copiado!', type: 'success' }
                });
                window.dispatchEvent(event);
            } catch (error) {
                console.error('Erro ao copiar:', error);
            }
        },

        truncateUrl(url) {
            return url.length > 50 ? url.substring(0, 50) + '...' : url;
        },

        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        formatDateTime(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    };
}

// Toast notification system
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add styles
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 24px',
        backgroundColor: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
        color: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        zIndex: '9999',
        animation: 'slideInRight 0.3s ease-out',
        fontWeight: '500'
    });
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Listen for toast events
window.addEventListener('show-toast', (event) => {
    showToast(event.detail.message, event.detail.type);
});

// Add CSS animations for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Auto-refresh dashboard data every 30 seconds
    if (window.location.pathname === '/dashboard') {
        setInterval(() => {
            const dashboardComponent = Alpine.$data(document.querySelector('[x-data="dashboard()"]'));
            if (dashboardComponent && !dashboardComponent.loading) {
                dashboardComponent.loadStats();
            }
        }, 30000);
    }
});

// Service Worker for PWA functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
