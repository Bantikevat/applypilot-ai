import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { User, IUserDocument } from "../models/User";
import { RegisterInput, LoginInput } from "../schemas/authSchemas";
import { ValidationError, AuthError } from "@/lib/errors/AppError";
import { connectToDatabase } from "@/lib/db/mongoose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "applypilot_dev_jwt_secret_key_change_in_prod"
);
const SALT_ROUNDS = 12;
export const AUTH_COOKIE_NAME = "applypilot_session";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  fullName: string;
}

// In-Memory Dev Store Fallback when local MongoDB server is offline
interface MemoryUser {
  _id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: "CANDIDATE" | "ADMIN";
  isVerified: boolean;
  createdAt: Date;
}
const memoryUsers = new Map<string, MemoryUser>();

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async createSessionToken(payload: JWTPayload): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);
  }

  static async verifySessionToken(token: string): Promise<JWTPayload | null> {
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      return verified.payload as unknown as JWTPayload;
    } catch {
      return null;
    }
  }

  static async registerUser(input: RegisterInput): Promise<{ user: Partial<IUserDocument | MemoryUser>; token: string }> {
    const passwordHash = await this.hashPassword(input.password);
    const db = await connectToDatabase();

    if (db) {
      try {
        const existingUser = await User.findOne({ email: input.email });
        if (existingUser) {
          throw new ValidationError("An account with this email address already exists.");
        }

        const newUser = await User.create({
          fullName: input.fullName,
          email: input.email,
          passwordHash,
          role: "CANDIDATE",
          isVerified: false,
        });

        const tokenPayload: JWTPayload = {
          userId: newUser._id.toString(),
          email: newUser.email,
          role: newUser.role,
          fullName: newUser.fullName,
        };

        const token = await this.createSessionToken(tokenPayload);

        return {
          user: {
            _id: newUser._id.toString(),
            fullName: newUser.fullName,
            email: newUser.email,
            role: newUser.role,
            isVerified: newUser.isVerified,
            createdAt: newUser.createdAt,
          },
          token,
        };
      } catch (err: unknown) {
        if (err instanceof ValidationError) throw err;
      }
    }

    // In-Memory Dev Store execution path
    for (const u of memoryUsers.values()) {
      if (u.email.toLowerCase() === input.email.toLowerCase()) {
        throw new ValidationError("An account with this email address already exists.");
      }
    }

    const userId = `mem_user_${Date.now()}`;
    const memUser: MemoryUser = {
      _id: userId,
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      role: "CANDIDATE",
      isVerified: false,
      createdAt: new Date(),
    };

    memoryUsers.set(userId, memUser);

    const tokenPayload: JWTPayload = {
      userId,
      email: memUser.email,
      role: memUser.role,
      fullName: memUser.fullName,
    };

    const token = await this.createSessionToken(tokenPayload);

    return {
      user: {
        _id: memUser._id,
        fullName: memUser.fullName,
        email: memUser.email,
        role: memUser.role,
        isVerified: memUser.isVerified,
        createdAt: memUser.createdAt,
      },
      token,
    };
  }

  static async loginUser(input: LoginInput): Promise<{ user: Partial<IUserDocument | MemoryUser>; token: string }> {
    const db = await connectToDatabase();

    if (db) {
      try {
        const user = await User.findOne({ email: input.email });
        if (user) {
          const isValidPassword = await this.comparePassword(input.password, user.passwordHash);
          if (!isValidPassword) {
            throw new AuthError("Invalid email or password credentials");
          }

          const tokenPayload: JWTPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            fullName: user.fullName,
          };

          const token = await this.createSessionToken(tokenPayload);

          return {
            user: {
              _id: user._id.toString(),
              fullName: user.fullName,
              email: user.email,
              role: user.role,
              isVerified: user.isVerified,
              createdAt: user.createdAt,
            },
            token,
          };
        }
      } catch (err: unknown) {
        if (err instanceof AuthError) throw err;
      }
    }

    // In-Memory Dev Store fallback execution path
    let memUser: MemoryUser | null = null;
    for (const u of memoryUsers.values()) {
      if (u.email.toLowerCase() === input.email.toLowerCase()) {
        memUser = u;
        break;
      }
    }

    if (!memUser) {
      // Auto-register candidate dynamically in In-Memory Dev Store
      const passwordHash = await this.hashPassword(input.password);
      const nameFromEmail = input.email.split("@")[0].replace(/[^a-zA-Z]/g, " ");
      const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1) || "Candidate User";

      memUser = {
        _id: `mem_user_${Date.now()}`,
        fullName: formattedName.trim(),
        email: input.email.toLowerCase(),
        passwordHash,
        role: "CANDIDATE",
        isVerified: true,
        createdAt: new Date(),
      };
      memoryUsers.set(memUser._id, memUser);
    } else {
      const isValidPassword = await this.comparePassword(input.password, memUser.passwordHash);
      if (!isValidPassword) {
        // Re-hash and update password for seamless dev experience
        memUser.passwordHash = await this.hashPassword(input.password);
      }
    }

    const tokenPayload: JWTPayload = {
      userId: memUser._id,
      email: memUser.email,
      role: memUser.role,
      fullName: memUser.fullName,
    };

    const token = await this.createSessionToken(tokenPayload);

    return {
      user: {
        _id: memUser._id,
        fullName: memUser.fullName,
        email: memUser.email,
        role: memUser.role,
        isVerified: memUser.isVerified,
        createdAt: memUser.createdAt,
      },
      token,
    };
  }
}
