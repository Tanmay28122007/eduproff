// src/utils/adminStorage.ts

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface Certificate {
    id: string;
    candidateId: string;
    candidateName: string;
    title: string;
    issuer: string;
    fileUrl: string;
    status: string;
    uploadedAt: string;
}

const USERS_KEY = 'users';
const CERTIFICATES_KEY = 'certificates';

export function upsertUser(user: User) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
        users[index] = user;
    } else {
        users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function upsertCertificate(certificate: Certificate) {
    const certificates = getCertificates();
    const index = certificates.findIndex(c => c.id === certificate.id);
    if (index >= 0) {
        certificates[index] = certificate;
    } else {
        certificates.push(certificate);
    }
    localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(certificates));
}

export function getUsers(): User[] {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
}

export function getCertificates(): Certificate[] {
    const certificates = localStorage.getItem(CERTIFICATES_KEY);
    return certificates ? JSON.parse(certificates) : [];
}

export function getActivityLogs(): any[] {
    // Placeholder for activity logs, can be implemented as needed
    return [];
}

export default { upsertUser, upsertCertificate, getUsers, getCertificates, getActivityLogs };