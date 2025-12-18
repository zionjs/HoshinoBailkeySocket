
Baileys is a WebSockets-based TypeScript/JavaScript library that provides a programmatic interface for the WhatsApp Web API. It offers a lightweight, resource-efficient alternative to browser automation for interacting with WhatsApp's multi-device platform.

---

✨ Key Features

· No Browser Automation: Connects directly via WebSocket, eliminating the need for Selenium or Chrome, which significantly reduces RAM usage.
· Full Multi-Device Support: Compatible with WhatsApp's official multi-device feature, allowing connections alongside the mobile app.
· Complete Feature Coverage: Supports sending and receiving messages, media (images, videos, documents), group management, polls, and more.
· Efficient & Lightweight: Designed to be a low-resource, high-performance solution for Node.js environments.
· TypeScript Native: Written in and fully supports TypeScript for a superior development experience.

---

🚀 Quick Start

Installation

Install the library using npm or yarn:

```bash
npm install @whiskeysockets/baileys
# or
yarn add @whiskeysockets/baileys
```

Basic Connection Example

The following code sets up a connection and logs incoming messages.

```javascript
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';

async function connectToWhatsApp() {
    // Manage authentication state
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    // Create the WhatsApp socket
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // Scan QR with your phone
    });

    // Save session credentials whenever they update
    sock.ev.on('creds.update', saveCreds);

    // Handle connection events
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Reconnecting:', shouldReconnect);
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            console.log('✅ Connected successfully!');
        }
    });

    // Listen for new messages
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];
        if (!message.key.fromMe && message.message) {
            console.log('New message from:', message.key.remoteJid);
            // Example: Reply with a simple text
            await sock.sendMessage(message.key.remoteJid, { text: 'Hello from Baileys!' });
        }
    });
}

connectToWhatsApp();
```

First Run: Execute the script. A QR code will appear in your terminal. Scan it with WhatsApp on your phone (Linked Devices > Link a Device).
Subsequent Runs:The credentials are saved in the auth_info folder, so reconnection will be automatic.

---

📖 Core Concepts

1. Authentication

Baileys authenticates as a linked device to your WhatsApp account. You have two primary methods:

· QR Code: The standard method, where you scan a QR code.
· Pairing Code: An alternative method that uses a numeric code instead of a QR code.

The useMultiFileAuthState helper stores session files locally. For production, you should implement a custom auth state using a database (SQL/NoSQL), using the helper as a reference.

2. Event-Driven Architecture

All interactions are handled through events. Key events include:

· connection.update: Monitors connection status.
· messages.upsert: Fires when a new message arrives or is sent.
· messages.update: For message status updates (e.g., delivered, read).
· groups.update: For changes to group metadata.

3. Sending Messages

The library provides a unified sendMessage function for various message types.

```javascript
// Send a text message
await sock.sendMessage('jid@s.whatsapp.net', { text: 'Hello!' });

// Send an image with a caption
await sock.sendMessage('jid@s.whatsapp.net', {
    image: fs.readFileSync('./path/to/image.jpg'),
    caption: 'Check this out!'
});

// Send to a group
const groupJid = '123456789-123456@g.us'; // Group JID format
await sock.sendMessage(groupJid, { text: 'Hello group!' });
```

---

⚠️ Important Disclaimer & Best Practices

Baileys is an unofficial library. It is not affiliated with, authorized by, or endorsed by WhatsApp LLC or Meta Platforms.

· Terms of Service: Using this library may violate WhatsApp's Terms of Service. Use it at your own discretion and risk.
· Responsible Use: The maintainers strongly discourage and do not condone misuse. Never use it for:
  · Spamming or bulk unsolicited messaging.
  · Stalkerware or invading privacy.
  · Activities that harass users or abuse the platform.
· Account Risk: Misuse can lead to a permanent ban of the linked WhatsApp account.
· For Production: For large-scale, commercial, or business-critical communication, the official WhatsApp Business API is the recommended and only safe path.

Production Considerations

The built-in useMultiFileAuthState is for demonstration. A production system requires a robust, custom auth state manager using a reliable database.

Community & Support

· Official Repository: WhiskeySockets/Baileys on GitHub.
· Documentation: Baileys Wiki.
· License: MIT.

---

📚 Additional Resources

· Migration Guide: For version 7.0.0+ breaking changes, visit the Migration Guide.
· Example Script: The repository contains a comprehensive example.ts file covering most library features.
· Community: Join the Discord community for discussions and support (link available in the GitHub repository).

Use this powerful tool wisely, responsibly, and ethically.