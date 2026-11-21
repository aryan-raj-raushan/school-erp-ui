import { APP } from './app.constants';

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDocument {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

export const LEGAL_CONTACT_EMAIL = 'support@myesathi.com';

export const LEGAL_LINKS = {
  privacyPolicy: 'Privacy Policy',
  termsAndConditions: 'Terms & Conditions',
  backToLogin: 'Back to sign in',
} as const;

export const PRIVACY_POLICY: LegalDocument = {
  title: 'Privacy Policy',
  lastUpdated: 'November 21, 2026',
  intro: `This Privacy Policy explains how ${APP.name} ("we", "us", "our") collects, uses, stores and protects information when schools, staff, parents and students use the ${APP.name} web and mobile applications (the "Service"). By using the Service you agree to the practices described here.`,
  sections: [
    {
      heading: '1. Who we are',
      paragraphs: [
        `${APP.name} is a school management platform that schools use to manage admissions, academics, attendance, examinations, fees, staff and communication with parents. Schools that subscribe to the Service act as the data controller for the records of their students, parents and staff; ${APP.name} processes that data on their behalf.`,
      ],
    },
    {
      heading: '2. Information we collect',
      bullets: [
        'Account information: name, email address, phone number, role and password (stored only in hashed form).',
        'Sign-in with Google or Microsoft: if you choose this option, we receive your verified email address from that provider through our authentication partner and use it only to match you to the account your school has created. We do not receive your Google or Microsoft password.',
        'Student records: name, date of birth, gender, class and section, roll number, admission details, guardian details, photographs and documents uploaded by the school.',
        'Staff records: name, contact details, designation, employment details, shifts, leave and attendance.',
        'Academic data: subjects, timetables, syllabus, exam schedules, marks and results.',
        'Attendance data: daily attendance, gate passes and RFID card scans where the school uses RFID hardware.',
        'Financial data: fee structures, invoices, payment records and receipts. We do not store full card or bank account numbers.',
        'Device and usage data: device type, operating system, app version, IP address and logs needed to keep the Service secure and working.',
      ],
    },
    {
      heading: '3. How we use information',
      bullets: [
        'To provide the Service, including managing student, staff, attendance, exam and fee records.',
        'To authenticate users and keep accounts secure.',
        'To send notifications to parents and staff, such as attendance alerts, results and fee reminders, as configured by the school.',
        'To provide customer support and respond to requests.',
        'To monitor, troubleshoot and improve the reliability and performance of the Service.',
        'To comply with legal obligations.',
      ],
      paragraphs: [
        'We do not sell personal information, and we do not use student data for advertising.',
      ],
    },
    {
      heading: '4. Camera, photos and files',
      paragraphs: [
        'The mobile app may request access to your camera, photo library or files only when you choose to upload a profile photo or a document. These files are uploaded to your school’s account and are not accessed for any other purpose.',
      ],
    },
    {
      heading: '5. Sharing of information',
      paragraphs: [
        'Information is shared only with the school that owns the account and with users that school authorises (for example, teachers, administrators and the parents of a given student). We may share information with trusted service providers that host or operate the Service on our behalf, under confidentiality obligations, or where required by law.',
      ],
    },
    {
      heading: '6. Data security',
      paragraphs: [
        'We use industry-standard safeguards including encrypted connections (HTTPS), hashed passwords, role-based access control, per-school data isolation and audit logging. No method of transmission or storage is completely secure, but we work to protect your information.',
      ],
    },
    {
      heading: '7. Data retention',
      paragraphs: [
        'We keep information for as long as the school maintains an active account or as needed to provide the Service. When a school closes its account, or requests deletion, we delete or anonymise its data within a reasonable period unless we are required by law to keep it.',
      ],
    },
    {
      heading: '8. Children’s privacy',
      paragraphs: [
        'Student information is provided by schools and parents for educational administration. Students do not create accounts directly. Parents may contact their school or us to review or correct information about their child.',
      ],
    },
    {
      heading: '9. Your rights',
      paragraphs: [
        'Depending on applicable law, you may have the right to access, correct or delete your personal information, or to object to certain processing. Most requests should be made to your school; you can also contact us and we will help.',
      ],
    },
    {
      heading: '10. Account deletion',
      paragraphs: [
        `To request deletion of your account and associated data, ask your school administrator or email us at ${LEGAL_CONTACT_EMAIL} from your registered email address.`,
      ],
    },
    {
      heading: '11. Changes to this policy',
      paragraphs: [
        'We may update this Privacy Policy from time to time. The "Last updated" date at the top shows when it was last revised. Continued use of the Service after changes means you accept the updated policy.',
      ],
    },
    {
      heading: '12. Contact us',
      paragraphs: [
        `If you have any questions about this Privacy Policy, contact us at ${LEGAL_CONTACT_EMAIL}.`,
      ],
    },
  ],
};

export const TERMS_AND_CONDITIONS: LegalDocument = {
  title: 'Terms & Conditions',
  lastUpdated: 'November 21, 2026',
  intro: `These Terms & Conditions ("Terms") govern your access to and use of the ${APP.name} web and mobile applications (the "Service"). By creating an account, signing in or otherwise using the Service, you agree to these Terms. If you do not agree, do not use the Service.`,
  sections: [
    {
      heading: '1. The Service',
      paragraphs: [
        `${APP.name} is a school management platform that helps schools manage admissions, academics, attendance, examinations, fees, staff and communication with parents. Features available to you depend on your school's subscription plan and the role your school has assigned to you.`,
      ],
    },
    {
      heading: '2. Who can use the Service',
      bullets: [
        'Schools and their authorised administrators, teachers and staff.',
        'Parents and guardians who have been given access by their school.',
        'You must be at least 18 years old, or the age of majority where you live, to create or manage a school or staff account.',
        'Students do not create accounts directly; their records are managed by the school.',
      ],
    },
    {
      heading: '3. Accounts and security',
      bullets: [
        'You must provide accurate information and keep it up to date.',
        'You are responsible for keeping your password confidential and for all activity under your account.',
        'If you sign in with Google or Microsoft, you are also responsible for the security of that account.',
        `Tell your school administrator or contact us at ${LEGAL_CONTACT_EMAIL} immediately if you suspect unauthorised access.`,
        'We may suspend an account that we reasonably believe has been compromised or misused.',
      ],
    },
    {
      heading: '4. School responsibilities',
      paragraphs: [
        'A school that registers for the Service is responsible for the data it enters, for obtaining any consents required from parents, guardians and staff, for deciding who in the school can access which records, and for using the Service in line with applicable education and data protection laws.',
      ],
    },
    {
      heading: '5. Acceptable use',
      paragraphs: ['You agree not to:'],
      bullets: [
        'Access records you are not authorised to view, or share your login with others.',
        'Upload content that is unlawful, harmful, defamatory, obscene or that infringes the rights of others.',
        'Attempt to probe, scan, disrupt or overload the Service, or bypass any security or access control.',
        'Copy, reverse engineer, resell or build a competing product from the Service.',
        'Use the Service to send spam or unsolicited messages.',
      ],
    },
    {
      heading: '6. Fees and payments',
      paragraphs: [
        'Schools pay subscription fees according to the plan they choose. Fees are billed in advance and are non-refundable except where required by law or stated in a separate agreement. Payments collected by schools from parents through the Service are processed by third-party payment gateways, and the school remains responsible for its own fee policies, refunds and receipts.',
      ],
    },
    {
      heading: '7. Your data',
      paragraphs: [
        `Schools retain ownership of the data they enter into the Service. ${APP.name} processes that data only to provide and improve the Service, as described in our Privacy Policy. A school may export its data while its account is active.`,
      ],
    },
    {
      heading: '8. Intellectual property',
      paragraphs: [
        `The Service, including its software, design, logos and content (other than data entered by users), is owned by ${APP.name} and protected by intellectual property laws. We grant you a limited, non-exclusive, non-transferable right to use the Service for your school's internal purposes during your subscription.`,
      ],
    },
    {
      heading: '9. Third-party services',
      paragraphs: [
        'The Service may rely on third-party services such as payment gateways, messaging providers and sign-in providers (for example Google and Microsoft). Your use of those services is also subject to their own terms, and we are not responsible for their availability or conduct.',
      ],
    },
    {
      heading: '10. Availability and changes',
      paragraphs: [
        'We aim to keep the Service available at all times but do not guarantee uninterrupted or error-free operation. We may carry out maintenance, and we may add, change or remove features. Where a change materially reduces the Service, we will try to give schools reasonable notice.',
      ],
    },
    {
      heading: '11. Suspension and termination',
      paragraphs: [
        'A school may stop using the Service at any time. We may suspend or terminate access if these Terms are breached, if fees remain unpaid, or if required by law. After termination, school data is retained or deleted as described in our Privacy Policy.',
      ],
    },
    {
      heading: '12. Disclaimers',
      paragraphs: [
        'The Service is provided "as is" and "as available". To the fullest extent permitted by law, we disclaim all implied warranties, including fitness for a particular purpose. Schools remain responsible for verifying the accuracy of records, results, fee calculations and reports produced through the Service.',
      ],
    },
    {
      heading: '13. Limitation of liability',
      paragraphs: [
        `To the fullest extent permitted by law, ${APP.name} will not be liable for any indirect, incidental, special or consequential damages, or for loss of data, profits or goodwill. Our total liability for any claim relating to the Service is limited to the fees paid by the school for the Service in the twelve months before the claim.`,
      ],
    },
    {
      heading: '14. Indemnity',
      paragraphs: [
        `You agree to indemnify ${APP.name} against claims arising from your misuse of the Service, your breach of these Terms, or content you upload that infringes the rights of others.`,
      ],
    },
    {
      heading: '15. Governing law',
      paragraphs: [
        'These Terms are governed by the laws of India. Any dispute will be subject to the exclusive jurisdiction of the competent courts in India.',
      ],
    },
    {
      heading: '16. Changes to these Terms',
      paragraphs: [
        'We may update these Terms from time to time. The "Last updated" date at the top shows when they were last revised. Continued use of the Service after changes means you accept the updated Terms.',
      ],
    },
    {
      heading: '17. Contact us',
      paragraphs: [
        `If you have any questions about these Terms, contact us at ${LEGAL_CONTACT_EMAIL}.`,
      ],
    },
  ],
};
