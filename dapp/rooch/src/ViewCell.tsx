import { Args } from "@roochnetwork/rooch-sdk";
import {
    useRoochClientQuery,
  } from "@roochnetwork/rooch-sdk-kit";

export const view_cell_by_id = async (counterAddress: string, obj_id: string) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const resp = await useRoochClientQuery("executeViewFunction", {
        target: `${counterAddress}::cellsv6::view_cell_by_id`,
        args: [Args.objectId(obj_id)],
    });
    return resp?.data?.return_values?.map(value => value.decoded_value) || [];
}
