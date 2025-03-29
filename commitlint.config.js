module.exports = {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "body-max-line-length": [2, "always", 500],
        "type-enum": [
            2,
            "always",
            [
                "build",
                "chore",
                "ci",
                "docs",
                "feat",
                "fix",
                "perf",
                "refactor",
                "revert",
                "style",
                "test",
            ],
        ],
    },
};
