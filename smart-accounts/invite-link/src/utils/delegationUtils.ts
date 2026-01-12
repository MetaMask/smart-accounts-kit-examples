import {
  createExecution,
  createOpenDelegation,
  Delegation,
  ExecutionMode,
  MetaMaskSmartAccount,
} from "@metamask/smart-accounts-kit";
import { DelegationManager } from "@metamask/smart-accounts-kit/contracts";
import { randomBytes } from "crypto";
import { Address, Hex, parseEther } from "viem";

export function prepareRootDelegation(delegator: MetaMaskSmartAccount): Delegation {
  return createOpenDelegation({
    scope: {
      type: "nativeTokenTransferAmount",
      maxAmount: parseEther("0.0001"),
    },
    from: delegator.address,
    environment: delegator.environment,
    salt: `0x${randomBytes(32).toString("hex")}`,
  });
}

export function prepareRedeemDelegationData(delegation: Delegation, recipient: Address): Hex {
  const execution = createExecution({
    target: recipient,
    value: parseEther("0.0001")
  });

  const data = DelegationManager.encode.redeemDelegations({
    delegations: [[delegation]],
    modes: [ExecutionMode.SingleDefault],
    executions: [[execution]],
  });

  return data;
}
