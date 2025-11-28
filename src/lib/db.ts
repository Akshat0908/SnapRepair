// Simple ID generator for MVP
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    created_at: string;
}

export interface Issue {
    id: string;
    user_id: string;
    description: string;
    device_type: string;
    media_url: string;
    ai_diagnosis?: AIDiagnosis;
    status: 'open' | 'pending' | 'expert_reply' | 'payment_needed' | 'consultation_paid' | 'closed' | 'Open' | 'Pending' | 'Expert Replied' | 'Payment Needed' | 'Consultation Paid' | 'Closed'; // Support both for migration
    created_at: string;
}

export interface AIDiagnosis {
    device_type: string;
    likely_causes: string[];
    safety_warning: string;
    troubleshooting_steps: string[];
    recommended_action: string;
    estimated_cost: string;
}

export interface Message {
    id: string;
    issue_id: string;
    sender: 'user' | 'expert' | 'system';
    text: string;
    attachment_url?: string;
    timestamp: string;
}

export interface Payment {
    id: string;
    issue_id: string;
    user_id: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    created_at: string;
}

export interface Feedback {
    id: string;
    issue_id: string;
    rating: number;
    comment: string;
    timestamp: string;
}

const DB_KEYS = {
    USERS: 'snap_repair_users',
    ISSUES: 'snap_repair_issues',
    MESSAGES: 'snap_repair_messages',
    FEEDBACK: 'snap_repair_feedback',
    CURRENT_USER: 'snap_repair_current_user',
};

class MockDB {
    private get<T>(key: string): T[] {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    private set<T>(key: string, data: T[]) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // User Methods
    createUser(name: string, email: string, phone?: string): User {
        const users = this.get<User>(DB_KEYS.USERS);
        const existing = users.find(u => u.email === email);
        if (existing) return existing;

        const newUser: User = {
            id: uuidv4(),
            name,
            email,
            phone,
            created_at: new Date().toISOString(),
        };
        users.push(newUser);
        this.set(DB_KEYS.USERS, users);
        return newUser;
    }

    login(email: string): User | null {
        const users = this.get<User>(DB_KEYS.USERS);
        return users.find(u => u.email === email) || null;
    }

    getCurrentUser(): User | null {
        const data = localStorage.getItem(DB_KEYS.CURRENT_USER);
        return data ? JSON.parse(data) : null;
    }

    setCurrentUser(user: User | null) {
        if (user) {
            localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
        } else {
            localStorage.removeItem(DB_KEYS.CURRENT_USER);
        }
    }

    // Issue Methods
    createIssue(userId: string, description: string, deviceType: string, mediaUrl: string): Issue {
        const issues = this.get<Issue>(DB_KEYS.ISSUES);
        const newIssue: Issue = {
            id: uuidv4(),
            user_id: userId,
            description,
            device_type: deviceType,
            media_url: mediaUrl,
            status: 'Open',
            created_at: new Date().toISOString(),
        };
        issues.push(newIssue);
        this.set(DB_KEYS.ISSUES, issues);
        return newIssue;
    }

    getIssues(userId?: string): Issue[] {
        const issues = this.get<Issue>(DB_KEYS.ISSUES);
        if (userId) {
            return issues.filter(i => i.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        return issues.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    getIssue(issueId: string): Issue | undefined {
        const issues = this.get<Issue>(DB_KEYS.ISSUES);
        return issues.find(i => i.id === issueId);
    }

    updateIssue(issueId: string, updates: Partial<Issue>): Issue | null {
        const issues = this.get<Issue>(DB_KEYS.ISSUES);
        const index = issues.findIndex(i => i.id === issueId);
        if (index === -1) return null;

        issues[index] = { ...issues[index], ...updates };
        this.set(DB_KEYS.ISSUES, issues);
        return issues[index];
    }

    // Message Methods
    addMessage(issueId: string, sender: 'user' | 'expert' | 'system', text: string): Message {
        const messages = this.get<Message>(DB_KEYS.MESSAGES);
        const newMessage: Message = {
            id: uuidv4(),
            issue_id: issueId,
            sender,
            text,
            timestamp: new Date().toISOString(),
        };
        messages.push(newMessage);
        this.set(DB_KEYS.MESSAGES, messages);
        return newMessage;
    }

    getMessages(issueId: string): Message[] {
        const messages = this.get<Message>(DB_KEYS.MESSAGES);
        return messages.filter(m => m.issue_id === issueId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }

    // Feedback Methods
    addFeedback(issueId: string, rating: number, comment: string): Feedback {
        const feedbacks = this.get<Feedback>(DB_KEYS.FEEDBACK);
        const newFeedback: Feedback = {
            id: uuidv4(),
            issue_id: issueId,
            rating,
            comment,
            timestamp: new Date().toISOString(),
        };
        feedbacks.push(newFeedback);
        this.set(DB_KEYS.FEEDBACK, feedbacks);
        return newFeedback;
    }
}

export const db = new MockDB();
