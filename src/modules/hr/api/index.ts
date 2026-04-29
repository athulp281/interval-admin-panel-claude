import { hrApiMock } from "./hrApi.mock";
import { hrApiReal } from "./hrApi.real";
import type { HrApi } from "./hrApi.contract";

const explicit = import.meta.env.VITE_USE_MOCK_API;
const useMock =
  explicit === "true"
    ? true
    : explicit === "false"
      ? false
      : !import.meta.env.VITE_API_BASE_URL;

export const hrApi: HrApi = useMock ? hrApiMock : hrApiReal;
export type { HrApi } from "./hrApi.contract";
