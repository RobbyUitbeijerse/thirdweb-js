import { getProjects } from "@/api/projects";
import { type Team, getTeams } from "@/api/team";
import { AppFooter } from "@/components/blocks/app-footer";
import { TabPathLinks } from "@/components/ui/tabs";
import type { Account } from "@3rdweb-sdk/react/hooks/useApi";
import { AnnouncementBanner } from "components/notices/AnnouncementBanner";
import type React from "react";
import { getAuthTokenWalletAddress } from "../api/lib/getAuthToken";
import { TWAutoConnect } from "../components/autoconnect";
import { loginRedirect } from "../login/loginRedirect";
import { AccountHeader } from "./components/AccountHeader";
import { getValidAccount } from "./settings/getAccount";

export default async function AccountLayout(props: {
  children: React.ReactNode;
}) {
  const [teams, account, accountAddress] = await Promise.all([
    getTeams(),
    getValidAccount("/account"),
    getAuthTokenWalletAddress(),
  ]);

  if (!teams || !accountAddress) {
    loginRedirect("/account");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="flex grow flex-col">
        <HeaderAndNav
          teams={teams}
          twAccount={account}
          accountAddress={accountAddress}
        />
        {props.children}
      </div>
      <TWAutoConnect />
      <AppFooter />
    </div>
  );
}

async function HeaderAndNav(props: {
  teams: Team[];
  twAccount: Account;
  accountAddress: string;
}) {
  const teamsAndProjects = await Promise.all(
    props.teams.map(async (team) => ({
      team,
      projects: await getProjects(team.slug),
    })),
  );

  return (
    <div className="bg-card">
      <AnnouncementBanner />
      <AccountHeader
        teamsAndProjects={teamsAndProjects}
        account={props.twAccount}
        accountAddress={props.accountAddress}
      />
      <TabPathLinks
        tabContainerClassName="px-4 lg:px-6"
        links={[
          {
            path: "/account",
            name: "Overview",
            exactMatch: true,
          },
          {
            path: "/account/settings",
            name: "Settings",
          },
          {
            path: "/account/wallets",
            name: "Linked Wallets",
          },
          {
            path: "/account/devices",
            name: "Devices",
          },
        ]}
      />
    </div>
  );
}
