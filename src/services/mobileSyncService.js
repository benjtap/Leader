import { Capacitor } from '@capacitor/core';

// Helper to determine if we are native
const isNative = Capacitor.isNativePlatform();

export default {
    /**
     * Request Access to Contacts
     * Tries Native Plugin first, then Web API
     */
    async getContacts() {
        if (isNative) {
            return this._getNativeContacts();
        } else {
            return this._getWebContacts();
        }
    },

    /**
     * Request Call Logs (Native Only)
     */
    async getCallLogs() {
        if (!isNative && Capacitor.getPlatform() !== 'android') {
            console.warn("Call Logs are only available on Android Native.");
            return { error: 'not_supported', data: [], msg: 'Not supported on this platform' };
        }
        return this._getNativeCallLogs();
    },

    /**
     * Request Google/Outlook OAuth Token
     * Uses @codetrix-studio/capacitor-google-auth
     */
    async syncGoogleAccount(silent = false) {
        console.log("Initiating Google Account Sync (Silent: " + silent + ")...");

        try {
            // Import dynamically to avoid issues if plugin not present
            const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');

            // Initialize explicitly to prevent configuration issues
            // Using the Web Client ID from config (required for offline access/tokens)
            // Initialize with the correct Client ID matching google-services.json
            await GoogleAuth.initialize({
                clientId: '658997062217-9tmtdj1d5od0co89sd4250tce83mds9m.apps.googleusercontent.com',
                scopes: ['profile', 'email'],
                grantOfflineAccess: true,
            });

            let googleUser;
            try {
                if (silent) {
                    googleUser = await GoogleAuth.refresh();
                } else {
                    googleUser = await GoogleAuth.signIn();
                }
            } catch (authErr) {
                // If silent and failed, just return specific status
                if (silent) {
                    return { error: 'silent_failed', msg: 'Silent login failed (not signed in)', details: authErr };
                }
                throw authErr;
            }

            console.log("Google User from Device:", googleUser);

            if (!googleUser.serverAuthCode) {
                // If refresh() worked but didn't give serverAuthCode, we might need to force signIn?
                // But for now, let's treat it as error if we rely on backend exchange.
                // Note: refresh() might returns accessToken but not always serverAuthCode depending on config.
                // if forceCodeForRefreshToken is true, it should.
                throw new Error("No serverAuthCode received from Google");
            }

            // --- CALL BACKEND TO EXCHANGE CODE FOR TOKEN ---
            console.log("Sending code to LeaderAPI...");
            const { default: api } = await import('./api');

            const response = await api.post('/Auth/google-login', {
                serverAuthCode: googleUser.serverAuthCode,
                email: googleUser.email,
                name: googleUser.name,
                idToken: googleUser.authentication.idToken
            });

            if (response.error || !response.data || !response.data.succes) {
                throw new Error((response.data && response.data.message) || "Login failed on backend");
            }

            const result = response.data; // response.data is the JSON body from axios

            // Return Backend Result (JWT + User Info)
            console.log("Backend Login Success:", result.data);

            // Return Backend Result (JWT + User Info)
            console.log("Backend Login Success:", result.data);

            return {
                error: null,
                data: result.data // Contains { token: "...", utilisateur: { ... } }
            };

        } catch (err) {
            console.error("Google Sync Failed:", err);
            return { error: 'google_auth_failed', msg: err.message || err };
        }
    },

    /**
     * Sign Out from Google
     */
    async signOutGoogle() {
        try {
            const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
            // Initialize to prevent NullPointerException on Android if not previously initialized
            await GoogleAuth.initialize();
            await GoogleAuth.signOut();
            console.log("Signed out from Google Plugin");
        } catch (e) {
            console.warn("Google SignOut Error (ignoring):", e);
        }
    },

    // --- Internal Implementation Methods ---

    async _getNativeContacts() {
        try {
            console.log("Syncing Native Contacts...");
            const { Contacts } = await import('@capacitor-community/contacts');

            // Permission Check
            const perm = await Contacts.requestPermissions();
            if (perm.contacts !== 'granted') {
                return { error: 'denied', msg: 'Permission denied' };
            }

            // Fetch
            const result = await Contacts.getContacts({
                projection: { name: true, phones: true }
            });

            // Normalize
            const normalized = result.contacts.map(c => ({
                name: c.name && c.name.display ? [c.name.display] : [],
                tel: c.phones ? c.phones.map(p => p.number) : []
            }));

            return { error: null, data: normalized };

        } catch (err) {
            console.error("Native Contact Sync Error:", err);
            return { error: 'native_error', msg: err.message };
        }
    },

    async _getWebContacts() {
        // Feature detection
        if (!('contacts' in navigator && 'ContactsManager' in window)) {
            console.warn("Web Contact Picker API not supported. Returning Mock Data.");
            return {
                error: null,
                data: [
                    { name: ['דניאל כהן - דמו'], tel: ['050-1234567'] },
                    { name: ['שרה לוי - דמו'], tel: ['052-7654321'] }
                ]
            };
        }

        try {
            const props = ['name', 'tel'];
            const opts = { multiple: true };
            const contacts = await navigator.contacts.select(props, opts);
            return { error: null, data: contacts };
        } catch (err) {
            console.error("Web Contact Picker Error:", err);
            return { error: 'failed', msg: err.message };
        }
    },

    _getNativeCallLogs() {
        return new Promise((resolve) => {
            const exec = () => {
                if (!window.plugins || !window.plugins.callLog) {
                    resolve({ error: 'plugin_missing', msg: 'CallLog plugin not found', data: [] });
                    return;
                }

                window.plugins.callLog.hasReadPermission(
                    (hasPermission) => {
                        if (!hasPermission) {
                            window.plugins.callLog.requestReadPermission(
                                () => this._fetchLogsInternal(resolve),
                                (err) => resolve({ error: 'denied', msg: 'Permission denied', data: [] })
                            );
                        } else {
                            this._fetchLogsInternal(resolve);
                        }
                    },
                    (err) => resolve({ error: 'check_failed', msg: err, data: [] })
                );
            };

            if (window.plugins && window.plugins.callLog) {
                exec();
            } else {
                document.addEventListener('deviceready', exec, false);
            }
        });
    },

    _fetchLogsInternal(resolve) {
        // Last 7 days
        const filters = [{ name: "date", value: Date.now() - (7 * 24 * 60 * 60 * 1000), operator: ">=" }];

        window.plugins.callLog.getCallLog(
            filters,
            (data) => {
                const mapped = data.map(log => {
                    let type = 'unknown';
                    if (log.type === 1) type = 'incoming';
                    else if (log.type === 2) type = 'outgoing';
                    else if (log.type === 3) type = 'missed';

                    return {
                        id: (log.date || Date.now()) + '-' + (log.number || 'unk'),
                        name: log.cachedName || log.name || log.number || 'Unknown',
                        number: log.number,
                        rawTime: log.date,
                        duration: log.duration,
                        type: type,
                        initial: (log.cachedName || log.name || '#').charAt(0).toUpperCase(),
                        isIcon: false,
                        color: log.type === 3 ? '#ef5350' : '#6200ea' // Red for missed
                    };
                });
                resolve({ error: null, data: mapped });
            },
            (err) => {
                console.error("CallLog Fetch Error:", err);
                resolve({ error: 'fetch_failed', msg: err, data: [] });
            }
        );
    }
};
