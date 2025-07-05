

class DashboardSettings {
    constructor() {
        this.config = this.getDefaultConfig();
        this.loadConfig();
    }


    getDefaultConfig() {
        return {
            vehicle: {
                model: "JCB Excavator",
                edition: "2025 Release Edition",
                status: "operational",
                serialNumber: "JCB2025-XX-123456",
                operatingHours: 1234,
                lastService: "2024/01/15"
            },
            weather: {
                apiKey: "c7377c7305e6798286b1883817b0075e",
                defaultCity: "Cairo",
                units: "metric"
            },
            audio: {
                defaultVolume: 80,
                autoPlay: false
            },


            maintenance: {
                nextService: "2024/06/15",
                oilChange: "2024/03/01",
                filterChange: "2024/02/15"
            },
            features: {
                speedometer: true,
                weather: true,
                music: true,

            }
        };
    }

    loadConfig() {
        try {
            const savedConfig = localStorage.getItem('dashboardConfig');
            if (savedConfig) {
                this.config = { ...this.config, ...JSON.parse(savedConfig) };
            }
            this.applySettings();
        } catch (error) {
            this.applySettings();
        }
    }

    saveConfig() {
        try {
            localStorage.setItem('dashboardConfig', JSON.stringify(this.config));
            return true;
        } catch (error) {
            return false;
        }
    }

    applySettings() {
        this.updateVehicleInfo();
        this.updateWeatherConfig();
        this.updateAudioSettings();
        this.updateMapSettings();
    }

    updateVehicleInfo() {
        if (!this.config?.vehicle) return;

        const carModelElement = document.querySelector('.car-model h3');
        const carEditionElement = document.querySelector('.car-model p');

        if (carModelElement) {
            carModelElement.textContent = this.config.vehicle.model;
        }
        if (carEditionElement) {
            carEditionElement.textContent = this.config.vehicle.edition;
        }

        this.updateSettingsPageInfo();
    }

    updateSettingsPageInfo() {
        const infoElements = {
            'Model': this.config.vehicle.model,
            'Serial Number': this.config.vehicle.serialNumber,
            'Operating Hours': `${this.config.vehicle.operatingHours} hrs`,
            'Last Service': this.config.vehicle.lastService
        };

        Object.entries(infoElements).forEach(([label, value]) => {
            const elements = document.querySelectorAll('.info-item');
            elements.forEach(element => {
                const labelElement = element.querySelector('.info-label');
                const valueElement = element.querySelector('.info-value');
                if (labelElement && labelElement.textContent === label && valueElement) {
                    valueElement.textContent = value;
                }
            });
        });
    }

    updateWeatherConfig() {
        if (!this.config?.weather) return;

        window.weatherConfig = {
            apiKey: this.config.weather.apiKey,
            defaultCity: this.config.weather.defaultCity,
            units: this.config.weather.units
        };
    }

    updateAudioSettings() {
        if (!this.config?.audio) return;

        const audioPlayer = document.querySelector('audio');
        const volumeSlider = document.querySelector('.volume-slider');

        if (audioPlayer) {
            audioPlayer.volume = this.config.audio.defaultVolume / 100;
        }

        if (volumeSlider) {
            volumeSlider.value = this.config.audio.defaultVolume;
        }
    }



    getVehicleStatus() {
        return this.config?.vehicle?.status || 'unknown';
    }

    getMaintenanceInfo() {
        return this.config?.maintenance || {};
    }

    getFeatures() {
        return this.config?.features || {};
    }

    getNotificationSettings() {
        return this.config?.notifications || this.getDefaultConfig().notifications;
    }

    applySettings() {
        this.updateAudioSettings();

        this.updateMapSettings();



        document.dispatchEvent(new CustomEvent('settingsUpdated', {
            detail: this.config
        }));
    }



    async updateSettings(section, data) {
        try {
            if (!this.config[section]) {
                this.config[section] = {};
            }

            this.config[section] = { ...this.config[section], ...data };
            this.applySettings();
            this.saveConfig();

            if (window.showNotification) {
                window.showNotification('Settings updated successfully', 'success');
            }

            return true;
        } catch (error) {

            if (window.showNotification) {
                window.showNotification('Failed to update settings', 'error');
            }

            return false;
        }
    }

    resetToDefaults() {
        this.config = this.getDefaultConfig();
        this.applySettings();
        this.saveConfig();

        if (window.showNotification) {
            window.showNotification('Settings reset to defaults', 'info');
        }
    }

    exportSettings() {
        const dataStr = JSON.stringify(this.config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'dashboard-settings.json';
        link.click();

        if (window.showNotification) {
            window.showNotification('Settings exported successfully', 'success');
        }
    }

    importSettings(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedConfig = JSON.parse(e.target.result);
                this.config = { ...this.getDefaultConfig(), ...importedConfig };
                this.applySettings();
                this.saveConfig();

                if (window.showNotification) {
                    window.showNotification('Settings imported successfully', 'success');
                }
            } catch (error) {
                console.error('Error importing settings:', error);
                if (window.showNotification) {
                    window.showNotification('Failed to import settings', 'error');
                }
            }
        };
        reader.readAsText(file);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.dashboardSettings = new DashboardSettings();

    setupSettingsEventListeners();
});

function setupSettingsEventListeners() {
    const resetBtn = document.getElementById('reset-settings-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings to defaults?')) {
                window.dashboardSettings.resetToDefaults();
            }
        });
    }

    const exportBtn = document.getElementById('export-settings-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            window.dashboardSettings.exportSettings();
        });
    }

    const importBtn = document.getElementById('import-settings-btn');
    const importFile = document.getElementById('import-settings-file');

    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => {
            importFile.click();
        });

        importFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                window.dashboardSettings.importSettings(file);
            }
        });
    }
}

