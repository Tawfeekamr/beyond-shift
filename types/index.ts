export interface SessionProps {
    user: {
        id: string;
        name: string;
        email: string;
        image: string;
        isVerified: boolean;
    }
}