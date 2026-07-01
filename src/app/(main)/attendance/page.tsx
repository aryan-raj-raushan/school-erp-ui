'use client';

import { PageHeader, PageCol, Div, Button, H3, P, Badge } from '@/components/ui';
import { Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AttendancePage() {
  const quickLinks = [
    {
      title: 'Mark Student Attendance',
      description: 'Record student attendance for today',
      href: '/attendance/students',
      icon: Users,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Mark Staff Attendance',
      description: 'Record staff member attendance',
      href: '/attendance/staffs',
      icon: Users,
      color: 'bg-purple-100 text-purple-700',
    },
    {
      title: 'Student Reports',
      description: 'View attendance reports and analytics',
      href: '/attendance/report/students',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-700',
    },
    {
      title: 'Staff Reports',
      description: 'View staff attendance summaries',
      href: '/attendance/report/staffs',
      icon: TrendingUp,
      color: 'bg-orange-100 text-orange-700',
    },
    {
      title: 'Gate Pass Management',
      description: 'Manage student gate passes',
      href: '/attendance/gate-pass',
      icon: Clock,
      color: 'bg-red-100 text-red-700',
    },
    {
      title: 'Dashboard Overview',
      description: 'View today\'s attendance summary',
      href: '/attendance/dashboard',
      icon: Calendar,
      color: 'bg-indigo-100 text-indigo-700',
    },
  ];

  return (
    <PageCol>
      <PageHeader
        title="Attendance Management"
        subtitle="Mark attendance, view reports, and manage gate passes"
      />

      <Div type="grid" cols={2} gap="lg">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Div
                type="col"
                gap="md"
                className="rounded-xl border border-border bg-card p-5 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer h-full"
              >
                <Div type="row" align="center" gap="md">
                  <Div className={`${link.color} p-3 rounded-lg`}>
                    <Icon size={24} />
                  </Div>
                  <Div type="col" gap="xs">
                    <H3 className="text-base font-semibold">{link.title}</H3>
                    <P color="muted" className="text-sm">{link.description}</P>
                  </Div>
                </Div>
              </Div>
            </Link>
          );
        })}
      </Div>

      <Div
        type="col"
        gap="md"
        className="rounded-xl border border-border bg-card p-5 mt-6"
      >
        <H3 className="font-semibold">Quick Tips</H3>
        <Div type="col" gap="sm">
          <Div type="row" gap="sm" align="start">
            <Badge>1</Badge>
            <P color="muted" className="text-sm">Use "Mark Student Attendance" to record daily attendance for all students in a class section</P>
          </Div>
          <Div type="row" gap="sm" align="start">
            <Badge>2</Badge>
            <P color="muted" className="text-sm">Access reports to view detailed attendance records, trends, and student statistics</P>
          </Div>
          <Div type="row" gap="sm" align="start">
            <Badge>3</Badge>
            <P color="muted" className="text-sm">Gate passes help manage student movement during school hours</P>
          </Div>
        </Div>
      </Div>
    </PageCol>
  );
}