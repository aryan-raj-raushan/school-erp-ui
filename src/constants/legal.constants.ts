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
  backToLogin: 'Back to sign in',
} as const;

export const PRIVACY_POLICY: LegalDocument = {
  title: 'Privacy Policy',
  lastUpdated: 'October 14, 2026',
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
