import argon2 from "argon2";

export function hash(password: string): Promise<string> {
    return argon2.hash(password);
}

export function verify(passwordHash: string, password: string): Promise<boolean> {
    return argon2.verify(passwordHash, password);
}
