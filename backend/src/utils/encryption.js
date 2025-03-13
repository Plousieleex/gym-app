const crypto = require('crypto');
const algorithm = 'aes-256-ctr';

const secretKey = crypto
  .createHash('sha256')
  .update(
    process.env.ENCRYPTION_KEY ||
      'ilM9CETJBg8buztqhEB7urrVOv8xVpLz+KMykms/r+A7D8nMI2tpnj8yuFV0G31H',
  )
  .digest();

const encrypt = (text) => {
  try {
    if (!text) return { iv: '', content: '' };

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf-8'),
      cipher.final(),
    ]);

    return {
      iv: iv.toString('hex'),
      content: encrypted.toString('hex'),
    };
  } catch (error) {
    console.error('encryption error', error);
    return { iv: '', content: '' };
  }
};

const decrypt = (hash) => {
  try {
    if (!hash || !hash.iv || !hash.content) return '';

    const decipher = crypto.createDecipheriv(
      algorithm,
      secretKey,
      Buffer.from(hash.iv, 'hex'),
    );

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(hash.content, 'hex')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

module.exports = {
  encrypt,
  decrypt,
};
