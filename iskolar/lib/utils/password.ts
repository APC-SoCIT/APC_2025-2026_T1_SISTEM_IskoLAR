import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

export async function comparePasswords(plaintext: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hash);
}