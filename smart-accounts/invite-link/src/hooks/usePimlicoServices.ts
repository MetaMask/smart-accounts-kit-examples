import { createPimlicoClient } from "permissionless/clients/pimlico";
import { useMemo } from "react";
import { http } from "viem";
import { createBundlerClient, createPaymasterClient } from "viem/account-abstraction";
import { useChainId } from "wagmi";

export function usePimlicoServices() {
  const chainId = useChainId();
  const pimlicoKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;

  const { bundlerClient, paymasterClient, pimlicoClient, error } = useMemo(() => {
    if (!pimlicoKey) {
      return {
        bundlerClient: undefined,
        paymasterClient: undefined,
        pimlicoClient: undefined,
        error: "Pimlico API key is not set",
      };
    }

    const baseUrl = `https://api.pimlico.io/v2/${chainId}/rpc?apikey=${pimlicoKey}`;
    const transport = http(baseUrl);

    return {
      bundlerClient: createBundlerClient({ transport }),
      paymasterClient: createPaymasterClient({ transport }),
      pimlicoClient: createPimlicoClient({ transport }),
      error: undefined,
    };

  }, [chainId, pimlicoKey]);

  return { bundlerClient, paymasterClient, pimlicoClient, error };
}
