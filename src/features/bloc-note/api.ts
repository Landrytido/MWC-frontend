import { httpService } from "../../shared/services/httpService";
import { BlocNote, UpdateBlocNoteRequest } from "./types";

export const blocNoteApi = {
  get: (): Promise<BlocNote> => httpService.get("/bloc-note"),
  update: (data: UpdateBlocNoteRequest): Promise<BlocNote> =>
    httpService.put("/bloc-note", data),
  delete: (): Promise<void> => httpService.delete("/bloc-note"),
};
