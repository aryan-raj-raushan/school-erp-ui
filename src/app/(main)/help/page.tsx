"use client";

import Link from "next/link";
import { Headset, Mail, MessageCircle, Phone } from "lucide-react";
import { Div, H2, P } from "@/components/ui";
import { PageHeader } from "@/components/ui/page-header";
import { useSchoolSupport } from "@/components/layout/SupportContact";

const QUICK_HELP = [
  { title: "Mark student attendance", description: "Pick the class and section, mark each student and save.", href: "/attendance/students" },
  { title: "Add a new student", description: "Fill the student, parent and class details; numbers are generated for you.", href: "/students/create-new" },
  { title: "Collect a fee", description: "Open the student's bills, record the payment and print the receipt.", href: "/fees/payments" },
  { title: "Apply for leave", description: "Choose the leave type and dates; your approver is notified.", href: "/leave/apply" },
  { title: "Update school details", description: "Change the school name, logo, address and contact numbers.", href: "/settings/school-profile" },
];

const contactLinkClass =
  "flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted";

export default function HelpPage() {
  const support = useSchoolSupport();
  const whatsappNumber = support?.phone ? `${support.dial_code}${support.phone}`.replace(/\D/g, "") : null;

  return (
    <Div type="col" gap="lg">
      <PageHeader title="Help & Support" subtitle="Get in touch or find how to do common tasks" />

      <Div type="col" gap="sm" className="rounded-xl border border-border bg-card p-5">
        <H2 className="flex items-center gap-2 text-base font-semibold">
          <Headset size={18} className="text-primary" /> Contact support
        </H2>
        {support ? (
          <Div type="col" gap="sm">
            {support.name && <P className="font-medium">{support.name}</P>}
            <Div type="row" gap="sm" className="flex-wrap">
              {support.phone && (
                <a href={`tel:${support.dial_code}${support.phone}`} className={contactLinkClass}>
                  <Phone size={15} className="text-primary" /> {support.dial_code} {support.phone}
                </a>
              )}
              {whatsappNumber && (
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className={contactLinkClass}>
                  <MessageCircle size={15} className="text-primary" /> WhatsApp
                </a>
              )}
              {support.email && (
                <a href={`mailto:${support.email}`} className={contactLinkClass}>
                  <Mail size={15} className="text-primary" /> {support.email}
                </a>
              )}
            </Div>
          </Div>
        ) : (
          <P color="muted" className="text-sm">
            Please contact your school administrator for help.
          </P>
        )}
      </Div>

      <Div type="col" gap="sm" className="rounded-xl border border-border bg-card p-5">
        <H2 className="text-base font-semibold">How do I…</H2>
        <Div type="col" gap="xs">
          {QUICK_HELP.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2.5 transition-colors hover:bg-muted">
              <P className="text-sm font-medium">{item.title}</P>
              <P color="muted" className="text-xs">
                {item.description}
              </P>
            </Link>
          ))}
        </Div>
      </Div>
    </Div>
  );
}
