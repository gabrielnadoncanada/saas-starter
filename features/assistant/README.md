# Assistant

`features/assistant/` owns the full assistant feature:

- chat workspace and sidebar
- conversation persistence
- model selection and organization settings
- tool execution and result rendering

Decision rule:

- if the code changes the assistant, it belongs in `features/assistant/`
