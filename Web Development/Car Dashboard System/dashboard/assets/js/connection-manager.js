
class ConnectionManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.connectionType = 'unknown';
        this.signalStrength = 0;
        this.downloadSpeed = 0;
        this.uploadSpeed = 0;
        this.latency = 0;
        this.lastSpeedTest = null;
        
        this.connectionCard = document.querySelector('.status-card.connection');
        this.signalBars = document.querySelector('.signal-bars');
        this.connectionText = this.connectionCard?.querySelector('p');
        this.connectionIcon = this.connectionCard?.querySelector('.status-icon i');
        
        this.initializeConnectionMonitoring();
        this.setupEventListeners();
        this.startPeriodicChecks();
    }

    initializeConnectionMonitoring() {
        this.checkConnectionStatus();
        this.detectConnectionType();
        this.updateConnectionDisplay();
        
        console.log('🌐 Connection Manager initialized');
    }

    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.onConnectionChange('online');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.onConnectionChange('offline');
        });

        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.detectConnectionType();
                this.updateConnectionDisplay();
            });
        }

        if (this.connectionCard) {
            this.connectionCard.addEventListener('click', () => {
                this.performSpeedTest();
            });
            
            this.connectionCard.style.cursor = 'pointer';
            this.connectionCard.title = 'انقر لاختبار سرعة الإنترنت';
        }
    }

    checkConnectionStatus() {
        this.isOnline = navigator.onLine;
        
        if (this.isOnline) {
            this.pingTest();
        }
    }

    async pingTest() {
        try {
            const startTime = Date.now();
            const response = await fetch('https://www.google.com/favicon.ico', {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache'
            });
            const endTime = Date.now();
            
            this.latency = endTime - startTime;
            this.isOnline = true;
            
        } catch (error) {
            console.warn('Ping test failed:', error);
            this.isOnline = false;
            this.latency = 0;
        }
    }

    detectConnectionType() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.connectionType = connection.effectiveType || connection.type || 'unknown';
            
            this.calculateSignalStrength(connection);
        } else {
            this.estimateConnectionType();
        }
    }

    calculateSignalStrength(connection) {
        if (!connection) return;

        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink || 0;

        switch (effectiveType) {
            case '4g':
                this.signalStrength = Math.min(4, Math.max(2, Math.floor(downlink / 2)));
                break;
            case '3g':
                this.signalStrength = Math.min(3, Math.max(1, Math.floor(downlink / 1)));
                break;
            case '2g':
                this.signalStrength = Math.min(2, Math.max(1, Math.floor(downlink / 0.5)));
                break;
            case 'slow-2g':
                this.signalStrength = 1;
                break;
            default:
                this.signalStrength = this.isOnline ? 3 : 0;
        }

        if (this.latency > 0) {
            if (this.latency < 50) {
                this.signalStrength = Math.min(4, this.signalStrength + 1);
            } else if (this.latency > 200) {
                this.signalStrength = Math.max(1, this.signalStrength - 1);
            }
        }
    }

    estimateConnectionType() {
        if (!this.isOnline) {
            this.connectionType = 'offline';
            this.signalStrength = 0;
            return;
        }

        if (this.latency < 50) {
            this.connectionType = '4g';
            this.signalStrength = 4;
        } else if (this.latency < 100) {
            this.connectionType = '4g';
            this.signalStrength = 3;
        } else if (this.latency < 200) {
            this.connectionType = '3g';
            this.signalStrength = 2;
        } else {
            this.connectionType = '2g';
            this.signalStrength = 1;
        }
    }

    async performSpeedTest() {
        if (!this.isOnline) {
            this.showNotification('لا يوجد اتصال بالإنترنت', 'error');
            return;
        }

        this.showSpeedTestLoading();

        try {
            await this.testDownloadSpeed();
            
        
            
            this.lastSpeedTest = new Date();
            this.updateConnectionDisplay();
            this.showSpeedTestResults();
            
        } catch (error) {
            console.error('Speed test failed:', error);
            this.showNotification('فشل في اختبار السرعة', 'error');
        } finally {
            this.hideSpeedTestLoading();
        }
    }

    async testDownloadSpeed() {
        const testFile = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';
        const fileSizeBytes = 13504; 
        
        const startTime = Date.now();
        
        try {
            const response = await fetch(testFile + '?t=' + Date.now(), {
                cache: 'no-cache'
            });
            
            if (!response.ok) throw new Error('Network response was not ok');
            
            await response.blob();
            const endTime = Date.now();
            
            const durationSeconds = (endTime - startTime) / 1000;
            const bitsLoaded = fileSizeBytes * 8;
            const speedBps = bitsLoaded / durationSeconds;
            this.downloadSpeed = speedBps / (1024 * 1024); 
            
        } catch (error) {
            console.error('Download speed test failed:', error);
            this.downloadSpeed = 0;
        }
    }

    updateConnectionDisplay() {
        if (!this.connectionCard) return;

      
        this.updateConnectionIcon();
        
        this.updateSignalBars();
        
        this.updateConnectionText();
        
        this.updateCardColor();
    }

    updateConnectionIcon() {
        if (!this.connectionIcon) return;

        if (!this.isOnline) {
            this.connectionIcon.className = 'fas fa-wifi-slash';
        } else {
            switch (this.connectionType) {
                case '4g':
                case '3g':
                case '2g':
                    this.connectionIcon.className = 'fas fa-signal';
                    break;
                default:
                    this.connectionIcon.className = 'fas fa-wifi';
            }
        }
    }

    updateSignalBars() {
        if (!this.signalBars) return;

        const bars = this.signalBars.querySelectorAll('.bar');
        
        bars.forEach((bar, index) => {
            if (index < this.signalStrength) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        });
    }

    updateConnectionText() {
        if (!this.connectionText) return;

        if (!this.isOnline) {
            this.connectionText.textContent = 'غير متصل';
            return;
        }

        let statusText = '';
        
        switch (this.signalStrength) {
            case 4:
                statusText = 'إشارة ممتازة';
                break;
            case 3:
                statusText = 'إشارة قوية';
                break;
            case 2:
                statusText = 'إشارة متوسطة';
                break;
            case 1:
                statusText = 'إشارة ضعيفة';
                break;
            default:
                statusText = 'غير متصل';
        }

        if (this.downloadSpeed > 0) {
            statusText += ` (${this.downloadSpeed.toFixed(1)} Mbps)`;
        }

        this.connectionText.textContent = statusText;
    }

    updateCardColor() {
        if (!this.connectionCard) return;

        this.connectionCard.classList.remove('excellent', 'good', 'fair', 'poor', 'offline');

        if (!this.isOnline) {
            this.connectionCard.classList.add('offline');
        } else {
            switch (this.signalStrength) {
                case 4:
                    this.connectionCard.classList.add('excellent');
                    break;
                case 3:
                    this.connectionCard.classList.add('good');
                    break;
                case 2:
                    this.connectionCard.classList.add('fair');
                    break;
                case 1:
                    this.connectionCard.classList.add('poor');
                    break;
            }
        }
    }

    onConnectionChange(status) {
        console.log(`🌐 Connection status changed: ${status}`);
        
        this.checkConnectionStatus();
        this.detectConnectionType();
        this.updateConnectionDisplay();
        
        if (status === 'online') {
            this.showNotification('تم استعادة الاتصال بالإنترنت', 'success');
        } else {
            this.showNotification('انقطع الاتصال بالإنترنت', 'warning');
        }
    }

    showSpeedTestLoading() {
        if (this.connectionText) {
            this.connectionText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري اختبار السرعة...';
        }
    }

    hideSpeedTestLoading() {
        this.updateConnectionText();
    }

    showSpeedTestResults() {
        const results = {
            download: this.downloadSpeed.toFixed(1),
            latency: this.latency,
            type: this.connectionType
        };

        this.showNotification(
            `سرعة التحميل: ${results.download} Mbps | زمن الاستجابة: ${results.latency}ms`,
            'info'
        );
    }

    startPeriodicChecks() {
        setInterval(() => {
            this.checkConnectionStatus();
            this.detectConnectionType();
            this.updateConnectionDisplay();
        }, 30000);

        setInterval(() => {
            if (this.isOnline && (!this.lastSpeedTest || Date.now() - this.lastSpeedTest > 300000)) {
                this.performSpeedTest();
            }
        }, 300000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `connection-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-wifi"></i>
            <span>${message}</span>
        `;

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: type === 'error' ? '#e74c3c' :
                           type === 'success' ? '#27ae60' :
                           type === 'warning' ? '#f39c12' : '#3498db',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    getConnectionInfo() {
        return {
            isOnline: this.isOnline,
            connectionType: this.connectionType,
            signalStrength: this.signalStrength,
            downloadSpeed: this.downloadSpeed,
            uploadSpeed: this.uploadSpeed,
            latency: this.latency,
            lastSpeedTest: this.lastSpeedTest
        };
    }

    isConnectionSufficientFor(task) {
        if (!this.isOnline) return false;

        switch (task) {
            case 'streaming':
                return this.downloadSpeed >= 5; 
            case 'video_call':
                return this.downloadSpeed >= 2; 
            case 'browsing':
                return this.downloadSpeed >= 1; 
            case 'basic':
                return this.downloadSpeed >= 0.5;
            default:
                return true;
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.connectionManager = new ConnectionManager();
    
    if (typeof window !== 'undefined') {
        window.testConnection = () => {
            window.connectionManager.performSpeedTest();
        };
    }
});
