import { observable } from "@legendapp/state";
import type { District } from "@/utils/types/person";

export const districts$ = observable<Record<string, District>>({});
