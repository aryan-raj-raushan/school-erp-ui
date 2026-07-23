"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SETTINGS_ITEMS } from "@/constants/settings";
import { Div } from "@/components/ui/layout";
import { H3, P } from "@/components/ui/typography";
import { PageHeader, PageCol, type PageHeaderConfig } from "@/components/ui";
import { useIsMobile } from "@/hooks/use-mobile";

export default function SettingsIndexPage() {
  const isMobile = useIsMobile();

  const pageHeaderConfig: PageHeaderConfig = {
    title: "Settings",
    subtitle: "Manage your institution's configuration and preferences.",
    backButton: isMobile,
  };

  return (
    <PageCol>
      <PageHeader {...pageHeaderConfig} />

      {/* Grid of setting cards */}
      <Div type="grid" cols={3} gap="md">
        {SETTINGS_ITEMS.map((item) => (
          <Div boxCard key={item.slug}>
            <Link key={item.slug} href={`/settings/${item.slug}`}>
              <Div type="row" justify="between" align="start" gap="md">
                <Div type="col" gap="sm">
                  {/* Icon + label */}
                  <Div type="row" align="center" gap="sm">
                    <Div type="row" align="center" justify="center">
                      <item.icon size={16} />
                    </Div>
                    <H3 color="default">{item.label}</H3>
                  </Div>

                  {/* Description */}
                  <P color="muted">{item.description}</P>
                </Div>

                {/* Arrow */}
                <ChevronRight size={16} />
              </Div>
            </Link>
          </Div>
        ))}
      </Div>
    </PageCol>
  );
}
