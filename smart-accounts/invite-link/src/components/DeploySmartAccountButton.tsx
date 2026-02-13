"use client";

import useDelegatorSmartAccount from "@/hooks/useDelegatorSmartAccount";
import { useStepContext } from "@/hooks/useStepContext";
import { usePimlicoServices } from "@/hooks/usePimlicoServices";
import { useState } from "react";
import { zeroAddress } from "viem";
import Button from "@/components/Button";

export default function DeploySmartAccountButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { smartAccount } = useDelegatorSmartAccount();
  const { changeStep } = useStepContext();
  const { bundlerClient, paymasterClient, pimlicoClient, error: pimlicoError } =
    usePimlicoServices();

  const handleDeployDelegator = async () => {
    if (!smartAccount || !pimlicoClient || !bundlerClient) return;
    setLoading(true);
    setError(null);

    try {
      const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();

      const userOperationHash = await bundlerClient.sendUserOperation({
        account: smartAccount,
        calls: [
          {
            to: zeroAddress,
            value: 0n,
          },
        ],
        paymaster: paymasterClient,
        ...fee,
      });

      const { receipt } = await bundlerClient.waitForUserOperationReceipt({
        hash: userOperationHash,
      });

      console.log(receipt);
      changeStep(3);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to deploy smart account";
      console.error("Failed to deploy smart account:", error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (pimlicoError) {
    return (
      <div className="bg-red-800/20 border border-red-500/30 p-4 rounded-lg">
        <p className="text-sm text-red-400">{pimlicoError}</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-red-800/20 border border-red-500/30 p-4 rounded-lg mb-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      <Button onClick={handleDeployDelegator} disabled={loading}>
        {loading ? "Deploying Smart Account..." : "Deploy Smart Account"}
      </Button>
    </>
  );
}
