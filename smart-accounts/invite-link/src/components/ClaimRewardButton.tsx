"use client";

import { usePimlicoServices } from "@/hooks/usePimlicoServices";
import { prepareRedeemDelegationData } from "@/utils/delegationUtils";
import {
  Delegation,
  getSmartAccountsEnvironment,
} from "@metamask/smart-accounts-kit";
import { useState } from "react";
import { Hex } from "viem";
import Button from "./Button";
import useDelegatorSmartAccount from "@/hooks/useDelegatorSmartAccount";
import { useChainId, usePublicClient } from "wagmi";

export default function ClaimRewardButton({
  delegation,
}: {
  delegation: Delegation;
}) {
  const { smartAccount } = useDelegatorSmartAccount();
  const publicClient = usePublicClient();
  const [loading, setLoading] = useState(false);
  const [waitingForReceipt, setWaitingForReceipt] = useState(false);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [userOperationHash, setUserOperationHash] = useState<string | null>(
    null,
  );
  const [transactionHash, setTransactionHash] = useState<Hex | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chainId = useChainId();
  const { bundlerClient, paymasterClient, pimlicoClient, error: pimlicoError } =
    usePimlicoServices();

  const handleRedeemDelegation = async () => {
    if (!smartAccount) return;

    setLoading(true);
    setWaitingForReceipt(false);
    setWaitingForConfirmation(false);
    setUserOperationHash(null);
    setError(null);

    try {
      const redeemData = prepareRedeemDelegationData(
        delegation,
        smartAccount.address,
      );
      const { fast: fee } = await pimlicoClient!.getUserOperationGasPrice();

      const hash = await bundlerClient!.sendUserOperation({
        account: smartAccount,
        calls: [
          {
            to: getSmartAccountsEnvironment(chainId).DelegationManager,
            data: redeemData,
          },
        ],
        ...fee,
        paymaster: paymasterClient,
      });

      setUserOperationHash(hash);
      setWaitingForReceipt(true);
      setLoading(false);

      const { receipt } = await bundlerClient!.waitForUserOperationReceipt({
        hash: hash,
      });

      setTransactionHash(receipt.transactionHash);
      setWaitingForReceipt(false);
      setWaitingForConfirmation(true);

      // Wait for transaction to be confirmed on the blockchain
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({
          hash: receipt.transactionHash,
          confirmations: 1,
        });
      }

      setWaitingForConfirmation(false);
      console.log(receipt);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to redeem delegation";
      console.error("Error redeeming delegation:", error);
      setError(errorMessage);
      setLoading(false);
      setWaitingForReceipt(false);
      setWaitingForConfirmation(false);
      setUserOperationHash(null);
    }
  };

  if (transactionHash && !waitingForConfirmation) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="bg-green-800/20 border border-green-500/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-sm text-green-400">
            Reward Claimed Successfully!
          </h4>
          <p className="text-sm text-green-300">
            Your reward has been claimed and the transaction is confirmed on the
            blockchain.
          </p>
        </div>
        <Button
          onClick={() =>
            window.open(
              `https://sepolia.etherscan.io/tx/${transactionHash}`,
              "_blank",
            )
          }
        >
          View on Etherscan
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="bg-red-800/20 border border-red-500/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-sm text-red-400">
            Error
          </h4>
          <p className="text-sm text-red-300 break-words">{error}</p>
        </div>
        <Button onClick={() => setError(null)}>
          Try Again
        </Button>
      </div>
    );
  }

  if (pimlicoError) {
    return (
      <div className="max-w-2xl bg-red-800/20 border border-red-500/30 p-4 rounded-lg">
        <h4 className="font-semibold mb-2 text-sm text-red-400">
          Configuration Error
        </h4>
        <p className="text-sm text-red-300 break-words">{pimlicoError}</p>
      </div>
    );
  }

  if (waitingForConfirmation) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="bg-yellow-800/20 border border-yellow-500/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-sm text-yellow-400">
            Confirming Transaction
          </h4>
          <p className="text-sm text-yellow-300 mb-3">
            Waiting for the transaction to be confirmed on the blockchain.
          </p>
          {transactionHash && (
            <p className="text-xs text-yellow-400 font-mono break-all">
              Transaction: {transactionHash.slice(0, 10)}...
              {transactionHash.slice(-8)}
            </p>
          )}
        </div>
        <Button disabled className="opacity-50">
          Confirming...
        </Button>
      </div>
    );
  }

  if (waitingForReceipt) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="bg-blue-800/20 border border-blue-500/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-sm text-blue-400">
            Processing User Operation
          </h4>
          <p className="text-sm text-blue-300 mb-3">
            Your reward claim is being processed. This usually takes 10-30
            seconds.
          </p>
          {userOperationHash && (
            <p className="text-xs text-blue-400 font-mono break-all">
              User Operation: {userOperationHash.slice(0, 10)}...
              {userOperationHash.slice(-8)}
            </p>
          )}
        </div>
        <Button disabled className="opacity-50">
          Processing...
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleRedeemDelegation} disabled={loading || !delegation}>
      {loading
        ? "Preparing Claim..."
        : !delegation
          ? "No Invitation Available"
          : "Claim Reward"}
    </Button>
  );
}
