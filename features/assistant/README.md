# Assistant Boundary

`features/ai/` owns the AI infrastructure:
- conversation persistence
- model resolution
- organization AI settings
- lower-level server logic shared by assistant surfaces

`features/assistant/` owns the product UI:
- navigation
- chat workspace
- tool rendering
- empty, loading, and error presentation

Decision rule:
- if the code changes how the product looks or how a user moves through the assistant, it belongs in `features/assistant/`
- if the code changes model selection, conversation storage, or shared AI behavior, it belongs in `features/ai/`
