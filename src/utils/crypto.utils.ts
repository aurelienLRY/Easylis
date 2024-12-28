import NextCrypto from 'next-crypto';

/**
 * Crypto
 * @description Crypto is a class that encrypts and decrypts data
*  @exemple encryption: const encrypted = await crypto.encrypt('hello!');   
*  @exemple decryption: const decrypted = await crypto.decrypt(encrypted);
*/
export const crypto = new NextCrypto(process.env.ENCRYPTION_KEY as string);





