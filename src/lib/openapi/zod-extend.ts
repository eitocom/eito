/**
 * Side-effect module: patch Zod with `.openapi()` before any schema is defined.
 * Import this at the top of schema modules that are registered in OpenAPI.
 */
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export { z };
