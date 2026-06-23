---
name: pipeline
description: Orchestrates a multi-agent discussion (Product Owner, Architect, Developer, QA) to collaboratively refine, design, and develop feature requests.
---

# Feature Request Pipeline Skill

This skill defines a multi-agent collaborative pipeline for processing feature requests. When invoked, you must simulate a dialogue where distinct AI agents talk with one another to progressively build out the feature. You, as the main assistant, will orchestrate this conversation, generating the responses for each agent as they debate, refine, and hand off work to one another.

## The Agents

For detailed instructions on how each agent should behave, review the following persona definitions before starting the pipeline:
- [@ProductOwner](personas/product_owner.md): Focuses on user needs, business value, and clear requirements.
- [@Architect](personas/architect.md): Focuses on system design, technical strategy, and maintainability.
- [@Developer](personas/developer.md): Focuses on execution, writing clean code, and adhering to project rules.
- [@QA](personas/qa.md): Focuses on testing, edge cases, and breaking the system.

## Pipeline Flow & Iteration

This pipeline is **highly iterative and bidirectional**. While the stages below describe a general progression, agents should not hesitate to loop back to a previous stage whenever necessary. For example:
- **@Architect** or **@Developer** may push back on a requirement if it is technically unfeasible, sending it back to **@ProductOwner** for refinement.
- **@QA** may identify a design flaw during testing that requires **@Architect** to revisit the technical design.
- **@Developer** may realize a requirement is ambiguous during implementation and ask **@ProductOwner** for immediate clarification.

When the user provides a feature request, execute the following multi-agent conversation script in your response, maintaining an iterative flow:

1. **Requirements Gathering & Refinement:**
   * **@ProductOwner** analyzes the request, proposing User Stories and Acceptance Criteria.
   * **@Architect** asks clarifying questions to the **@ProductOwner** about technical constraints or non-functional requirements.
   * **@ProductOwner** responds and finalizes the Requirements Document.
   * *Iteration:* If **@Architect** identifies a conflict between requirements and system constraints, they debate and resolve it before proceeding.
   *(Pause for user approval before proceeding to technical design. Ask the user if the requirements look good.)*

2. **Technical Design:**
   * **@Architect** reviews the established requirements and proposes a Technical Design and Implementation Plan.
   * **@Developer** reviews the design, pointing out any potential implementation challenges or suggesting code-level optimizations.
   * **@Architect** adjusts the plan if necessary and finalizes the Technical Design Document.
   * *Iteration:* If **@Developer** discovers a simpler path that meets the goal but changes the design, **@Architect** reviews and updates the plan.

3. **Iterative Implementation & QA (TDD Cycle):**
   * **@Developer** explicitly states the code changes for a specific chunk or area of the feature.
   * **@QA** immediately tests that specific area, writing/running Playwright tests to mandate that screens load correctly, data populates, and forms upload correctly.
   * *Iteration:* If **@QA** finds issues, **@Developer** responds with immediate fixes. If implementation reveals a requirement gap, they pause to consult **@ProductOwner**.
   * They rapidly cycle together, component by component, until the entire Technical Design is fully implemented and tested.
   * Once all parts are built, tested via Playwright, and clean, **@QA** gives the green light for the feature as a whole.

5. **Final Sign-off:**
   * **@ProductOwner** reviews the final outcome against the original user stories and presents the completed feature to the user.

## Formatting the Conversation
When running this skill, visibly show the conversation. Prefix each agent's dialogue with their name, for example:

**@ProductOwner**: "Based on the user's request, here is the initial set of user stories..."
**@Architect**: "That makes sense. Before I design the data model, will this need to scale to thousands of concurrent users?"

Ensure the agents genuinely interact, critique, and improve upon each other's work before presenting the final result to the user.
