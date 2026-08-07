module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // Novas funcionalidades
        "fix", // Correções de bugs
        "docs", // Documentação (README, CONTRIBUTING, etc.)
        "style", // Formatação, CSS, UI sem alteração de lógica
        "refactor", // Reestruturação de código existente
        "perf", // Melhorias de performance
        "test", // Testes automatizados
        "build", // Alterações de build, pacotes ou Docker
        "ci", // Configurações de CI/CD (GitHub Actions)
        "chore", // Tarefas diversas (configs, .gitignore, etc.)
        "revert", // Reverter um commit anterior
      ],
    ],
  },
};
