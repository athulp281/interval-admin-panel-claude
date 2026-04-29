import type { User } from "./types";

interface StoredUser extends User {
  password: string;
}

interface PendingChallenge {
  challengeId: string;
  userId: string;
  code: string;
  expiresAt: number;
  rememberMe: boolean;
}

const users = new Map<string, StoredUser>();
const challenges = new Map<string, PendingChallenge>();

const seed: StoredUser = {
  id: "u_seed_1",
  name: "Demo User",
  email: "demo@interval.com",
  password: "Demo@1234",
  emailVerified: true,
  createdAt: new Date().toISOString(),
};
users.set(seed.email.toLowerCase(), seed);

export const mockDb = {
  findUserByEmail(email: string): StoredUser | undefined {
    return users.get(email.toLowerCase());
  },
  findUserById(id: string): StoredUser | undefined {
    for (const u of users.values()) if (u.id === id) return u;
    return undefined;
  },
  insertUser(user: StoredUser): StoredUser {
    users.set(user.email.toLowerCase(), user);
    return user;
  },
  putChallenge(c: PendingChallenge) {
    challenges.set(c.challengeId, c);
    return c;
  },
  getChallenge(id: string): PendingChallenge | undefined {
    const c = challenges.get(id);
    if (!c) return undefined;
    if (c.expiresAt < Date.now()) {
      challenges.delete(id);
      return undefined;
    }
    return c;
  },
  consumeChallenge(id: string) {
    challenges.delete(id);
  },
};

export function publicUser(u: StoredUser): User {
  const { password: _password, ...rest } = u;
  return rest;
}
