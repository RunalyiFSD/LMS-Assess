from typing import Dict, Any, Callable

class ToolManager:
    """Registers and executes function-calling tools for agents."""
    
    def __init__(self):
        self.tools: Dict[str, Callable] = {}
        self.tool_schemas: Dict[str, Dict[str, Any]] = {}
        
    def register_tool(self, name: str, func: Callable, schema: Dict[str, Any]):
        """Registers a Python function and its JSON schema."""
        self.tools[name] = func
        self.tool_schemas[name] = schema
        
    def execute_tool(self, name: str, arguments: Dict[str, Any]) -> Any:
        """Executes a registered tool with the provided arguments."""
        if name not in self.tools:
            raise ValueError(f"Tool {name} is not registered.")
            
        return self.tools[name](**arguments)
        
    def get_tool_schemas(self) -> list:
        """Returns the list of tools in the format expected by the LLM."""
        return [{"type": "function", "function": schema} for schema in self.tool_schemas.values()]
