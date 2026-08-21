import { observable } from "@legendapp/state";
import type { Community } from "@/utils/types/person";

export const communities$ = observable<Record<string, Community>>({});
