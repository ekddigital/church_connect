// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  membershipLevel: MembershipLevel;
  accountStatus: AccountStatus;
  profileImage?: string;
  address?: string;
  dateOfBirth?: Date;
  gender: Gender;
  maritalStatus: MaritalStatus;
  occupation?: string;
  employmentStatus?: EmploymentStatus;
  emergencyContact?: EmergencyContact;
  medicalInformation?: string;
  specialNeeds?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
  OTHER = "Other",
}

export enum MembershipLevel {
  VISITOR = "Visitor",
  NEW_MEMBER = "New Member",
  REGULAR = "Regular Member",
  LEADER = "Leader",
  ELDER = "Elder",
  PASTOR = "Pastor",
}

export enum AccountStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  SUSPENDED = "Suspended",
  PENDING = "Pending",
}

export enum EmploymentStatus {
  EMPLOYED = "Employed",
  UNEMPLOYED = "Unemployed",
  SELF_EMPLOYED = "Self-Employed",
  STUDENT = "Student",
  RETIRED = "Retired",
}

export enum UserRole {
  ADMIN = "ADMIN",
  WELFARE_OFFICER = "WELFARE_OFFICER",
  PASTOR = "PASTOR",
  ELDER = "ELDER",
  DEACON = "DEACON",
  MEMBER = "MEMBER",
}

// Member Profiling Types
export interface MemberProfiling {
  id: string;
  userId: string;
  dateOfBirth?: Date;
  address?: string;
  occupation?: string;
  maritalStatus?: MaritalStatus;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  dateJoined?: Date;
  previousChurch?: string;
  ministryInvolvement?: string;
  spiritualGifts?: string;
  spouseName?: string;
  children?: ChildInfo[];
  skills?: string;
  interests?: string;
  hobbies?: string;
  monthlyIncome?: number;
  dependents?: number;
  specialNeeds?: string;
  healthConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChildInfo {
  name: string;
  age: number;
  gender: string;
}

export enum MaritalStatus {
  SINGLE = "SINGLE",
  MARRIED = "MARRIED",
  DIVORCED = "DIVORCED",
  WIDOWED = "WIDOWED",
  SEPARATED = "SEPARATED",
}

// Welfare Request Types
export interface WelfareRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: WelfareCategory;
  urgencyLevel: UrgencyLevel;
  requestType: RequestType;
  amountRequested?: number;
  currentSituation?: string;
  expectedOutcome?: string;
  status: RequestStatus;
  priority: number;
  reviewedBy?: string;
  reviewedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  fulfilledBy?: string;
  fulfilledAt?: Date;
  actualAmount?: number;
  fulfillmentNotes?: string;
  documents?: string[];
  followUpRequired: boolean;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum WelfareCategory {
  FINANCIAL_ASSISTANCE = "FINANCIAL_ASSISTANCE",
  MEDICAL_SUPPORT = "MEDICAL_SUPPORT",
  EDUCATION_SUPPORT = "EDUCATION_SUPPORT",
  HOUSING_ASSISTANCE = "HOUSING_ASSISTANCE",
  FOOD_ASSISTANCE = "FOOD_ASSISTANCE",
  EMPLOYMENT_SUPPORT = "EMPLOYMENT_SUPPORT",
  COUNSELING = "COUNSELING",
  EMERGENCY_RELIEF = "EMERGENCY_RELIEF",
  OTHER = "OTHER",
}

export enum UrgencyLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum RequestType {
  ONE_TIME = "ONE_TIME",
  RECURRING = "RECURRING",
  EMERGENCY = "EMERGENCY",
}

export enum RequestStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// Message Types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject?: string;
  content: string;
  messageType: MessageType;
  isRead: boolean;
  priority: MessagePriority;
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
}

export enum MessageType {
  PERSONAL = "PERSONAL",
  ANNOUNCEMENT = "ANNOUNCEMENT",
  WELFARE_UPDATE = "WELFARE_UPDATE",
  SYSTEM_NOTIFICATION = "SYSTEM_NOTIFICATION",
}

export enum MessagePriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

// File Upload Types
export interface FileUpload {
  id: string;
  userId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  fileType: FileType;
  messageId?: string;
  isPublic: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum FileType {
  DOCUMENT = "DOCUMENT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  OTHER = "OTHER",
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  MainTabs: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Profile: undefined;
  EditProfile: undefined;
  MemberProfiling: { userId?: string; isEditMode?: boolean };
  WelfareRequest: { requestId?: string };
  CreateWelfareRequest: undefined;
  Messages: undefined;
  MessageDetail: { messageId: string };
  ComposeMessage: { recipientId?: string };
  Dashboard: undefined;
  Reports: undefined;
  Settings: undefined;
  FileUpload: { maxFiles?: number; allowedTypes?: string[]; purpose?: string };
  UserManagement: undefined;
};

export type BottomTabParamList = {
  Dashboard: undefined;
  Welfare: undefined;
  Messages: undefined;
  Profile: undefined;
  Reports: undefined;
};

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface WelfareRequestForm {
  title: string;
  description: string;
  category: WelfareCategory;
  urgencyLevel: UrgencyLevel;
  requestType: RequestType;
  amountRequested?: number;
  currentSituation?: string;
  expectedOutcome?: string;
}

export interface MessageForm {
  receiverId: string;
  subject?: string;
  content: string;
  priority: MessagePriority;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  data: number[];
  color?: (opacity: number) => string;
  strokeWidth?: number;
}

// Dashboard Statistics
export interface DashboardStats {
  totalMembers: number;
  pendingRequests: number;
  approvedRequests: number;
  totalAmountDisbursed: number;
  monthlyRequests: number;
  unreadMessages: number;
}

// Filter and Search Types
export interface WelfareRequestFilters {
  status?: RequestStatus[];
  category?: WelfareCategory[];
  urgencyLevel?: UrgencyLevel[];
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: number;
  amountMax?: number;
}

export interface UserFilters {
  role?: UserRole[];
  isActive?: boolean;
  dateJoinedFrom?: Date;
  dateJoinedTo?: Date;
}
