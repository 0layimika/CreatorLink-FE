'use client';

import { BarChart3, FileText, UserRoundCog } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { DashboardPageHeader, DashboardPanel, EmptyState } from '@/components/dashboard/DashboardUI';

export default function MediaKitPage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Media kit"
        title="Put your best work in one place"
        description="This builder is not live yet. Until it is ready, your profile and analytics are the reliable source of truth for brands."
      />

      <DashboardPanel>
        <EmptyState
          icon={FileText}
          title="The media kit builder is still cooking"
          description="We have kept this URL working for anyone who bookmarked it, but we will not pretend an unfinished feature is ready."
          action={
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/dashboard/links" variant="secondary">
                <UserRoundCog className="h-4 w-4" />
                Polish my page
              </ButtonLink>
              <ButtonLink href="/dashboard/analytics" variant="outline">
                <BarChart3 className="h-4 w-4" />
                View analytics
              </ButtonLink>
            </div>
          }
        />
      </DashboardPanel>
    </div>
  );
}
