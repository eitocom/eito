import "@/lib/openapi/zod-extend";

import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import {
  createProjectSchema,
  updateProjectSchema,
} from "@/lib/projects/schema";
import { createTaskApiSchema } from "@/lib/tasks/schema";

export const openApiRegistry = new OpenAPIRegistry();

openApiRegistry.registerComponent("securitySchemes", "cookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: "sb-access-token",
  description:
    "Sessão Supabase via cookie (ex.: `sb-<ref>-auth-token`). Faça login em `/login` e reutilize o cookie no Try it.",
});

openApiRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description:
    "Alternativa Bearer JWT do Supabase, se enviada no header Authorization.",
});

const ErrorSchema = openApiRegistry.register(
  "ApiError",
  z.object({
    error: z.string(),
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
  }),
);

const CreateProjectBody = openApiRegistry.register(
  "CreateProjectBody",
  createProjectSchema,
);

const UpdateProjectBody = openApiRegistry.register(
  "UpdateProjectBody",
  updateProjectSchema,
);

const ProjectSummary = openApiRegistry.register(
  "ProjectSummary",
  z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    githubRepoUrl: z.string().url(),
    ownerId: z.string().optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
  }),
);

const CreateTaskBody = openApiRegistry.register(
  "CreateTaskBody",
  createTaskApiSchema,
);

const TaskSummary = openApiRegistry.register(
  "TaskSummary",
  z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    githubIssueUrl: z.string().url().nullable(),
    amountBrl: z.number(),
    status: z.string(),
    projectId: z.string(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
  }),
);

const TaskDetail = openApiRegistry.register(
  "TaskDetail",
  TaskSummary.extend({
    assignee: z
      .object({
        id: z.string(),
        name: z.string(),
        username: z.string(),
        avatarUrl: z.string().nullable(),
      })
      .nullable()
      .optional(),
    project: z
      .object({
        id: z.string(),
        slug: z.string(),
        title: z.string(),
        ownerId: z.string(),
      })
      .optional(),
  }),
);

const secured: Array<Record<string, string[]>> = [
  { cookieAuth: [] },
  { bearerAuth: [] },
];

const slugParam = z.object({
  slug: z.string().openapi({
    param: { description: "Slug estável do projeto", example: "meu-projeto" },
  }),
});

const taskIdParam = z.object({
  id: z.string().openapi({
    param: { description: "ID da tarefa (cuid)" },
  }),
});

function jsonResponse(schema: z.ZodType, description: string) {
  return {
    description,
    content: {
      "application/json": { schema },
    },
  };
}

function jsonRequestBody(schema: z.ZodType) {
  return {
    content: {
      "application/json": { schema },
    },
  };
}

openApiRegistry.registerPath({
  method: "get",
  path: "/api/projects",
  tags: ["Projects"],
  summary: "Listar projetos",
  description:
    "Lista projetos do mutirão. Use `mine=1` para filtrar os do usuário autenticado.",
  security: secured,
  request: {
    query: z.object({
      mine: z.enum(["1"]).optional().openapi({
        description: "Quando `1`, retorna apenas projetos do usuário logado.",
      }),
    }),
  },
  responses: {
    200: jsonResponse(
      z.object({ projects: z.array(ProjectSummary) }),
      "Lista de projetos",
    ),
    401: jsonResponse(ErrorSchema, "Não autenticado"),
  },
});

openApiRegistry.registerPath({
  method: "post",
  path: "/api/projects",
  tags: ["Projects"],
  summary: "Criar projeto",
  description: "Cria um projeto. Exige sessão e GitHub conectado.",
  security: secured,
  request: {
    body: jsonRequestBody(CreateProjectBody),
  },
  responses: {
    201: jsonResponse(z.object({ project: ProjectSummary }), "Projeto criado"),
    400: jsonResponse(ErrorSchema, "Payload inválido"),
    401: jsonResponse(ErrorSchema, "Não autenticado"),
    403: jsonResponse(ErrorSchema, "Sem permissão / GitHub não conectado"),
  },
});

openApiRegistry.registerPath({
  method: "get",
  path: "/api/projects/{slug}",
  tags: ["Projects"],
  summary: "Detalhe do projeto",
  security: secured,
  request: {
    params: slugParam,
  },
  responses: {
    200: jsonResponse(
      z.object({ project: ProjectSummary }),
      "Projeto encontrado",
    ),
    401: jsonResponse(ErrorSchema, "Não autenticado"),
    404: jsonResponse(ErrorSchema, "Projeto não encontrado"),
  },
});

openApiRegistry.registerPath({
  method: "patch",
  path: "/api/projects/{slug}",
  tags: ["Projects"],
  summary: "Atualizar projeto",
  description:
    "Atualiza título, descrição e URL do repositório. Apenas o owner. O slug permanece estável.",
  security: secured,
  request: {
    params: slugParam,
    body: jsonRequestBody(UpdateProjectBody),
  },
  responses: {
    200: jsonResponse(
      z.object({ project: ProjectSummary }),
      "Projeto atualizado",
    ),
    400: jsonResponse(ErrorSchema, "Payload inválido"),
    401: jsonResponse(ErrorSchema, "Não autenticado"),
    403: jsonResponse(ErrorSchema, "Apenas o owner"),
    404: jsonResponse(ErrorSchema, "Projeto não encontrado"),
  },
});

openApiRegistry.registerPath({
  method: "post",
  path: "/api/tasks",
  tags: ["Tasks"],
  summary: "Criar tarefa",
  description: "Cria bounty/tarefa no projeto. Apenas o owner.",
  security: secured,
  request: {
    body: jsonRequestBody(CreateTaskBody),
  },
  responses: {
    201: jsonResponse(z.object({ task: TaskSummary }), "Tarefa criada"),
    400: jsonResponse(ErrorSchema, "Payload inválido"),
    401: jsonResponse(ErrorSchema, "Não autenticado"),
    403: jsonResponse(ErrorSchema, "Apenas o owner"),
    404: jsonResponse(ErrorSchema, "Projeto não encontrado"),
  },
});

openApiRegistry.registerPath({
  method: "get",
  path: "/api/tasks/{id}",
  tags: ["Tasks"],
  summary: "Detalhe da tarefa",
  security: secured,
  request: {
    params: taskIdParam,
  },
  responses: {
    200: jsonResponse(z.object({ task: TaskDetail }), "Tarefa encontrada"),
    401: jsonResponse(ErrorSchema, "Não autenticado"),
    404: jsonResponse(ErrorSchema, "Tarefa não encontrada"),
  },
});

openApiRegistry.registerPath({
  method: "get",
  path: "/api/openapi",
  tags: ["Docs"],
  summary: "Especificação OpenAPI",
  description: "Retorna este documento OpenAPI 3.1 em JSON.",
  responses: {
    200: {
      description: "Documento OpenAPI",
      content: {
        "application/json": {
          schema: z.record(z.string(), z.unknown()),
        },
      },
    },
  },
});

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV31(openApiRegistry.definitions);

  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "Eito API",
      version: "1.0.0",
      description: "Documentação da API da plataforma Eito",
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        description: "Aplicação Eito",
      },
    ],
  });
}
