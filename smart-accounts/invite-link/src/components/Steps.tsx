"use client";

import { useEffect, useState } from "react";
import ConnectButton from "@/components/ConnectButton";
import CreateLinkButton from "@/components/CreateLinkButton";
import DeploySmartAccountButton from "@/components/DeploySmartAccountButton";
import ClaimRewardButton from "@/components/ClaimRewardButton";
import { useConnection } from "wagmi";
import useDelegatorSmartAccount from "@/hooks/useDelegatorSmartAccount";
import { useStepContext } from "@/hooks/useStepContext";
import AccountCard from "@/components/AccountCard";
import { decodeDelegations } from "@metamask/smart-accounts-kit/utils";
import { Hex } from "viem";
import { Delegation } from "@metamask/smart-accounts-kit";

export default function Steps() {
  const { step, changeStep } = useStepContext();
  const { isConnected } = useConnection();
  const [urlDelegation, setUrlDelegation] = useState<Delegation | null>(null);
  const { smartAccount } = useDelegatorSmartAccount();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedDelegation = urlParams.get("delegation");

    if (encodedDelegation) {
      try {
        const decodedDelegations = decodeDelegations(encodedDelegation as Hex);
        setUrlDelegation(decodedDelegations[0]);
        if (!isConnected) {
          changeStep(1);
        } else {
          changeStep(4);
        }
        return;
      } catch (error) {
        console.error("Failed to decode delegation from URL:", error);
      }
    }

    if (!isConnected) {
      changeStep(1);
      return;
    }

    if (smartAccount) {
      smartAccount.isDeployed().then((isDeployed) => {
        if (!isDeployed) {
          changeStep(2);
        } else {
          if (urlDelegation) {
            changeStep(4);
          } else {
            changeStep(3);
          }
        }
      });
    }
  }, [isConnected, smartAccount, changeStep, urlDelegation]);

  return (
    <>
      {isConnected && (
        <div className="mb-8 max-w-6xl mx-auto">
          <AccountCard />
        </div>
      )}

      {step === 1 && (
        <>
          <p className="text-white/70 max-w-4xl leading-relaxed">
            Connect your wallet to create invitation links.
            <br />
            <br />
            You can customize the Wagmi config to connect to any chain you want,
            and use the connector of your choice.
          </p>
          <ConnectButton />
        </>
      )}

      {step === 2 && (
        <>
          <p className="text-white/70 max-w-4xl leading-relaxed">
            Your smart account needs to be deployed. This is a one-time action.
            <br />
            <br />
            This transaction will be sponsored, so you don&apos;t have to pay for
            gas.
          </p>
          <DeploySmartAccountButton />
        </>
      )}

      {step === 3 && (
        <>
          <p className="text-white/70 max-w-4xl leading-relaxed">
            Create an invitation link to onboard users, and give them the link to
            claim rewards.
            <br />
            <br />
            The invitation will be limited to one use and a specific reward
            amount.
          </p>

          <CreateLinkButton />
        </>
      )}
      {step === 4 && (
        <>
          <p className="text-white/70 max-w-4xl leading-relaxed">
            Claim the reward by submitting a transaction on the network.
          </p>

          <ClaimRewardButton delegation={urlDelegation!} />
        </>
      )}
    </>
  );
}
