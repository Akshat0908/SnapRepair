import { supabase } from './supabase';
import { Issue, Message, User, Payment, Feedback } from './db';

const parseIssue = (issue: any): Issue => {
    if (issue && typeof issue.ai_diagnosis === 'string') {
        try {
            issue.ai_diagnosis = JSON.parse(issue.ai_diagnosis);
        } catch (e) {
            console.error("Failed to parse ai_diagnosis", e);
            issue.ai_diagnosis = undefined;
        }
    }
    return issue as Issue;
};

export const supabaseDB = {
    // User Methods (handled mostly by AuthContext, but helper here)
    async getUserProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) throw error;
        return data;
    },

    async createProfile(user: User) {
        const { data, error } = await supabase
            .from('profiles')
            .insert([{
                id: user.id,
                name: user.name,
                phone: user.phone,
                is_expert: user.email.includes('expert') // Simple logic for now
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Issue Methods
    async createIssue(userId: string, description: string, deviceType: string, mediaUrl: string, mediaType: 'photo' | 'video') {
        const { data, error } = await supabase
            .from('issues')
            .insert([{
                user_id: userId,
                description,
                device_type: deviceType,
                media_url: mediaUrl,
                media_type: mediaType,
                status: 'open'
            }])
            .select()
            .single();
        if (error) throw error;
        return parseIssue(data);
    },

    async getIssues(userId: string) {
        const { data, error } = await supabase
            .from('issues')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data?.map(parseIssue) || [];
    },

    async getAllIssues() {
        const { data, error } = await supabase
            .from('issues')
            .select('*, profiles(name, email, phone)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data?.map(issue => ({ ...parseIssue(issue), profiles: issue.profiles })) || [];
    },

    async getIssue(issueId: string) {
        const { data, error } = await supabase
            .from('issues')
            .select('*')
            .eq('id', issueId)
            .single();
        if (error) throw error;
        return parseIssue(data);
    },

    async updateIssueStatus(issueId: string, status: Issue['status']) {
        const { data, error } = await supabase
            .from('issues')
            .update({ status })
            .eq('id', issueId)
            .select()
            .single();
        if (error) throw error;
        return parseIssue(data);
    },

    async updateAiDiagnosis(issueId: string, diagnosis: any) {
        const { data, error } = await supabase
            .from('issues')
            .update({ ai_diagnosis: JSON.stringify(diagnosis) }) // Store as JSON string if text column, or JSONB if changed
            .eq('id', issueId)
            .select()
            .single();
        if (error) throw error;
        return parseIssue(data);
    },

    // Message Methods
    async getMessages(issueId: string) {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('issue_id', issueId)
            .order('created_at', { ascending: true });
        if (error) throw error;
        return data.map((msg: any) => ({
            ...msg,
            timestamp: msg.created_at
        })) as Message[];
    },

    async addMessage(issueId: string, sender: 'user' | 'expert' | 'system', text: string) {
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                issue_id: issueId,
                sender,
                text
            }])
            .select()
            .single();
        if (error) throw error;
        return {
            ...data,
            timestamp: data.created_at
        } as Message;
    },

    // Payment Methods
    async createPayment(issueId: string, userId: string, amount: number) {
        const { data, error } = await supabase
            .from('payments')
            .insert([{
                issue_id: issueId,
                user_id: userId,
                amount,
                status: 'completed' // Mocking success for now
            }])
            .select()
            .single();

        if (error) throw error;

        // Also update issue status
        await this.updateIssueStatus(issueId, 'consultation_paid');

        return data as Payment;
    },

    // Feedback Methods
    async addFeedback(issueId: string, userId: string, rating: number, comment: string) {
        const { data, error } = await supabase
            .from('feedback')
            .insert([{
                issue_id: issueId,
                user_id: userId,
                rating,
                comment
            }])
            .select()
            .single();
        if (error) throw error;
        return data as Feedback;
    }
};
