export interface IUserPreferences {
    defaultCurrency: string;
    language: string;
    theme: 'light' | 'dark' | 'system';
    timezone: string;
    notifications: {
        push: boolean;
        email: boolean;
        sms: boolean;
        expenseAdded: boolean;
        settlementReminder: boolean;
        monthlyReport: boolean;
    };
    appearance?: {
        themePreset?: string;
        backgroundType: 'color' | 'image';
        backgroundColor: string | null;
        backgroundImage: string | null;
        fontColor?: string | null;
        cardSurfaceStyle?: 'solid' | 'glass' | 'soft' | 'outlined';
        backgroundBlur: number;
        backgroundImagePosition: { x: number; y: number; scale: number };
    };
}

export interface IBankingDetails {
    upiId?: string;
    upiVerified?: boolean;
    bankAccount?: {
        accountNumber: string;
        ifscCode: string;
        bankName: string;
        accountHolderName: string;
    };
    walletDetails?: {
        provider: 'paytm' | 'phonepe' | 'googlepay' | 'amazonpay';
        walletId: string;
    };
}

export interface IUserStats {
    totalGroups: number;
    totalExpenses: number;
    totalSettled: number;
    totalPending: number;
    lastActiveAt: string;
    accountCreatedAt: string;
}

export interface IUser {
    _id: string;
    id?: string;
    firebaseUid?: string;
    email: string;
    displayName: string;
    name?: string;
    photoURL?: string;
    avatar?: string;
    phoneNumber?: string;
    bio?: string;
    role: 'user' | 'premium' | 'business' | 'admin';
    totalOwedAcrossTrips?: number;
    totalPaidAcrossTrips?: number;
    settlementPercentage?: number;
    preferredLanguage?: string;
    defaultCurrency?: string;
    upiId?: string;
    upiVerified?: boolean;
    bankingDetails?: IBankingDetails;
    preferences?: IUserPreferences;
    stats?: IUserStats;
    isEmailVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
