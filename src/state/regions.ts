import { observable } from "@legendapp/state";
import type { Region } from "@/utils/types/person";

export const regions$ = observable<Record<string, Region>>({});
