# Contributing to DeSNet TON

Thank you for your interest in contributing to DeSNet TON! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/desnet-ton.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit with clear messages: `git commit -m "feat: description of changes"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request

## Coding Standards

### FunC Smart Contracts
- Follow TON smart contract best practices
- Use descriptive variable and function names
- Include comments for complex logic
- Test with ton.js or toncli before submission

### TypeScript (Frontend & Backend)
- Use TypeScript strict mode
- Follow ESLint configuration
- Format with Prettier: `npm run format`
- Run tests: `npm test`

## Commit Messages

Use conventional commits format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `test:` for tests
- `refactor:` for code refactoring

Example: `feat: implement vote submission in governance contract`

## Pull Request Process

1. Ensure your code passes all tests
2. Update documentation if needed
3. Add/update tests for new functionality
4. Reference related issues in the PR description
5. Wait for review and address feedback

## Reporting Issues

Use GitHub Issues with clear titles and descriptions:
- **Bug reports:** Include reproduction steps
- **Feature requests:** Describe the use case
- **Questions:** Use Discussion tab when appropriate

## License

By contributing, you agree that your contributions will be licensed under The Unlicense.
