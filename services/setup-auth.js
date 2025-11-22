import { GmailEmailService } from './emailService.js';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function setupAuthentication() {
    try {
        console.log('=== CONFIGURACIÓN AUTOMÁTICA DE GMAIL API ===\n');
        
        const emailService = new GmailEmailService();
        await emailService.init();
        
        if (!(await emailService.needsAuthorization())) {
            console.log('Ya estás autenticado. No es necesario hacer nada más.');
            process.exit(0);
        }
        
        console.log('Necesitas autorizar la aplicación por primera vez.');
        console.log('Este proceso solo se hace UNA VEZ.\n');
        
        const authUrl = emailService.generateAuthUrl();
        console.log('1. Abre esta URL en tu navegador:');
        console.log(`\n${authUrl}\n`);
        
        console.log('2. Autoriza la aplicación con tu cuenta Gmail');
        console.log('3. Copia el código que aparece en la URL después de autorizar\n');
        
        const code = await new Promise(resolve => {
            rl.question('Pega el código aquí: ', resolve);
        });
        
        console.log('\nProcesando autorización...');
        await emailService.authorize(code.trim());
        
        console.log('Autorización completada!');
        console.log('Ahora el envío de emails será automático.');
        
        console.log('\n¿Quieres enviar un email de prueba? (s/n):');
        const testEmail = await new Promise(resolve => {
            rl.question('', resolve);
        });
        
        if (testEmail.toLowerCase() === 's') {
            console.log('\nEnviando email de prueba...');
            const result = await emailService.sendTestEmail();
            
            if (result.success) {
                console.log('Email de prueba enviado correctamente!');
            } else {
                console.log('Error enviando email:', result.error);
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

setupAuthentication();