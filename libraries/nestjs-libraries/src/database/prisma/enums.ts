export enum OrderStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    CANCELED = 'CANCELED',
    COMPLETED = 'COMPLETED',
}

export enum From {
    BUYER = 'BUYER',
    SELLER = 'SELLER',
}

export enum State {
    QUEUE = 'QUEUE',
    PUBLISHED = 'PUBLISHED',
    ERROR = 'ERROR',
    DRAFT = 'DRAFT',
}

export enum SubscriptionTier {
    STANDARD = 'STANDARD',
    PRO = 'PRO',
    TEAM = 'TEAM',
    ULTIMATE = 'ULTIMATE',
}

export enum Period {
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
}

export enum Provider {
    LOCAL = 'LOCAL',
    GITHUB = 'GITHUB',
    GOOGLE = 'GOOGLE',
    FARCASTER = 'FARCASTER',
    WALLET = 'WALLET',
    GENERIC = 'GENERIC',
}

export enum Role {
    SUPERADMIN = 'SUPERADMIN',
    ADMIN = 'ADMIN',
    USER = 'USER',
}

export enum APPROVED_SUBMIT_FOR_ORDER {
    NO = 'NO',
    WAITING_CONFIRMATION = 'WAITING_CONFIRMATION',
    YES = 'YES',
}
