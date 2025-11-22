import { google } from 'googleapis';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

export class GmailEmailService {
    #credentials = null;
    #oauth2Client = null;
    #credentialsPath = join(__dirname, 'client_secret.json');
    #tokenPath = join(__dirname, 'token.json');
    
    constructor() {
        this.init().catch(error => {
            console.warn('Inicialización parcial:', error.message);
        });
    }
    
    async init() {
        try {
            await this.loadCredentials();
            await this.loadTokens();
        } catch (error) {
            throw error;
        }
    }
    
    async loadCredentials() {
        try {
            const content = await fs.readFile(this.#credentialsPath, 'utf8');
            this.#credentials = JSON.parse(content);
            
            const { client_secret, client_id, redirect_uris } = this.#credentials.installed;
            
            this.#oauth2Client = new google.auth.OAuth2(
                client_id,
                client_secret,
                redirect_uris[0]
            );
            
            console.log('Credenciales OAuth2 cargadas');
            return true;
        } catch (error) {
            console.error('Error cargando credenciales:', error.message);
            throw new Error(`No se pudieron cargar las credenciales: ${error.message}`);
        }
    }
    
    generateAuthUrl() {
        if (!this.#oauth2Client) {
            throw new Error('OAuth2 client no inicializado');
        }
        
        const scopes = [
            'https://www.googleapis.com/auth/gmail.send'
        ];
        
        return this.#oauth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: scopes
        });
    }
    
    async authorize(code) {
        if (!code?.trim()) {
            throw new Error('Código de autorización requerido');
        }
        
        try {
            const { tokens } = await this.#oauth2Client.getToken(code);
            
            if (!tokens.refresh_token) {
                throw new Error('No se obtuvo refresh token. Revoca permisos previos y reintenta.');
            }
            
            await fs.writeFile(this.#tokenPath, JSON.stringify(tokens, null, 2));
            this.#oauth2Client.setCredentials(tokens);
            
            console.log('Autorización completada');
            return tokens;
        } catch (error) {
            throw new Error(`Error en autorización: ${error.message}`);
        }
    }
    
    async loadTokens() {
        try {
            const tokenData = await fs.readFile(this.#tokenPath, 'utf8');
            const tokens = JSON.parse(tokenData);
            
            if (!tokens.refresh_token) {
                throw new Error('No hay refresh token');
            }
            
            this.#oauth2Client.setCredentials(tokens);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    async needsAuthorization() {
        if (!this.#oauth2Client) {
            try {
                await this.loadCredentials();
            } catch (error) {
                return true;
            }
        }
        
        const tokensLoaded = await this.loadTokens();
        if (!tokensLoaded) return true;
        
        try {
            await this.#oauth2Client.getAccessToken();
            return false;
        } catch (error) {
            return true;
        }
    }
    
    async sendEmail(mailOptions) {
        this.validateEmailOptions(mailOptions);
        await this.ensureAuthorized();
        
        try {
            const gmail = google.gmail({ version: 'v1', auth: this.#oauth2Client });
            const encodedMessage = this.buildEncodedMessage(mailOptions);
            
            const result = await gmail.users.messages.send({
                userId: 'me',
                requestBody: { raw: encodedMessage }
            });
            
            console.log('Correo enviado:', result.data.id);
            return {
                success: true,
                messageId: result.data.id,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error enviando correo:', error.message);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    validateEmailOptions(mailOptions) {
        if (!mailOptions.to || !mailOptions.subject) {
            throw new Error('Faltan campos requeridos: to, subject');
        }
        if (!mailOptions.text && !mailOptions.html) {
            throw new Error('Debe proporcionar contenido en text o html');
        }
    }
    
    async ensureAuthorized() {
        if (await this.needsAuthorization()) {
            throw new Error('Necesita autorización OAuth2');
        }
    }
    
    buildEncodedMessage(mailOptions) {
        const senderName = process.env.SENDER_NAME || 'Gmail API';
        const fromAddress = `${senderName} <${process.env.GMAIL_USER}>`;
        
        const message = [
            `From: ${fromAddress}`,
            `To: ${mailOptions.to}`,
            `Subject: ${mailOptions.subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=utf-8',
            '',
            mailOptions.html || mailOptions.text
        ].join('\r\n');
        
        return Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
    
    async sendTestEmail() {
        const testOptions = {
            to: process.env.GMAIL_USER,
            subject: 'Prueba Gmail OAuth2 API',
            html: `
                <h2>Gmail OAuth2 API Funcionando</h2>
                <p>Este es un correo de prueba enviado exitosamente.</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Usuario:</strong> ${process.env.GMAIL_USER}</p>
            `
        };
        
        return await this.sendEmail(testOptions);
    }
    
    async getStatus() {
        const status = {
            initialized: !!this.#oauth2Client,
            authorized: false,
            user: process.env.GMAIL_USER || 'No configurado'
        };
        
        if (this.#oauth2Client) {
            status.authorized = !(await this.needsAuthorization());
        }
        
        return status;
    }
    
    async revokeAccess() {
        try {
            if (this.#oauth2Client?.credentials?.access_token) {
                await this.#oauth2Client.revokeCredentials();
            }
            
            await fs.unlink(this.#tokenPath).catch(() => {});
            this.#oauth2Client?.setCredentials({});
            
            console.log('Acceso revocado');
        } catch (error) {
            console.error('Error revocando acceso:', error);
            throw error;
        }
    }
}