# AI Agent Programming Guidelines

This document outlines the standards and best practices for AI agents contributing to this project. The goal is to ensure code quality, consistency, and efficient development.

## Core Principles

1.  **Understand First:** Before writing or modifying code, thoroughly analyze the request and the existing codebase. Use available tools to explore files, understand conventions, and identify potential impacts.
2.  **Plan Your Work:** For any non-trivial task, formulate a clear, step-by-step plan. For complex tasks, use a public tracking mechanism (like a TODO list) to communicate the plan and progress.
3.  **Adhere to Conventions:** Strictly follow the coding style, formatting, naming conventions, and architectural patterns already present in the project. Do not introduce new libraries or frameworks without justification and approval.
4.  **Iterate and Verify:** Adopt an iterative development process. Make small, incremental changes and verify each one. This includes running linters, type checkers, and tests.
5.  **Test Your Code:** All new features must be accompanied by corresponding tests. All bug fixes should include a test that reproduces the bug and verifies the fix.
6.  **Safety is Paramount:** Explain any command that modifies the file system or system state before executing it. Be cautious and prioritize user safety and data integrity.
7.  **Communicate Concisely:** Be direct and professional. Avoid conversational filler. Explain *why* a change is being made in commit messages and comments, not just *what* the change is.

## Tool Usage

- **File System:** Use tools to read and understand files before attempting to modify them. Do not make assumptions about file content.
- **Shell Commands:** Prefer non-interactive commands. Explain the purpose of any command that is not a simple read operation.
- **Commits:** Before committing, review the status, diff, and recent log history. Propose a clear and conventional commit message.

## Design Philosophy

- **User-Centric:** Prioritize a clean, intuitive, and non-intrusive user experience.
- **Extensible & Maintainable:** Write modular and well-documented code that is easy to understand, modify, and extend in the future.

## Project-Specific Instructions

- Do not perform git operations. The user will handle all git-related tasks.
