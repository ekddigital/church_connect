import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { prisma } from "../config/database";
import {
  User,
  UserRole,
  MembershipLevel,
  AccountStatus,
  Gender,
  MaritalStatus,
} from "../types";

// Helper function to map Prisma user to our User type
const mapPrismaUserToUser = (dbUser: any): User => {
  return {
    id: dbUser.id,
    email: dbUser.email,
    firstName: dbUser.firstName || "",
    lastName: dbUser.lastName || "",
    phone: dbUser.phoneNumber || "",
    role: dbUser.role as UserRole, // Type assertion since values match
    membershipLevel: MembershipLevel.REGULAR, // Default value
    accountStatus: dbUser.isActive
      ? AccountStatus.ACTIVE
      : AccountStatus.INACTIVE,
    profileImage: undefined,
    address: undefined,
    dateOfBirth: undefined,
    gender: Gender.MALE, // Default value
    maritalStatus: MaritalStatus.SINGLE, // Default value
    occupation: undefined,
    employmentStatus: undefined,
    emergencyContact: undefined,
    medicalInformation: undefined,
    specialNeeds: undefined,
    createdAt: dbUser.createdAt,
    updatedAt: dbUser.updatedAt,
  };
};

class AuthService {
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async register(email: string, password: string, userData: Partial<User>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Update Firebase profile
      await updateProfile(firebaseUser, {
        displayName: `${userData.firstName} ${userData.lastName}`,
      });

      // Create user record in database
      const dbUser = await prisma.user.create({
        data: {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          phoneNumber: userData.phone || "",
          role: userData.role || UserRole.MEMBER,
          isActive: true,
        },
      });

      // Map to User interface using helper function
      return mapPrismaUserToUser(dbUser);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async getUserProfile(userId: string): Promise<User> {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!dbUser) {
        throw new Error("User not found");
      }

      // Map to User interface using helper function
      return mapPrismaUserToUser(dbUser);
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(userId: string, userData: Partial<User>): Promise<User> {
    try {
      // Convert phone to phoneNumber for Prisma
      const prismaData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phone,
        role: userData.role,
      };

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: prismaData,
      });

      return mapPrismaUserToUser(updatedUser);
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
      });

      return users.map(mapPrismaUserToUser);
    } catch (error) {
      throw error;
    }
  }

  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
      });

      return mapPrismaUserToUser(updatedUser);
    } catch (error) {
      throw error;
    }
  }

  async deactivateUser(userId: string): Promise<User> {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      return mapPrismaUserToUser(updatedUser);
    } catch (error) {
      throw error;
    }
  }

  private handleAuthError(error: any): Error {
    let message = "An error occurred during authentication";

    if (error.code) {
      switch (error.code) {
        case "auth/user-not-found":
          message = "No user found with this email address";
          break;
        case "auth/wrong-password":
          message = "Incorrect password";
          break;
        case "auth/email-already-in-use":
          message = "Email address is already in use";
          break;
        case "auth/weak-password":
          message = "Password is too weak";
          break;
        case "auth/invalid-email":
          message = "Invalid email address";
          break;
        case "auth/user-disabled":
          message = "User account has been disabled";
          break;
        case "auth/too-many-requests":
          message = "Too many failed attempts. Please try again later";
          break;
        default:
          message = error.message || message;
      }
    }

    return new Error(message);
  }
}

export const authService = new AuthService();
