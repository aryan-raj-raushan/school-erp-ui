"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SETTINGS_ITEMS } from "@/constants/settings";
import { Div } from "@/components/ui/layout";
import { H1, H3, P } from "@/components/ui/typography";

export default function SettingsIndexPage() {
  return (
    <Div type="col" gap="lg">
      {/* Page header */}
      <Div type="col" gap="xs">
        <H1>Settings</H1>
        <P color="muted">
          Manage your institution's configuration and preferences.
        </P>
      </Div>

      {/* Grid of setting cards */}
      <Div type="grid" cols={2} gap="md">
        {SETTINGS_ITEMS.map((item) => (
          <Div boxCard>
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
    </Div>
  );
}
